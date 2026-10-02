#!/usr/bin/env python3
"""Read-only, idempotent import of x's saved blog counters."""
import argparse
from pathlib import Path
import sqlite3
from store import Store


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    args = parser.parse_args()
    source = sqlite3.connect(args.source.resolve().as_uri() + "?mode=ro", uri=True)
    try:
        rows = source.execute("SELECT slug, view_count, updated_at FROM blog_post_views").fetchall()
    finally:
        source.close()
    added = Store(args.target).import_legacy(rows)
    print(f"Imported {len(rows)} posts; added {added} historical views.")


if __name__ == "__main__":
    main()
