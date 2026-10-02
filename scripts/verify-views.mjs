import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://127.0.0.1:8080';
const slug = 'post-55';
async function count() {
  const response = await fetch(`${base}/api/blog/views/${slug}`, { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return (await response.json()).views;
}
// The mirror runs asynchronously; allow a previous smoke request to finish.
await new Promise((resolve) => setTimeout(resolve, 100));
const before = await count();
for (const path of ['/blog', '/blog/rss.xml', '/blog/posts/missing']) {
  await fetch(`${base}${path}`, { signal: AbortSignal.timeout(5000) });
}
await fetch(`${base}/blog/posts/${slug}`, { method: 'HEAD' });
await new Promise((resolve) => setTimeout(resolve, 100));
assert.equal(await count(), before);
for (const path of [`/blog/posts/${slug}`, `/blog/posts/${slug}/?source=test`]) {
  assert.equal((await fetch(`${base}${path}`)).status, 200);
}
for (let attempt = 0; attempt < 30 && await count() !== before + 2; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 100));
}
assert.equal(await count(), before + 2);
assert.equal((await fetch(`${base}/_blog_view`, { method: 'POST' })).status, 404);
assert.equal((await fetch(`${base}/api/blog/views/${slug}`, { method: 'POST' })).status, 405);
console.log('Article GETs counted once; lists, RSS, HEADs and unknown posts did not increment.');
