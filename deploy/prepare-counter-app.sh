#!/bin/sh
# Extract the counter code, post manifest and LeetCode seed from the exact website image.
set -eu
image=${1:?image required}
destination=${2:?destination required}
if [ -f "$destination/.ready" ]; then exit 0; fi
mkdir -p "$(dirname "$destination")"
stage=$(mktemp -d "$destination.tmp.XXXXXX")
container=
trap 'if [ -n "$container" ]; then docker rm "$container" >/dev/null; fi; rm -rf "$stage"' EXIT
container=$(docker create "$image")
docker cp "$container:/opt/homepage-views/." "$stage/"
docker cp "$container:/usr/share/nginx/html/api/blog-posts.json" "$stage/posts.json"
docker cp "$container:/usr/share/nginx/html/api/leetcode.json" "$stage/leetcode.json"
python3 -B - "$stage" <<'PY'
import ast, json, pathlib, re, sys
root = pathlib.Path(sys.argv[1])
for name in ['server.py', 'store.py', 'leetcode.py']:
    ast.parse((root / name).read_text())
posts = json.loads((root / 'posts.json').read_text())
assert isinstance(posts, list) and posts and all(isinstance(p, str) and re.fullmatch(r'[A-Za-z0-9_-]+', p) for p in posts)
sys.path.insert(0, str(root))
from leetcode import validate_snapshot
seed = json.loads((root / 'leetcode.json').read_text())
assert validate_snapshot(seed, seed.get('user_slug')) == seed
PY
chmod 755 "$stage"
chmod 644 "$stage"/*.py "$stage/posts.json" "$stage/leetcode.json"
touch "$stage/.ready"
mv "$stage" "$destination"
