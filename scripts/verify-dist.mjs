import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { getPosts } from '../src/lib/posts.mjs';

const root = new URL('../dist/', import.meta.url);
const home = await readFile(new URL('index.html', root), 'utf8');
const resume = await readFile(new URL('resume/index.html', root), 'utf8');
assert.match(home, /把想法/);
assert.match(home, /LeetCode/);
assert.match(resume, /工作经历/);
assert.match(resume, /data-print-resume/);
assert.doesNotMatch(home + resume, /astro-island|<router-link|<RouterLink|\/api\/auth|axios/);
for (const image of (home + resume).matchAll(/<img\b([^>]*)>/g)) {
  const src = image[1].match(/\bsrc="([^"]+)"/)?.[1];
  assert.ok(src, `Image missing its source: ${image[0]}`);
  if (src.startsWith('/')) await access(new URL(src.slice(1), root));
}
const snapshot = JSON.parse(await readFile(new URL('api/leetcode.json', root)));
assert.ok(snapshot.question_total > 0 && snapshot.updated_at);
const posts = await getPosts();
const listing = await readFile(new URL('blog/index.html', root), 'utf8');
const rss = await readFile(new URL('blog/rss.xml', root), 'utf8');
assert.equal((rss.match(/<item>/g) || []).length, posts.length);
assert.match(rss, /<content:encoded>/);
assert.doesNotMatch(rss, /(?:src|href)=["']\//);
for (const post of posts) {
  assert.ok(listing.includes(`/blog/posts/${post.slug}`));
  const html = await readFile(new URL(`blog/posts/${post.slug}/index.html`, root), 'utf8');
  assert.doesNotMatch(html, /<script|__BLOG_VIEW_COUNT/);
  for (const heading of post.toc) assert.ok(html.includes(`id="${heading.id}"`));
  for (const match of html.matchAll(/\b(?:src|poster)=["'](\/[^"']+)["']/g)) {
    await access(new URL(decodeURIComponent(match[1]).split(/[?#]/)[0].slice(1), root));
  }
}
const assets = await readdir(new URL('_astro/', root));
const css = await Promise.all(assets.filter((name) => name.endsWith('.css')).map((name) => readFile(new URL(`_astro/${name}`, root), 'utf8')));
assert.match(css.join('\n'), /@media print/);
let scriptBytes = 0;
for (const html of [home, resume]) {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = match[1].match(/src=["'](\/[^"']+)["']/)?.[1];
    scriptBytes += src ? (await readFile(new URL(src.slice(1), root))).length : Buffer.byteLength(match[2]);
  }
}
assert.ok(scriptBytes < 20000, `Unexpected client bundle: ${scriptBytes} bytes`);
console.log(`Verified home, resume, ${posts.length} posts, RSS, local media and LeetCode; client scripts total ${scriptBytes} bytes.`);
