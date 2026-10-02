#!/usr/bin/env python3
"""Small counter service; article rendering remains entirely in Nginx."""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import signal
import sqlite3
import threading
from urllib.parse import urlsplit

from store import Store

SLUG = re.compile(r"[A-Za-z0-9_-]+")
ARTICLE = re.compile(r"/blog/posts/([A-Za-z0-9_-]+)/?")


class Posts:
    def __init__(self, path):
        self.path = Path(path)
        self.lock = threading.Lock()
        self.modified = None
        self.slugs = frozenset()
        self.get()

    def get(self):
        with self.lock:
            stat = self.path.stat()
            modified = (stat.st_ino, stat.st_size, stat.st_mtime_ns)
            if modified != self.modified:
                values = json.loads(self.path.read_text())
                if not isinstance(values, list) or not values or any(
                    not isinstance(value, str) or not SLUG.fullmatch(value) for value in values
                ):
                    raise ValueError("Invalid post manifest")
                self.slugs = frozenset(values)
                self.modified = modified
            return self.slugs


def make_server(address, store, posts):
    class Handler(BaseHTTPRequestHandler):
        def setup(self):
            super().setup()
            self.connection.settimeout(5)

        def send_json(self, status, payload=None):
            body = json.dumps(payload, separators=(",", ":")).encode() if payload is not None else b""
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD" and body:
                self.wfile.write(body)

        def do_HEAD(self):
            self.do_GET()

        def do_GET(self):
            try:
                path = urlsplit(self.path).path
                slugs = posts.get()
                if path == "/health":
                    store.counts(())
                    self.send_json(200, {"status": "ok"})
                elif path == "/api/blog/views":
                    self.send_json(200, store.counts(slugs))
                elif path.startswith("/api/blog/views/") and path[16:] in slugs:
                    slug = path[16:]
                    self.send_json(200, {"slug": slug, "views": store.counts((slug,))[slug]})
                else:
                    self.send_json(404, {"error": "not found"})
            except (OSError, ValueError, sqlite3.Error) as error:
                self.log_error("Counter read failed: %s", error)
                self.send_json(503, {"error": "counter unavailable"})

        def do_POST(self):
            if urlsplit(self.path).path != "/record":
                self.send_json(405, {"error": "method not allowed"})
                return
            if self.headers.get("X-Original-Method") != "GET":
                self.send_json(204)
                return
            try:
                path = urlsplit(self.headers.get("X-Original-URI", "")).path
                match = ARTICLE.fullmatch(path)
                if not match or match[1] not in posts.get():
                    self.send_json(404, {"error": "unknown post"})
                    return
                store.record(match[1])
                self.send_json(204)
            except (OSError, ValueError, sqlite3.Error) as error:
                self.log_error("Counter write failed: %s", error)
                self.send_json(503, {"error": "counter unavailable"})

    server = ThreadingHTTPServer(address, Handler)
    server.daemon_threads = False
    return server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", default="/data/blog-views.sqlite3")
    parser.add_argument("--posts", default="/app/posts.json")
    parser.add_argument("--listen", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8081)
    args = parser.parse_args()
    with make_server((args.listen, args.port), Store(args.database), Posts(args.posts)) as server:
        def stop(_signal, _frame):
            threading.Thread(target=server.shutdown, daemon=True).start()
        signal.signal(signal.SIGTERM, stop)
        signal.signal(signal.SIGINT, stop)
        server.serve_forever()


if __name__ == "__main__":
    main()
