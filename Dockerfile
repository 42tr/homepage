FROM rust:1.94-bookworm AS builder
WORKDIR /app

COPY backend /app/backend
COPY dist /app/dist
COPY .cargo /app/.cargo

WORKDIR /app/backend
RUN cargo build --release --locked

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --create-home --home-dir /nonexistent --shell /usr/sbin/nologin homepage \
    && mkdir /data \
    && chown homepage:homepage /data

COPY --from=builder /app/backend/target/release/homepage /usr/local/bin/homepage
USER homepage
ENV LISTEN=0.0.0.0:8080
ENV LEETCODE_REFRESH_SECONDS=600
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8080/health >/dev/null
ENTRYPOINT ["/usr/local/bin/homepage"]
