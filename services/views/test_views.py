import concurrent.futures
from http.client import HTTPConnection
import json
from pathlib import Path
import tempfile
import threading
import unittest

from server import Posts, make_server
from store import Store


class ViewsTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.store = Store(self.root / "views.sqlite3")
        self.manifest = self.root / "posts.json"
        self.manifest.write_text('["post-56","post-55"]')
        self.server = make_server(("127.0.0.1", 0), self.store, Posts(self.manifest))
        self.thread = threading.Thread(target=self.server.serve_forever)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temporary.cleanup()

    def request(self, method, path, headers=None):
        connection = HTTPConnection("127.0.0.1", self.server.server_port, timeout=5)
        connection.request(method, path, headers=headers or {})
        response = connection.getresponse()
        content = response.read()
        result = response.status, json.loads(content) if content else None
        connection.close()
        return result

    def record(self, uri="/blog/posts/post-56", method="GET"):
        return self.request("POST", "/record", {"X-Original-Method": method, "X-Original-URI": uri})

    def test_import_is_idempotent_and_preserves_new_reads(self):
        rows = [("post-56", 21, 1), ("retired-post", 4, 2)]
        self.assertEqual(self.store.import_legacy(rows), 25)
        self.record()
        self.assertEqual(self.store.import_legacy(rows), 0)
        self.assertEqual(self.store.import_legacy([("post-56", 23, 3)]), 2)
        self.assertEqual(Store(self.store.database).counts(["post-56"]), {"post-56": 24})
        self.assertNotIn("retired-post", self.request("GET", "/api/blog/views")[1])

    def test_reads_and_heads_do_not_increment(self):
        self.assertEqual(self.request("GET", "/api/blog/views")[1]["post-56"], 0)
        self.assertEqual(self.request("HEAD", "/api/blog/views/post-56"), (200, None))
        self.record(method="HEAD")
        self.record(method="POST")
        self.assertEqual(self.store.counts(["post-56"])["post-56"], 0)
        self.record("/blog/posts/post-56/?from=rss")
        self.assertEqual(self.request("GET", "/api/blog/views/post-56")[1]["views"], 1)

    def test_unknown_paths_cannot_create_counters(self):
        for uri in ["/blog/posts/missing", "/blog", "/blog/rss.xml", "/blog/posts/post-56/index.html", "/blog/posts/../post-56"]:
            self.assertEqual(self.record(uri)[0], 404)
        self.assertEqual(self.request("POST", "/api/blog/views/post-56")[0], 405)
        self.assertEqual(self.request("GET", "/api/blog/views/missing")[0], 404)
        with self.store.connection() as db:
            self.assertEqual(db.execute("SELECT count(*) FROM blog_post_views").fetchone()[0], 0)

    def test_concurrent_visits_are_durable(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            statuses = list(executor.map(lambda _: self.record()[0], range(40)))
        self.assertEqual(statuses, [204] * 40)
        self.assertEqual(Store(self.store.database).counts(["post-56"])["post-56"], 40)

    def test_manifest_reloads_without_losing_old_counts(self):
        self.record()
        updated = self.root / "updated.json"
        updated.write_text('["post-56","post-new"]')
        updated.replace(self.manifest)
        self.assertEqual(self.record("/blog/posts/post-new")[0], 204)
        self.assertEqual(self.request("GET", "/api/blog/views")[1], {"post-56": 1, "post-new": 1})

    def test_invalid_import_rolls_back_entire_batch(self):
        with self.assertRaises(ValueError):
            self.store.import_legacy([("post-56", 21, 1), ("post-55", -1, 2)])
        self.assertEqual(self.store.counts(["post-56"])["post-56"], 0)


if __name__ == "__main__":
    unittest.main()
