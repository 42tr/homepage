import rss from '@astrojs/rss';
import { getPosts, absoluteContent } from '../../lib/posts.mjs';
export async function GET(context) {
  return rss({
    title: '42tr · 博客',
    description: '软件实践、系统观察与 AI 探索。',
    site: context.site,
    items: (await getPosts()).map((post) => ({
      title: post.title, pubDate: new Date(`${post.date}T00:00:00+08:00`),
      description: post.summary, link: `/blog/posts/${post.slug}`,
      categories: post.tags, content: absoluteContent(post.html, context.site),
    })),
    customData: '<language>zh-cn</language>',
  });
}
