import { readdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { createHighlighter } from 'shiki';

export const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const aliases = { shell: 'bash', sh: 'bash', zsh: 'bash', yml: 'yaml', js: 'javascript', ts: 'typescript', rs: 'rust', py: 'python', 'c++': 'cpp' };
const languages = ['bash', 'yaml', 'json', 'go', 'rust', 'python', 'javascript', 'typescript', 'html', 'css', 'sql', 'toml', 'dockerfile', 'c', 'cpp', 'java', 'xml', 'markdown', 'ini', 'diff', 'nginx'];
const highlighter = await createHighlighter({ themes: ['github-dark'], langs: languages });

export function renderMarkdown(content) {
  const headings = [];
  const parser = new Marked({ gfm: true, renderer: {
    heading({ tokens, depth }) {
      const title = this.parser.parseInline(tokens);
      const id = `section-${headings.length + 1}`;
      headings.push({ id, depth, title });
      return `<h${depth} id="${id}">${title}</h${depth}>\n`;
    },
    code({ text, lang = '' }) {
      const name = lang.split(/\s+/)[0].toLowerCase();
      const language = aliases[name] || name;
      return highlighter.codeToHtml(text, { lang: languages.includes(language) ? language : 'text', theme: 'github-dark' });
    },
  } });
  const html = parser.parse(content);
  const toc = headings.filter(({ depth }) => depth >= 2 && depth <= 4);
  return { html, toc };
}

export function absoluteContent(html, site) {
  return html.replace(/\b(href|src|poster)=(['"])([^'"]+)\2/g, (match, attr, quote, url) => {
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(url)) return match;
    return `${attr}=${quote}${escapeHTML(new URL(url, site).href)}${quote}`;
  });
}

let cached;
export function getPosts() {
  return cached ??= loadPosts();
}
async function loadPosts() {
  // Astro bundles this module into dist/.prerender; content stays at the project root.
  const directory = resolve('posts');
  const filenames = (await readdir(directory)).filter((name) => name.endsWith('.md'));
  const posts = await Promise.all(filenames.map(async (filename) => {
    const { data, content } = matter(await readFile(join(directory, filename), 'utf8'));
    const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
    if (!data.title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error(`Invalid front matter: ${filename}`);
    if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== 'string'))) throw new Error(`Invalid tags: ${filename}`);
    return { slug: filename.slice(0, -3), title: String(data.title), date, tags: data.tags || [], summary: data.summary || '', ...renderMarkdown(content) };
  }));
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
