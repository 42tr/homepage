import test from 'node:test';
import assert from 'node:assert/strict';
import { getPosts, renderMarkdown, absoluteContent } from '../src/lib/posts.mjs';

test('TOC is derived from parsed headings, ignoring code fences and recognizing setext', () => {
  const { html, toc } = renderMarkdown('# Title\n\n```text\n## Fake heading\n```\n\n## Real **heading**\n\nSetext\n------\n\n### Third\n');
  assert.deepEqual(toc.map(({ id }) => id), ['section-2', 'section-3', 'section-4']);
  assert.match(html, /<h2 id="section-2">Real <strong>heading<\/strong><\/h2>/);
  assert.ok(!toc.some(({ title }) => title.includes('Fake')));
});
test('unknown languages render as escaped text; Dockerfile and TOML are highlighted', () => {
  assert.match(renderMarkdown('```unknown\n<script>bad()</script>\n```').html, /(?:&lt;|&#x3C;)script/);
  for (const code of ['```dockerfile\nFROM nginx:stable-alpine\n```', '```toml\n[package]\nname = "example"\n```']) {
    assert.match(renderMarkdown(code).html, /style="color:/);
  }
});
test('RSS content uses absolute local images, video and links', () => {
  assert.equal(absoluteContent('<img src="/blog/images/a.png"><video poster="/a.jpg"></video><a href="#section-1">x</a>', 'https://42tr.cn'), '<img src="https://42tr.cn/blog/images/a.png"><video poster="https://42tr.cn/a.jpg"></video><a href="#section-1">x</a>');
});
test('all existing posts load, sort newest first and expose content', async () => {
  const posts = await getPosts();
  assert.ok(posts.length >= 50);
  assert.equal(new Set(posts.map(({ slug }) => slug)).size, posts.length);
  for (let index = 0; index < posts.length; index++) {
    assert.ok(posts[index].html.length > 0);
    if (index > 0) assert.ok(posts[index - 1].date >= posts[index].date);
  }
});
