use std::{
    collections::{BTreeMap, HashSet},
    env,
    net::SocketAddr,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
    time::Duration,
};

use anyhow::{anyhow, Context, Result};
use axum::{
    extract::{Path as AxumPath, State},
    http::{header, HeaderValue, Method, StatusCode, Uri},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use chrono::{SecondsFormat, Utc};
use reqwest::Client;
use rusqlite::{params, Connection};
use rust_embed::RustEmbed;
use serde_json::{json, Value};
use tokio::net::TcpListener;
use tower_http::compression::CompressionLayer;
use tracing::{error, info, warn};

#[derive(RustEmbed)]
#[folder = "../dist/"]
struct Assets;

#[derive(Clone)]
struct AppState {
    store: Arc<Store>,
    posts: Arc<HashSet<String>>,
    leetcode: Arc<LiveStats>,
}

struct Store {
    connection: Mutex<Connection>,
}

impl Store {
    fn open(path: &Path) -> Result<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("create database directory {}", parent.display()))?;
        }
        let connection = Connection::open(path)
            .with_context(|| format!("open SQLite database {}", path.display()))?;
        connection.execute_batch(
            "PRAGMA journal_mode=WAL;
             PRAGMA synchronous=FULL;
             CREATE TABLE IF NOT EXISTS blog_post_views (
                 slug TEXT PRIMARY KEY NOT NULL,
                 view_count INTEGER NOT NULL DEFAULT 0 CHECK(view_count >= 0),
                 updated_at INTEGER NOT NULL
             );",
        )?;
        Ok(Self {
            connection: Mutex::new(connection),
        })
    }

    fn counts(&self, slugs: &HashSet<String>) -> Result<BTreeMap<String, i64>> {
        let connection = self
            .connection
            .lock()
            .map_err(|_| anyhow!("SQLite lock poisoned"))?;
        let mut statement = connection.prepare("SELECT slug, view_count FROM blog_post_views")?;
        let stored = statement
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
            })?
            .collect::<rusqlite::Result<BTreeMap<_, _>>>()?;
        Ok(slugs
            .iter()
            .map(|slug| (slug.clone(), *stored.get(slug).unwrap_or(&0)))
            .collect())
    }

    fn count(&self, slug: &str) -> Result<i64> {
        let connection = self
            .connection
            .lock()
            .map_err(|_| anyhow!("SQLite lock poisoned"))?;
        match connection.query_row(
            "SELECT view_count FROM blog_post_views WHERE slug = ?1",
            [slug],
            |row| row.get(0),
        ) {
            Ok(value) => Ok(value),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(0),
            Err(error) => Err(error.into()),
        }
    }

    fn record(&self, slug: &str) -> Result<()> {
        let connection = self
            .connection
            .lock()
            .map_err(|_| anyhow!("SQLite lock poisoned"))?;
        connection.execute(
            "INSERT INTO blog_post_views (slug, view_count, updated_at)
             VALUES (?1, 1, ?2)
             ON CONFLICT(slug) DO UPDATE SET
                 view_count = view_count + 1,
                 updated_at = excluded.updated_at",
            params![slug, Utc::now().timestamp_micros()],
        )?;
        Ok(())
    }
}

struct LiveStats {
    client: Client,
    user_slug: String,
    cache_path: PathBuf,
    interval: Duration,
    snapshot: tokio::sync::RwLock<Value>,
}

impl LiveStats {
    fn new(user_slug: String, cache_path: PathBuf, seed: Value, interval: Duration) -> Arc<Self> {
        let snapshot = std::fs::read(&cache_path)
            .ok()
            .and_then(|bytes| serde_json::from_slice::<Value>(&bytes).ok())
            .filter(|value| value.get("user_slug").and_then(Value::as_str) == Some(&user_slug))
            .unwrap_or(seed);
        Arc::new(Self {
            client: Client::builder()
                .user_agent("42tr-homepage/1.0")
                .build()
                .expect("build HTTP client"),
            user_slug,
            cache_path,
            interval,
            snapshot: tokio::sync::RwLock::new(snapshot),
        })
    }

    fn start(self: &Arc<Self>) {
        let service = Arc::clone(self);
        tokio::spawn(async move { service.refresh_loop().await });
    }

    async fn current(&self) -> Value {
        self.snapshot.read().await.clone()
    }

    async fn refresh_loop(self: Arc<Self>) {
        loop {
            match self.refresh_once().await {
                Ok(snapshot) => {
                    *self.snapshot.write().await = snapshot.clone();
                    if let Err(error) = self.write_cache(&snapshot).await {
                        warn!(%error, "could not write LeetCode cache");
                    }
                    info!(
                        solved = snapshot["question_solved"].as_u64().unwrap_or_default(),
                        total = snapshot["question_total"].as_u64().unwrap_or_default(),
                        "LeetCode snapshot updated"
                    );
                }
                Err(error) => warn!(%error, "LeetCode refresh failed; retaining previous snapshot"),
            }
            tokio::time::sleep(self.interval).await;
        }
    }

    async fn write_cache(&self, snapshot: &Value) -> Result<()> {
        if let Some(parent) = self.cache_path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }
        let temporary = self.cache_path.with_extension("json.tmp");
        tokio::fs::write(&temporary, serde_json::to_vec_pretty(snapshot)?).await?;
        tokio::fs::rename(temporary, &self.cache_path).await?;
        Ok(())
    }

    async fn refresh_once(&self) -> Result<Value> {
        let profile = self
            .request(
                "https://leetcode.cn/graphql/",
                "query($userSlug:String!){userProfilePublicProfile(userSlug:$userSlug){siteRanking}}",
            )
            .await?;
        let contest = self
            .request(
                "https://leetcode.cn/graphql/noj-go/",
                "query($userSlug:String!){userContestRanking(userSlug:$userSlug){rating globalRanking globalTotalParticipants localRanking localTotalParticipants}}",
            )
            .await?;
        let calendar = self
            .request(
                "https://leetcode.cn/graphql/noj-go/",
                "query($userSlug:String!){userCalendar(userSlug:$userSlug){submissionCalendar}}",
            )
            .await?;
        let progress = self
            .request(
                "https://leetcode.cn/graphql/",
                "query($userSlug:String!){userProfileUserQuestionProgressV2(userSlug:$userSlug){numAcceptedQuestions{count} numFailedQuestions{count} numUntouchedQuestions{count}}}",
            )
            .await?;

        let progress = &progress["userProfileUserQuestionProgressV2"];
        let solved = question_count(&progress["numAcceptedQuestions"])?;
        let total = solved
            + question_count(&progress["numFailedQuestions"])?
            + question_count(&progress["numUntouchedQuestions"])?;
        let contest = contest["userContestRanking"].clone();
        let profile = profile["userProfilePublicProfile"].clone();
        let calendar = calendar["userCalendar"].clone();
        let submission_calendar = calendar["submissionCalendar"]
            .as_str()
            .ok_or_else(|| anyhow!("LeetCode calendar is missing"))?;
        Ok(json!({
            "user_slug": self.user_slug,
            "updated_at": Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
            "site_ranking": required_u64(&profile, "siteRanking")?,
            "rating": optional_u64(&contest, "rating"),
            "global_ranking": optional_u64(&contest, "globalRanking"),
            "global_total_participants": optional_u64(&contest, "globalTotalParticipants"),
            "local_ranking": optional_u64(&contest, "localRanking"),
            "local_total_participants": optional_u64(&contest, "localTotalParticipants"),
            "submission_calendar": submission_calendar,
            "question_total": total,
            "question_solved": solved,
        }))
    }

    async fn request(&self, endpoint: &str, query: &str) -> Result<Value> {
        let body = json!({
            "query": query,
            "variables": {"userSlug": self.user_slug},
        });
        let mut last_error = None;
        for attempt in 0..3 {
            let response = self
                .client
                .post(endpoint)
                .header("Referer", "https://leetcode.cn/")
                .json(&body)
                .timeout(Duration::from_secs(15))
                .send()
                .await;
            match response {
                Ok(response) => match response.error_for_status() {
                    Ok(response) => match response.json::<Value>().await {
                        Ok(payload) if payload.get("errors").is_none() => {
                            return payload["data"]
                                .as_object()
                                .map(|_| payload["data"].clone())
                                .ok_or_else(|| anyhow!("LeetCode response has no data"));
                        }
                        Ok(_) => last_error = Some(anyhow!("LeetCode GraphQL returned errors")),
                        Err(error) => last_error = Some(error.into()),
                    },
                    Err(error) => last_error = Some(error.into()),
                },
                Err(error) => last_error = Some(error.into()),
            }
            if attempt < 2 {
                tokio::time::sleep(Duration::from_secs(2_u64.pow(attempt))).await;
            }
        }
        Err(last_error.unwrap_or_else(|| anyhow!("LeetCode request failed")))
    }
}

fn required_u64(value: &Value, key: &str) -> Result<u64> {
    value
        .get(key)
        .and_then(Value::as_u64)
        .ok_or_else(|| anyhow!("LeetCode field {key} is missing"))
}

fn optional_u64(value: &Value, key: &str) -> u64 {
    value
        .get(key)
        .and_then(|value| {
            value.as_u64().or_else(|| {
                value
                    .as_f64()
                    .filter(|number| number.is_finite() && *number >= 0.0)
                    .map(|number| number.trunc() as u64)
            })
        })
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::optional_u64;
    use serde_json::json;

    #[test]
    fn optional_numbers_accept_decimal_contest_ratings() {
        let value = json!({"rating": 1717.297, "ranking": 12});
        assert_eq!(optional_u64(&value, "rating"), 1717);
        assert_eq!(optional_u64(&value, "ranking"), 12);
        assert_eq!(optional_u64(&json!({"rating": null}), "rating"), 0);
    }
}

fn question_count(value: &Value) -> Result<u64> {
    value
        .as_array()
        .ok_or_else(|| anyhow!("LeetCode question list is missing"))?
        .iter()
        .map(|item| required_u64(item, "count"))
        .sum()
}

async fn health() -> &'static str {
    "ok\n"
}

async fn all_views(State(state): State<AppState>) -> Response {
    match state.store.counts(&state.posts) {
        Ok(counts) => json_response(Json(counts)),
        Err(error) => {
            error!(%error, "could not read view counts");
            StatusCode::SERVICE_UNAVAILABLE.into_response()
        }
    }
}

async fn one_view(State(state): State<AppState>, AxumPath(slug): AxumPath<String>) -> Response {
    if !state.posts.contains(&slug) {
        return StatusCode::NOT_FOUND.into_response();
    }
    match state.store.count(&slug) {
        Ok(views) => json_response(Json(json!({"slug": slug, "views": views}))),
        Err(error) => {
            error!(%error, "could not read view count");
            StatusCode::SERVICE_UNAVAILABLE.into_response()
        }
    }
}

async fn leetcode_api(State(state): State<AppState>) -> Response {
    json_response(Json(state.leetcode.current().await))
}

async fn article(
    method: Method,
    State(state): State<AppState>,
    AxumPath(slug): AxumPath<String>,
) -> Response {
    if !state.posts.contains(&slug) {
        return not_found();
    }
    if method == Method::GET {
        if let Err(error) = state.store.record(&slug) {
            error!(%error, %slug, "could not record blog view");
        }
    }
    embedded_response(&format!("blog/posts/{slug}/index.html"), StatusCode::OK)
}

async fn asset(uri: Uri) -> Response {
    let path = uri.path().trim_start_matches('/');
    embedded_response(path, StatusCode::OK)
}

fn embedded_response(path: &str, status: StatusCode) -> Response {
    if path
        .split('/')
        .any(|part| part == ".." || part.contains('\\'))
    {
        return not_found();
    }
    let candidates = if path.ends_with('/') {
        vec![format!("{path}index.html"), path.to_owned()]
    } else if !path.rsplit('/').next().unwrap_or_default().contains('.') {
        let index = if path.is_empty() {
            "index.html".to_owned()
        } else {
            format!("{path}/index.html")
        };
        vec![index, path.to_owned()]
    } else {
        vec![path.to_owned()]
    };
    for candidate in candidates {
        if let Some(file) = Assets::get(&candidate) {
            let mut response = (status, file.data.into_owned()).into_response();
            let content_type = mime_guess::from_path(&candidate)
                .first_or_octet_stream()
                .to_string();
            response.headers_mut().insert(
                header::CONTENT_TYPE,
                HeaderValue::from_str(&content_type)
                    .unwrap_or(HeaderValue::from_static("application/octet-stream")),
            );
            let cache = if candidate.starts_with("_astro/") {
                "public, max-age=31536000, immutable"
            } else {
                "no-cache"
            };
            response
                .headers_mut()
                .insert(header::CACHE_CONTROL, HeaderValue::from_static(cache));
            return response;
        }
    }
    not_found()
}

fn json_response<T>(value: Json<T>) -> Response
where
    T: serde::Serialize,
{
    let mut response = value.into_response();
    response
        .headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    response
}

fn not_found() -> Response {
    if let Some(file) = Assets::get("404.html") {
        let mut response = (StatusCode::NOT_FOUND, file.data.into_owned()).into_response();
        response.headers_mut().insert(
            header::CONTENT_TYPE,
            HeaderValue::from_static("text/html; charset=utf-8"),
        );
        return response;
    }
    StatusCode::NOT_FOUND.into_response()
}

async fn shutdown_signal() {
    #[cfg(unix)]
    {
        let mut terminate =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
                .expect("install SIGTERM handler");
        tokio::select! {
            _ = tokio::signal::ctrl_c() => {},
            _ = terminate.recv() => {},
        }
    }
    #[cfg(not(unix))]
    {
        let _ = tokio::signal::ctrl_c().await;
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            env::var("RUST_LOG").unwrap_or_else(|_| "homepage=info,tower_http=info".to_owned()),
        )
        .init();

    let post_manifest =
        Assets::get("api/blog-posts.json").context("embedded post manifest missing")?;
    let posts: HashSet<String> =
        serde_json::from_slice(&post_manifest.data).context("parse embedded post manifest")?;
    anyhow::ensure!(!posts.is_empty(), "embedded post manifest is empty");
    let seed = Assets::get("api/leetcode.json").context("embedded LeetCode seed missing")?;
    let seed: Value = serde_json::from_slice(&seed.data).context("parse embedded LeetCode seed")?;

    let data_dir = PathBuf::from(env::var("DATA_DIR").unwrap_or_else(|_| "/data".to_owned()));
    let store = Arc::new(Store::open(&data_dir.join("blog-views.sqlite3"))?);
    let user_slug = env::var("LEETCODE_USER_SLUG").unwrap_or_else(|_| "U72xhfFR3l".to_owned());
    let interval = env::var("LEETCODE_REFRESH_SECONDS")
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .filter(|value| *value > 0)
        .unwrap_or(600);
    let leetcode = LiveStats::new(
        user_slug,
        data_dir.join("leetcode.json"),
        seed,
        Duration::from_secs(interval),
    );
    leetcode.start();

    let state = AppState {
        store,
        posts: Arc::new(posts),
        leetcode,
    };
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/leetcode", get(leetcode_api))
        .route("/api/blog/views", get(all_views))
        .route("/api/blog/views/{slug}", get(one_view))
        .route("/blog/posts/{slug}", get(article).head(article))
        .route("/blog/posts/{slug}/", get(article).head(article))
        .fallback(asset)
        .layer(CompressionLayer::new())
        .with_state(state);

    let address: SocketAddr = env::var("LISTEN")
        .unwrap_or_else(|_| "0.0.0.0:8080".to_owned())
        .parse()
        .context("parse LISTEN")?;
    let listener = TcpListener::bind(address).await?;
    info!(%address, "homepage server listening");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}
