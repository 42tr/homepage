#!/bin/sh
# Manual deployment for the current systemd host, run after a publish; counters stay in /var/lib.
set -eu
app_dir=/disk/app/homepage
registry_image=crpi-gz6f3ok0ezphywc8.cn-shanghai.personal.cr.aliyuncs.com/42tr/homepage
exec 9>/run/lock/homepage-update.lock
flock -n 9 || exit 0
if ! systemctl is-active --quiet homepage.service; then
    echo 'Homepage is stopped; skipping update.'
    exit 0
fi
. "$app_dir/image.env"
. "$app_dir/counter.env"
previous_image=$HOMEPAGE_IMAGE
docker pull "$registry_image:latest"
next_image=$(docker image inspect --format '{{json .RepoDigests}}' "$registry_image:latest" |
    python3 -c 'import json,sys; prefix=sys.argv[1]+"@sha256:"; print(next(d for d in json.load(sys.stdin) if d.startswith(prefix)))' "$registry_image")
if [ "$previous_image" = "$next_image" ]; then
    echo "Already running $next_image"
    exit 0
fi
previous_app=$(readlink "$app_dir/counter-app")
next_app="$app_dir/counter-releases/${next_image##*@sha256:}"
"$app_dir/prepare-counter-app.sh" "$next_image" "$next_app"
restart_counter=false
# Restart the counter only when backend code changed, LeetCode refresher included.
for file in "$previous_app"/*.py "$next_app"/*.py; do
    name=${file##*/}
    if ! cmp -s "$previous_app/$name" "$next_app/$name"; then
        restart_counter=true
        break
    fi
done
trap 'rm -f "$app_dir/image.env.next" "$app_dir/counter-app.next"' EXIT
ln -s "$next_app" "$app_dir/counter-app.next"
mv -Tf "$app_dir/counter-app.next" "$app_dir/counter-app"
cp "$app_dir/image.env" "$app_dir/image.env.previous"
printf 'HOMEPAGE_IMAGE=%s\n' "$next_image" > "$app_dir/image.env.next"
chmod 600 "$app_dir/image.env.next"
mv "$app_dir/image.env.next" "$app_dir/image.env"
deploy() {
    if "$restart_counter"; then systemctl restart homepage-views.service || return 1; fi
    systemctl restart homepage.service
}
if deploy; then
    echo "Updated homepage to $next_image; reading counts retained."
else
    echo "New image failed health checks; rolling back to $previous_image" >&2
    ln -s "$previous_app" "$app_dir/counter-app.next"
    mv -Tf "$app_dir/counter-app.next" "$app_dir/counter-app"
    cp "$app_dir/image.env.previous" "$app_dir/image.env.next"
    mv "$app_dir/image.env.next" "$app_dir/image.env"
    if "$restart_counter"; then systemctl restart homepage-views.service; fi
    systemctl reset-failed homepage.service
    systemctl restart homepage.service
    exit 1
fi
