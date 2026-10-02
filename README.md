# homepage

42tr 的独立个人网站，包含主页、简历、51 篇 Markdown 博客、RSS、阅读计数和 LeetCode 数据。由 x 拆出，使用 Astro 在构建时生成完整 HTML；Vue 仅用于构建时渲染现有页面。页面由 Nginx 提供，阅读计数由独立的 Python 标准库服务和 SQLite 保存，不依赖 x 或 Firefly。

## 本地开发与构建

需要 Node.js 24 和 npm。

```sh
npm ci
npm run update:leetcode
npm run dev
```

```sh
npm test
npm run build
npm run verify
npm run preview
```

`npm run build` 使用已有 LeetCode 快照，保证离线也能构建；`npm run update:leetcode` 单独更新数据。`SITE_URL` 默认为 `https://42tr.cn`，`LEETCODE_USER_SLUG` 默认为 `U72xhfFR3l`。修改用户后需要先更新快照。

| 路径 | 内容 |
| --- | --- |
| `/` | 个人主页、技能、经历与 LeetCode 数据 |
| `/resume` | 简历，支持浏览器打印为一页 A4 PDF |
| `/blog` | 博客列表 |
| `/blog/posts/<slug>` | 博客文章，保持原文章路径 |
| `/blog/rss.xml` | 包含全文及绝对媒体链接的 RSS |
| `/api/leetcode`、`/api/leetcode.json` | 同一个静态 JSON 快照 |
| `/api/blog/views`、`/api/blog/views/<slug>` | 全部文章或单篇文章的实时阅读计数，只读 |
| `/health` | Nginx 健康检查 |

## 内容与实现

- 主页和简历保留原布局，直接输出 HTML；关闭 JavaScript 仍能阅读。时钟、技能展开/收起和打印使用少量原生脚本，无浏览器框架或接口依赖。
- 文章位于 `posts/*.md`，图片和视频位于 `public/blog/images/`。动图使用 MP4（H.264）加 AV1 WebM 双份 `<source>`，并带 poster 首帧，不再使用 GIF。Front matter 包含 `title`、`date`、可选 `tags` 和 `summary`。文章按日期降序排列。
- Markdown、代码高亮和目录在构建时生成，目录使用解析后的标题，避免把代码块内的标题误认为章节。未知语言退回转义后的普通文本。
- RSS 包含全文，站内图片和视频地址转换为绝对地址。站点 canonical 和 RSS 地址使用 `SITE_URL`。
- LeetCode 在构建前并发获取四组公开数据，单次请求 15 秒超时、最多重试三次；失败时保留同一用户的上次成功快照及真实更新时间。没有可用快照时构建流程失败，不发布空数据。
- HTML、RSS 和 JSON 使用 `no-cache`；带内容哈希的 `/_astro/` 资源缓存一年。Nginx 启用 gzip，未知地址返回真正的 404。
- Docker 将博客媒体、静态页面与每小时变化的主页、JSON 分层，LeetCode 更新不会重新上传和拉取整套 9 MB 媒体。
- 列表与文章页显示实时阅读计数。Nginx 将文章 GET 请求镜像到计数服务，沿用原来的页面浏览量规则；列表、RSS、HEAD、未知文章与查询计数接口不会增加计数。不开 JavaScript 也会统计访问，页面正文不依赖计数服务；服务暂不可用时隐藏计数。
- SQLite 使用 WAL 和逐次提交，避免重启丢失已提交的阅读计数。只有构建清单内的文章允许新增计数；Nginx 的写入口为内部请求，公网仅开放查询。

## GitHub Actions 与镜像

推送 `main`、手动触发和每小时第 17 分钟触发发布。GitHub 定时任务采用 UTC，并可能排队延迟；只有默认分支会运行定时工作流。

工作流执行单元测试 → 更新 LeetCode → 生成并验证 `dist/` → 构建并检查 Nginx 镜像 → 发布 `linux/amd64`、`linux/arm64` 镜像。推送和手动运行还会检查浏览器交互、响应式布局和一页 PDF，并上传可下载的 `homepage-static` 静态资源包，保留一天。定时运行不反复上传相同的大体积媒体文件，避免消耗 Actions artifact 配额。

同一次构建先发布到 GHCR，再按构建摘要同步到阿里云，均支持 `linux/amd64` 和 `linux/arm64`：

- `ghcr.io/42tr/homepage:latest`
- `crpi-gz6f3ok0ezphywc8.cn-shanghai.personal.cr.aliyuncs.com/42tr/homepage:latest`

两个仓库同时发布 `sha-<commit>` 和 `run-<run-id>-<attempt>` 标签；每小时同一提交的数据会更新，`run-*` 可固定某一次构建。GHCR 使用 Actions 的 `GITHUB_TOKEN` 登录，阿里云使用仓库 Secrets `ALIYUN_REGISTRY_USERNAME` 和 `ALIYUN_REGISTRY_PASSWORD`。PR 仅构建验证，不登录或推送仓库。仓库 Variables 可设置 `SITE_URL` 和 `LEETCODE_USER_SLUG`。

同步使用 Skopeo 复制全部架构，保留原始镜像摘要并逐个校验目标标签；网络错误最多重试三次。阿里云同步阶段限时 40 分钟，整个任务限时 50 分钟，允许首次上传大体积静态层，并保持在每小时触发间隔内。发布按分支串行运行，后续触发不会取消正在上传的任务。先发布本次运行和提交标签，全部内容上传后再更新 `latest`。

阿里云个人版拒绝构建证明附件的 `application/vnd.oci.empty.v1+json` manifest，发布时关闭自动 provenance 附件；两个仓库仍使用相同的双架构镜像索引和内容摘要。

GitHub Container Registry 首次发布的包可能为私有；公开拉取前在包设置中设为 Public，或使用有 `read:packages` 权限的凭据执行 `docker login ghcr.io`。

## Docker 运行

```sh
npm run build
docker build -t homepage:local .
HOMEPAGE_IMAGE=homepage:local docker compose up -d --wait
```

使用已发布的镜像：

```sh
docker compose pull
docker compose up -d --wait
```

`compose.yaml` 默认映射 `3000:80`。如果旧 x 已占用 3000，请先调整端口，再在现有反向代理中把个人网站和博客路由指向新容器。博客子域名的根路径可在外层代理重定向到 `/blog`。

Compose 使用同一份网站镜像导出计数程序和文章清单，再运行 Python 计数容器；不需要在部署机编译静态资源。`blog-views` 卷保存 `/data/blog-views.sqlite3`，拉取网站镜像、重建容器或更新文章不会清空该卷。备份时使用 SQLite backup API；不要对运行中的数据库只复制主文件，也不要用 `docker compose down -v` 删除持久化卷。

每小时 Actions 更新的是镜像，已有容器需运行上述 `pull`、`up` 才会更新；本仓库不会自动修改现有生产服务。需要站点每小时同步更新时，可由部署主机每小时执行这两条命令。

当前主机使用 `homepage.service` 和 `homepage-views.service`，`homepage-update.timer` 每小时从阿里云更新镜像。计数库位于 `/var/lib/homepage-views/blog-views.sqlite3`；后端只监听 Docker 网桥地址，通过网站的 Nginx 访问。`deploy/update.sh` 同步提取镜像内的计数程序和清单，仅程序变化时重启计数服务，失败时恢复上一版程序和网站镜像，数据库保持独立。

## 从 x 迁移阅读计数

```sh
python3 services/views/import_legacy.py /disk/app/x/x.sqlite3 /path/to/blog-views.sqlite3
```

工具只读旧数据库，事务导入 `blog_post_views`，保留 slug、计数和更新时间。已删除文章的历史计数仍保留在数据库；重复执行只补入比上次导入更多的旧计数，不重复累加，也不覆盖迁移后的新访问。当前主机首次导入完成后应由 systemd 的 StateDirectory 管理计数库权限。

## 验证

```sh
python3 -m unittest discover -s services/views -p 'test_*.py'
docker run --rm homepage:local nginx -t
HOMEPAGE_IMAGE=homepage:local docker compose up -d --wait
node scripts/verify-http.mjs http://127.0.0.1:3000
node scripts/verify-views.mjs http://127.0.0.1:3000
npx playwright install chromium
BASE_URL=http://127.0.0.1:3000 npx playwright test
```

浏览器测试可用 `BASE_URL` 指向其他端口；`CHROMIUM_EXECUTABLE` 可指定已有 Chromium。测试覆盖无脚本阅读、时钟更新、技能切换、打印按钮、一页 A4 PDF、移动端与桌面布局、阅读计数展示和计数服务不可用时的正文阅读。

原始内容来自 [42tr/x](https://github.com/42tr/x)。独立应用部署前，原 x 的线上服务不会因为本仓库构建而自动切换。
