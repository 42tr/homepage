FROM nginx:stable-alpine
LABEL org.opencontainers.image.source="https://github.com/42tr/homepage"
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
# Keep assets readable by the Nginx worker even when built with a private umask.
COPY --chmod=755 dist/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
