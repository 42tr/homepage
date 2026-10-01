import snapshot from '../../../data/leetcode.json';
export function GET() {
  return new Response(JSON.stringify(snapshot), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
