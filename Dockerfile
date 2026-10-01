FROM nginx:stable-alpine
LABEL org.opencontainers.image.source="https://github.com/42tr/homepage"
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
# Keep large, unchanged media and page layers reusable across hourly updates.
# The worker must be able to read builds created with a private umask, too.
COPY --chmod=755 dist/blog/ /usr/share/nginx/html/blog/
COPY --chmod=755 dist/_astro/ /usr/share/nginx/html/_astro/
COPY --chmod=755 dist/resume/ /usr/share/nginx/html/resume/
COPY --chmod=755 dist/404.html dist/star.png /usr/share/nginx/html/
COPY --chmod=755 dist/api/ /usr/share/nginx/html/api/
COPY --chmod=755 dist/index.html /usr/share/nginx/html/index.html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
