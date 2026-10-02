import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://127.0.0.1:8080';
for (const [path, status, type] of [
  ['/', 200, 'text/html'], ['/resume', 200, 'text/html'], ['/resume/', 200, 'text/html'],
  ['/blog', 200, 'text/html'], ['/blog/', 200, 'text/html'], ['/blog/posts/post-56', 200, 'text/html'],
  ['/blog/rss.xml', 200, /(?:xml|rss)/], ['/api/leetcode', 200, 'application/json'],
  ['/api/leetcode.json', 200, 'application/json'],
  ['/health', 200, 'text/plain'], ['/missing-page', 404, 'text/html'],
  ['/blog/posts/missing', 404, 'text/html'], ['/_astro/missing.js', 404, 'text/html'],
]) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, status, path);
  const contentType = response.headers.get('content-type');
  assert.ok(type instanceof RegExp ? type.test(contentType) : contentType.includes(type), `${path}: ${contentType}`);
}
const home = await fetch(base);
assert.equal(home.headers.get('cache-control'), 'no-cache');
const html = await home.text();
const cssPath = html.match(/href="(\/_astro\/[^" ]+\.css)"/)[1];
const asset = await fetch(new URL(cssPath, base));
assert.equal(asset.headers.get('cache-control'), 'public, max-age=31536000, immutable');
// The backend answers with no-store; the build-time seed would say no-cache.
const live = await fetch(new URL('/api/leetcode', base), { signal: AbortSignal.timeout(5000) });
assert.equal(live.headers.get('cache-control'), 'no-store');
const data = await live.json();
assert.ok(data.question_total > 0 && data.updated_at);
const seed = await (await fetch(new URL('/api/leetcode.json', base))).json();
assert.ok(seed.question_total > 0 && seed.user_slug === data.user_slug);
const compressed = await fetch(new URL('/blog/posts/post-56', base), { headers: { 'Accept-Encoding': 'gzip' } });
assert.equal(compressed.headers.get('content-encoding'), 'gzip');
console.log('Nginx routes, JSON/XML types, real 404s, cache headers and gzip verified.');
