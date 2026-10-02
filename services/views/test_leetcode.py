from datetime import datetime, timezone
from http.client import HTTPConnection
import io
import json
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.error import HTTPError

from leetcode import QUERIES, LeetCode, build_snapshot, request_graphql, validate_snapshot
from server import Posts, make_server
from store import Store

PAYLOADS = {
    "profile": {"userProfilePublicProfile": {"siteRanking": 100}},
    "contest": {"userContestRanking": {"rating": 1500.9, "globalRanking": 20, "globalTotalParticipants": 1000, "localRanking": 10, "localTotalParticipants": 500}},
    "calendar": {"userCalendar": {"submissionCalendar": '{"123":2}'}},
    "progress": {"userProfileUserQuestionProgressV2": {"numAcceptedQuestions": [{"count": 10}, {"count": 20}], "numFailedQuestions": [{"count": 5}], "numUntouchedQuestions": [{"count": 100}]}},
}
STAMP = datetime(2026, 10, 1, tzinfo=timezone.utc)
SNAPSHOT = build_snapshot(PAYLOADS, "user", STAMP)


def responder(payloads, calls=None):
    def request(url, query, user_slug):
        if calls is not None:
            calls.append((url, user_slug))
        for name, (_, expected) in QUERIES.items():
            if query == expected:
                return payloads[name]
        raise AssertionError(f"unexpected query for {url}")
    return request


def offline(url, query, user_slug):
    raise OSError("offline")


def body(payload):
    return io.BytesIO(json.dumps(payload).encode())


class SnapshotTests(unittest.TestCase):
    def test_stats_are_counted_and_rankings_truncated(self):
        self.assertEqual(SNAPSHOT["question_solved"], 30)
        self.assertEqual(SNAPSHOT["question_total"], 135)
        self.assertEqual(SNAPSHOT["rating"], 1500)
        self.assertEqual(SNAPSHOT["updated_at"], "2026-10-01T00:00:00.000Z")
        without_contest = build_snapshot({**PAYLOADS, "contest": {"userContestRanking": None}}, "user", STAMP)
        self.assertEqual(without_contest["rating"], 0)
        self.assertEqual(json.loads(without_contest["submission_calendar"]), {"123": 2})

    def test_malformed_stats_cannot_produce_a_snapshot(self):
        for broken in [{"progress": {}}, {"profile": {}}, {"calendar": {"userCalendar": {}}},
                       {"progress": {"userProfileUserQuestionProgressV2": {"numAcceptedQuestions": [{"count": True}], "numFailedQuestions": [], "numUntouchedQuestions": []}}}]:
            with self.assertRaises(ValueError):
                build_snapshot({**PAYLOADS, **broken}, "user", STAMP)
        empty = {**PAYLOADS, "progress": {"userProfileUserQuestionProgressV2": {"numAcceptedQuestions": [], "numFailedQuestions": [], "numUntouchedQuestions": []}}}
        with self.assertRaises(ValueError):
            build_snapshot(empty, "user", STAMP)

    def test_stored_snapshots_are_revalidated(self):
        self.assertEqual(validate_snapshot(SNAPSHOT, "user"), SNAPSHOT)
        with self.assertRaises(ValueError):
            validate_snapshot(SNAPSHOT, "someone-else")
        for field in ["updated_at", "submission_calendar", "rating", "question_total"]:
            broken = dict(SNAPSHOT)
            broken[field] = "not-a-number" if field in ("rating", "question_total") else None
            with self.assertRaises(ValueError):
                validate_snapshot(broken, "user")
        impossible = dict(SNAPSHOT, question_solved=SNAPSHOT["question_total"] + 1)
        with self.assertRaises(ValueError):
            validate_snapshot(impossible, "user")


class RequestTests(unittest.TestCase):
    def test_http_and_graphql_errors_are_retried_before_valid_data(self):
        responses = [HTTPError("https://example.com", 429, "too many requests", None, None),
                     body({"errors": [{"message": "unavailable"}]}),
                     body({"data": PAYLOADS["profile"]})]
        sleeps = []
        calls = []

        def opener(request, timeout=None):
            calls.append((request.full_url, json.loads(request.data)["variables"], timeout))
            response = responses[len(calls) - 1]
            if isinstance(response, HTTPError):
                raise response
            return response

        data = request_graphql("https://example.com", "query{}", "user", opener=opener, sleeper=sleeps.append)
        self.assertEqual(data, PAYLOADS["profile"])
        self.assertEqual(sleeps, [1, 2])
        self.assertEqual(calls[0][1], {"userSlug": "user"})
        self.assertEqual(calls[0][2], 15)

    def test_persistent_outage_raises_the_last_error(self):
        def opener(request, timeout=None):
            raise OSError("connection reset")

        with self.assertRaises(OSError):
            request_graphql("https://example.com", "query{}", "user", opener=opener, sleeper=lambda _seconds: None)


class LeetCodeTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.seed = self.root / "leetcode.json"
        self.cache = self.root / "state" / "leetcode.json"
        self.messages = []

    def tearDown(self):
        self.temporary.cleanup()

    def source(self, request=offline, interval=600, user="user", seed=None, cache=None):
        return LeetCode(user, seed=str(seed if seed is not None else self.seed),
                        cache=str(cache if cache is not None else self.cache),
                        interval=interval, request=request, log=self.messages.append)

    def test_seed_is_served_until_a_refresh_succeeds(self):
        self.seed.write_text(json.dumps(SNAPSHOT))
        source = self.source()
        self.assertEqual(source.snapshot(), SNAPSHOT)
        self.assertFalse(self.cache.exists())
        self.assertEqual(self.source(responder(PAYLOADS)).refresh(STAMP), SNAPSHOT)
        self.assertEqual(json.loads(self.cache.read_text()), SNAPSHOT)

    def test_refresh_writes_a_durable_cache_that_wins_over_the_seed(self):
        self.seed.write_text(json.dumps(SNAPSHOT))
        calls = []
        source = self.source(responder({**PAYLOADS, "profile": {"userProfilePublicProfile": {"siteRanking": 7}}}, calls))
        updated = source.refresh(STAMP)
        self.assertEqual(updated["site_ranking"], 7)
        self.assertEqual([url for url, slug in calls], [pair[0] for pair in QUERIES.values()])
        self.assertEqual(json.loads(self.cache.read_text()), updated)
        self.assertEqual(self.source().snapshot(), updated)
        self.assertFalse(list(self.cache.parent.glob("*.tmp")))

    def test_outage_keeps_the_previous_snapshot_and_logs(self):
        self.seed.write_text(json.dumps(SNAPSHOT))
        source = self.source()
        with self.assertRaises(OSError):
            source.refresh()
        self.assertEqual(source.snapshot(), SNAPSHOT)
        self.assertFalse(self.cache.exists())

    def test_unusable_cache_and_foreign_user_fall_back_or_stay_empty(self):
        self.seed.write_text(json.dumps(SNAPSHOT))
        self.cache.parent.mkdir(parents=True)
        self.cache.write_text("{ truncated")
        self.assertEqual(self.source().snapshot(), SNAPSHOT)
        self.assertTrue(any("unusable" in message for message in self.messages))
        self.cache.write_text(json.dumps(SNAPSHOT))
        self.assertIsNone(self.source(user="someone-else").snapshot())
        self.cache.write_text(json.dumps(dict(SNAPSHOT, question_total=0)))
        self.assertEqual(self.source().snapshot(), SNAPSHOT)

    def test_snapshot_is_a_copy_and_cache_failures_do_not_break_refresh(self):
        self.seed.write_text(json.dumps(SNAPSHOT))
        source = self.source(responder(PAYLOADS), cache=self.root / "blocked" / "leetcode.json")
        self.root.joinpath("blocked").write_text("not a directory")
        updated = source.refresh(STAMP)
        self.assertEqual(updated["question_total"], 135)
        self.assertTrue(any("cache write failed" in message for message in self.messages))
        source.snapshot()["rating"] = 1
        self.assertEqual(source.snapshot()["rating"], updated["rating"])

    def test_background_thread_refreshes_every_interval_until_stopped(self):
        self.seed.write_text(json.dumps(SNAPSHOT))
        calls = []
        source = self.source(responder(PAYLOADS, calls), interval=1)
        source.start()
        for _ in range(100):
            if len(calls) >= 2 * len(QUERIES):
                break
            threading.Event().wait(0.05)
        source.stop()
        self.assertFalse(source.thread.is_alive())
        self.assertGreaterEqual(len(calls), 2 * len(QUERIES))
        self.assertEqual(json.loads(self.cache.read_text())["question_total"], 135)
        source.stop()


class RouteTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.manifest = self.root / "posts.json"
        self.manifest.write_text('["post-56"]')
        self.seed = self.root / "leetcode.json"

    def tearDown(self):
        self.temporary.cleanup()

    def serve(self, leetcode):
        server = make_server(("127.0.0.1", 0), Store(self.root / "views.sqlite3"), Posts(self.manifest), leetcode)
        thread = threading.Thread(target=server.serve_forever)
        thread.start()
        self.addCleanup(thread.join)
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        connection = HTTPConnection("127.0.0.1", server.server_port, timeout=5)
        self.addCleanup(connection.close)
        return connection

    def test_endpoint_serves_the_backend_snapshot_without_caching(self):
        self.seed.write_text(json.dumps(SNAPSHOT))
        connection = self.serve(LeetCode("user", seed=str(self.seed), cache=str(self.root / "cache.json")))
        connection.request("GET", "/api/leetcode")
        response = connection.getresponse()
        self.assertEqual(response.status, 200)
        self.assertEqual(response.getheader("Cache-Control"), "no-store")
        self.assertEqual(json.loads(response.read()), SNAPSHOT)

    def test_endpoint_reports_unavailable_instead_of_empty_data(self):
        connection = self.serve(LeetCode("user", seed=str(self.seed), cache=str(self.root / "cache.json")))
        connection.request("GET", "/api/leetcode")
        response = connection.getresponse()
        self.assertEqual(response.status, 503)
        self.assertEqual(json.loads(response.read()), {"error": "leetcode unavailable"})

    def test_counter_endpoints_are_unaffected(self):
        self.seed.write_text(json.dumps(SNAPSHOT))
        connection = self.serve(LeetCode("user", seed=str(self.seed), cache=str(self.root / "cache.json")))
        connection.request("GET", "/api/blog/views")
        response = connection.getresponse()
        self.assertEqual(response.status, 200)
        self.assertEqual(json.loads(response.read()), {"post-56": 0})
        connection.request("GET", "/api/leetcode/extra")
        self.assertEqual(connection.getresponse().status, 404)


if __name__ == "__main__":
    unittest.main()
