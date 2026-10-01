import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const queries = {
  profile: ['https://leetcode.cn/graphql/', 'query($userSlug:String!){userProfilePublicProfile(userSlug:$userSlug){siteRanking}}'],
  contest: ['https://leetcode.cn/graphql/noj-go/', 'query($userSlug:String!){userContestRanking(userSlug:$userSlug){rating globalRanking globalTotalParticipants localRanking localTotalParticipants}}'],
  calendar: ['https://leetcode.cn/graphql/noj-go/', 'query($userSlug:String!){userCalendar(userSlug:$userSlug){submissionCalendar}}'],
  progress: ['https://leetcode.cn/graphql/', 'query($userSlug:String!){userProfileUserQuestionProgressV2(userSlug:$userSlug){numAcceptedQuestions{count} numFailedQuestions{count} numUntouchedQuestions{count}}}'],
};

export async function requestGraphQL(endpoint, query, userSlug, { fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': '42tr-homepage/1.0', Referer: 'https://leetcode.cn/' },
        body: JSON.stringify({ query, variables: { userSlug } }), signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`LeetCode HTTP ${response.status}`);
      const result = await response.json();
      if (result.errors?.length || !result.data) throw new Error('LeetCode GraphQL returned errors or no data');
      return result.data;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastError;
}

export function buildSnapshot({ profile, contest, calendar, progress }, userSlug, now = new Date()) {
  const counts = progress?.userProfileUserQuestionProgressV2;
  const sum = (items) => {
    if (!Array.isArray(items) || items.some((item) => !Number.isInteger(item.count) || item.count < 0)) throw new Error('Invalid LeetCode question counts');
    return items.reduce((total, item) => total + item.count, 0);
  };
  const solved = sum(counts?.numAcceptedQuestions);
  const total = solved + sum(counts?.numFailedQuestions) + sum(counts?.numUntouchedQuestions);
  const ranking = contest?.userContestRanking;
  const integer = (value) => {
    if (!Number.isFinite(value) || value < 0) throw new Error('Invalid LeetCode ranking');
    return Math.trunc(value);
  };
  const submissionCalendar = calendar?.userCalendar?.submissionCalendar;
  if (typeof submissionCalendar !== 'string' || !JSON.parse(submissionCalendar) || total === 0) throw new Error('Invalid LeetCode calendar or total');
  return {
    user_slug: userSlug, updated_at: now.toISOString(),
    site_ranking: integer(profile?.userProfilePublicProfile?.siteRanking),
    rating: integer(ranking?.rating ?? 0),
    global_ranking: integer(ranking?.globalRanking ?? 0),
    global_total_participants: integer(ranking?.globalTotalParticipants ?? 0),
    local_ranking: integer(ranking?.localRanking ?? 0),
    local_total_participants: integer(ranking?.localTotalParticipants ?? 0),
    submission_calendar: submissionCalendar, question_total: total, question_solved: solved,
  };
}

export async function updateSnapshot({ file = new URL('../data/leetcode.json', import.meta.url), userSlug = process.env.LEETCODE_USER_SLUG || 'U72xhfFR3l', request = requestGraphQL } = {}) {
  try {
    const entries = await Promise.all(Object.entries(queries).map(async ([name, [url, query]]) => [name, await request(url, query, userSlug)]));
    const snapshot = buildSnapshot(Object.fromEntries(entries), userSlug);
    await mkdir(new URL('.', file), { recursive: true });
    const temporary = new URL(`${file.href}.tmp`);
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
    await rename(temporary, file);
    console.log(`LeetCode updated: ${snapshot.question_solved}/${snapshot.question_total}, ${snapshot.updated_at}`);
    return { updated: true, snapshot };
  } catch (error) {
    let snapshot;
    try { snapshot = JSON.parse(await readFile(file, 'utf8')); } catch { throw error; }
    if (snapshot.user_slug !== userSlug || !snapshot.updated_at || !(snapshot.question_total > 0)) throw error;
    console.warn(`LeetCode update failed (${error.message}); keeping snapshot from ${snapshot.updated_at}`);
    if (process.env.GITHUB_ACTIONS === 'true') console.log(`::warning::LeetCode unavailable; keeping snapshot from ${snapshot.updated_at}`);
    return { updated: false, snapshot };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await updateSnapshot();
}
