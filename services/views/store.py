"""Persistent blog counters shared by the HTTP service and legacy importer."""
from contextlib import contextmanager
from pathlib import Path
import sqlite3
import time


class Store:
    def __init__(self, database):
        self.database = Path(database)
        self.database.parent.mkdir(parents=True, exist_ok=True)
        with self.connection() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS blog_post_views (
                    slug TEXT PRIMARY KEY NOT NULL,
                    view_count INTEGER NOT NULL DEFAULT 0 CHECK(view_count >= 0),
                    updated_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS legacy_baselines (
                    source TEXT NOT NULL,
                    slug TEXT NOT NULL,
                    view_count INTEGER NOT NULL CHECK(view_count >= 0),
                    PRIMARY KEY(source, slug)
                );
            """)

    @contextmanager
    def connection(self):
        db = sqlite3.connect(self.database, timeout=10)
        db.execute("PRAGMA synchronous=FULL")
        try:
            with db:
                yield db
        finally:
            db.close()

    def counts(self, slugs):
        with self.connection() as db:
            stored = dict(db.execute("SELECT slug, view_count FROM blog_post_views"))
        return {slug: stored.get(slug, 0) for slug in sorted(slugs)}

    def record(self, slug):
        with self.connection() as db:
            db.execute("""
                INSERT INTO blog_post_views VALUES (?, 1, ?)
                ON CONFLICT(slug) DO UPDATE SET
                    view_count = view_count + 1, updated_at = excluded.updated_at
            """, (slug, time.time_ns() // 1000))

    def import_legacy(self, rows, source="x"):
        added = 0
        with self.connection() as db:
            db.execute("BEGIN IMMEDIATE")
            for slug, count, updated_at in rows:
                if not isinstance(slug, str) or type(count) is not int or count < 0:
                    raise ValueError("Invalid legacy counter")
                previous = db.execute(
                    "SELECT view_count FROM legacy_baselines WHERE source=? AND slug=?",
                    (source, slug),
                ).fetchone()
                baseline = previous[0] if previous else 0
                delta = max(count - baseline, 0)
                db.execute("""
                    INSERT INTO blog_post_views VALUES (?, ?, ?)
                    ON CONFLICT(slug) DO UPDATE SET
                        view_count = view_count + excluded.view_count,
                        updated_at = max(updated_at, excluded.updated_at)
                """, (slug, delta, updated_at))
                db.execute("""
                    INSERT INTO legacy_baselines VALUES (?, ?, ?)
                    ON CONFLICT(source, slug) DO UPDATE SET
                        view_count = max(view_count, excluded.view_count)
                """, (source, slug, count))
                added += delta
        return added
