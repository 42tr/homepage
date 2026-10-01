import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { buildSnapshot, requestGraphQL, updateSnapshot } from '../scripts/update-leetcode.mjs';

const fixture = {
  profile: { userProfilePublicProfile: { siteRanking: 100 } },
  contest: { userContestRanking: { rating: 1500.9, globalRanking: 20, globalTotalParticipants: 1000, localRanking: 10, localTotalParticipants: 500 } },
  calendar: { userCalendar: { submissionCalendar: '{"123":2}' } },
  progress: { userProfileUserQuestionProgressV2: { numAcceptedQuestions: [{ count: 10 }, { count: 20 }], numFailedQuestions: [{ count: 5 }], numUntouchedQuestions: [{ count: 100 }] } },
};
test('snapshot preserves stats and counts accepted, failed and untouched questions', () => {
  const snapshot = buildSnapshot(fixture, 'user', new Date('2026-10-01T00:00:00Z'));
  assert.equal(snapshot.question_solved, 30);
  assert.equal(snapshot.question_total, 135);
  assert.equal(snapshot.rating, 1500);
  assert.equal(snapshot.updated_at, '2026-10-01T00:00:00.000Z');
  assert.equal(buildSnapshot({ ...fixture, contest: { userContestRanking: null } }, 'user').rating, 0);
});
test('malformed stats cannot overwrite a valid snapshot', () => {
  assert.throws(() => buildSnapshot({ ...fixture, progress: {} }, 'user'));
  assert.throws(() => buildSnapshot({ ...fixture, profile: {} }, 'user'));
});
test('HTTP and GraphQL errors are retried before returning valid data', async () => {
  let calls = 0;
  const data = await requestGraphQL('https://example.com', 'query{}', 'user', {
    sleep: async () => {}, fetchImpl: async (_url, options) => {
      assert.equal(JSON.parse(options.body).variables.userSlug, 'user');
      calls++;
      if (calls === 1) return { ok: false, status: 429 };
      if (calls === 2) return { ok: true, json: async () => ({ errors: [{ message: 'unavailable' }] }) };
      return { ok: true, json: async () => ({ data: fixture.profile }) };
    },
  });
  assert.equal(calls, 3);
  assert.deepEqual(data, fixture.profile);
});
test('outage keeps existing bytes; missing or different-user fallback fails', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'homepage-leetcode-'));
  try {
    const file = pathToFileURL(join(directory, 'leetcode.json'));
    const request = async () => { throw new Error('offline'); };
    await assert.rejects(updateSnapshot({ file, userSlug: 'user', request }), /offline/);
    const bytes = JSON.stringify(buildSnapshot(fixture, 'user'));
    await writeFile(file, bytes);
    const result = await updateSnapshot({ file, userSlug: 'user', request });
    assert.equal(result.updated, false);
    assert.equal(await readFile(file, 'utf8'), bytes);
    await assert.rejects(updateSnapshot({ file, userSlug: 'different', request }), /offline/);
  } finally { await rm(directory, { recursive: true }); }
});
