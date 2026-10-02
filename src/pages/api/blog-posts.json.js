import { getPosts } from '../../lib/posts.mjs';
export async function GET() {
  return new Response(JSON.stringify((await getPosts()).map(({ slug }) => slug)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
