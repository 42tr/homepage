"""LeetCode snapshot served by the counter process and refreshed in the background.

The static site ships a build-time snapshot; this module keeps a live copy that
survives restarts and never blocks the HTTP handlers.
"""
from datetime import datetime, timezone
import json
import math
from pathlib import Path
import threading
import time
import urllib.request

DEFAULT_USER = "U72xhfFR3l"
REFRESH_SECONDS = 600
TIMEOUT_SECONDS = 15
ATTEMPTS = 3

FIELDS = (
    "user_slug", "updated_at", "site_ranking", "rating", "global_ranking",
    "global_total_participants", "local_ranking", "local_total_participants",
    "submission_calendar", "question_total", "question_solved",
)
INTEGER_FIELDS = (
    "site_ranking", "rating", "global_ranking", "global_total_participants",
    "local_ranking", "local_total_participants", "question_total", "question_solved",
)

QUERIES = {
    "profile": ("https://leetcode.cn/graphql/", "query($userSlug:String!){userProfilePublicProfile(userSlug:$userSlug){siteRanking}}"),
    "contest": ("https://leetcode.cn/graphql/noj-go/", "query($userSlug:String!){userContestRanking(userSlug:$userSlug){rating globalRanking globalTotalParticipants localRanking localTotalParticipants}}"),
    "calendar": ("https://leetcode.cn/graphql/noj-go/", "query($userSlug:String!){userCalendar(userSlug:$userSlug){submissionCalendar}}"),
    "progress": ("https://leetcode.cn/graphql/", "query($userSlug:String!){userProfileUserQuestionProgressV2(userSlug:$userSlug){numAcceptedQuestions{count} numFailedQuestions{count} numUntouchedQuestions{count}}}"),
}
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "42tr-homepage/1.0",
    "Referer": "https://leetcode.cn/",
}


def integer(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value < 0:
        raise ValueError("Invalid LeetCode ranking")
    return int(value)


def question_count(items):
    if not isinstance(items, list) or any(
        not isinstance(item, dict) or type(item.get("count")) is not int or item["count"] < 0 for item in items
    ):
        raise ValueError("Invalid LeetCode question counts")
    return sum(item["count"] for item in items)


def validate_snapshot(value, user_slug):
    """Return a copy of a stored snapshot, or raise ValueError if it is unusable."""
    if not isinstance(value, dict) or value.get("user_slug") != user_slug:
        raise ValueError("LeetCode snapshot belongs to another user")
    if not isinstance(value.get("updated_at"), str) or not value["updated_at"]:
        raise ValueError("Invalid LeetCode timestamp")
    calendar = value.get("submission_calendar")
    if not isinstance(calendar, str) or not isinstance(json.loads(calendar), dict):
        raise ValueError("Invalid LeetCode calendar")
    for field in INTEGER_FIELDS:
        if type(value.get(field)) is not int or value[field] < 0:
            raise ValueError(f"Invalid LeetCode field {field}")
    if value["question_total"] == 0 or value["question_solved"] > value["question_total"]:
        raise ValueError("Invalid LeetCode totals")
    return {field: value[field] for field in FIELDS}


def build_snapshot(payloads, user_slug, now=None):
    progress = (payloads.get("progress") or {}).get("userProfileUserQuestionProgressV2") or {}
    solved = question_count(progress.get("numAcceptedQuestions"))
    total = solved + question_count(progress.get("numFailedQuestions")) + question_count(progress.get("numUntouchedQuestions"))
    contest = (payloads.get("contest") or {}).get("userContestRanking") or {}
    profile = (payloads.get("profile") or {}).get("userProfilePublicProfile") or {}
    calendar = (payloads.get("calendar") or {}).get("userCalendar") or {}
    stamp = (now or datetime.now(timezone.utc)).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    return validate_snapshot({
        "user_slug": user_slug,
        "updated_at": stamp,
        "site_ranking": integer(profile.get("siteRanking")),
        "rating": integer(contest.get("rating", 0)),
        "global_ranking": integer(contest.get("globalRanking", 0)),
        "global_total_participants": integer(contest.get("globalTotalParticipants", 0)),
        "local_ranking": integer(contest.get("localRanking", 0)),
        "local_total_participants": integer(contest.get("localTotalParticipants", 0)),
        "submission_calendar": calendar.get("submissionCalendar"),
        "question_total": total,
        "question_solved": solved,
    }, user_slug)


def request_graphql(endpoint, query, user_slug, opener=urllib.request.urlopen, sleeper=time.sleep):
    body = json.dumps({"query": query, "variables": {"userSlug": user_slug}}).encode()
    last_error = None
    for attempt in range(ATTEMPTS):
        try:
            with opener(urllib.request.Request(endpoint, data=body, headers=HEADERS), timeout=TIMEOUT_SECONDS) as response:
                payload = json.loads(response.read().decode())
            if payload.get("errors") or not payload.get("data"):
                raise ValueError("LeetCode GraphQL returned errors or no data")
            return payload["data"]
        except (OSError, ValueError) as error:
            last_error = error
            if attempt < ATTEMPTS - 1:
                sleeper(2 ** attempt)
    raise last_error


class LeetCode:
    """Last good snapshot plus a daemon thread refreshing it every interval."""

    def __init__(self, user_slug=DEFAULT_USER, seed=None, cache=None, interval=REFRESH_SECONDS,
                 request=request_graphql, log=None):
        self.user_slug = user_slug
        self.seed = Path(seed) if seed else None
        self.cache = Path(cache) if cache else None
        self.interval = max(1, int(interval))
        self.request = request
        self.log = log or (lambda message: None)
        self.lock = threading.Lock()
        self.stopped = threading.Event()
        self.thread = None
        self.current = self._read(self.cache) or self._read(self.seed)

    def _read(self, path):
        # A missing seed or cache is normal on first boot; only report broken files.
        if not path or not path.is_file():
            return None
        try:
            return validate_snapshot(json.loads(path.read_text()), self.user_slug)
        except (OSError, ValueError) as error:
            self.log(f"LeetCode snapshot {path} unusable: {error}")
            return None

    def snapshot(self):
        with self.lock:
            return dict(self.current) if self.current else None

    def refresh(self, now=None):
        payloads = {name: self.request(url, query, self.user_slug) for name, (url, query) in QUERIES.items()}
        snapshot = build_snapshot(payloads, self.user_slug, now)
        with self.lock:
            self.current = snapshot
        self._write(snapshot)
        return snapshot

    def _write(self, snapshot):
        if not self.cache:
            return
        try:
            self.cache.parent.mkdir(parents=True, exist_ok=True)
            temporary = self.cache.with_name(f"{self.cache.name}.tmp")
            temporary.write_text(json.dumps(snapshot, indent=2) + "\n")
            temporary.replace(self.cache)
        except OSError as error:
            self.log(f"LeetCode cache write failed: {error}")

    def run_forever(self):
        while not self.stopped.is_set():
            try:
                snapshot = self.refresh()
                self.log(f"LeetCode updated: {snapshot['question_solved']}/{snapshot['question_total']}, {snapshot['updated_at']}")
            except (OSError, ValueError) as error:
                self.log(f"LeetCode refresh failed ({error}); keeping previous snapshot")
            self.stopped.wait(self.interval)

    def start(self):
        if not self.thread:
            self.thread = threading.Thread(target=self.run_forever, name="leetcode", daemon=True)
            self.thread.start()
        return self.thread

    def stop(self):
        self.stopped.set()
        if self.thread:
            self.thread.join(timeout=TIMEOUT_SECONDS)
