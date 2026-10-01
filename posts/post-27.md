---
title: "使用 html 写博客"
date: 2024-08-17
tags: ["兴趣"]
summary: "一直没有满意的写文章的地方，所有应用都有些无法满足要求的点，不如自己写一个。最终还是放弃了，写博客还是愿意下笔重要~"
---

## 实现
- 前端框架

  vue3 + vite + naive-ui

- 访客计数

  使用 不蒜子

  问题：访问子页的流量未统计。

- 允许被搜索引擎爬取

  根目录设置 robots.txt

  google：判断是否被索引：搜索 site:42tr.github.io，未被索引会提示使用 google search consoloe，验证网站所有权，添加站点地图 sitemap.xml，完成后过一天再看。

- Github Actions 自动部署

  生成一个 Personal access token，加入到该仓库的 new repository secret，Name 为 ACCESS_KEY，Value 为 token，在代码目录新建 .github/workflows/pages.yml，内容如下

```yml
name: GitHub Actions Build and Deploy
on:
  push:
    branches:
      - 42tr
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2.3.1
        with:
          persist-credentials: false

      - name: Install and Build 🔧
        run: |
          npm install
          npm run build
      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@3.7.1
        with:
          ACCESS_TOKEN: ${{ secrets.ACCESS_KEY }}
          BRANCH: gh-pages
          FOLDER: dist
          CLEAN: true
```

## 开发中遇到的问题
- 打包发布到 github.io 的文件无法加载

  问题原因：打包后生成的文件名以下划线开头，无法返回。

  解决方案：修改 vite.config.ts
  ```typescript
  export default defineConfig({
      plugins: [vue()],
      build: {
          rollupOptions: {
              output: {
                  // 入口文件名
                  // entryFileNames: `assets/[name].js`,
                  // 块文件名：不能下划线开头，增加一个 main 前缀
                  chunkFileNames: `assets/main-[name]-[hash].js`,
                  // 资源文件名 css 图片等等
                  // assetFileNames: `assets/[name]-[hash].[ext]`,
              }
          }
      }
  })
  ```

- 解决发布缓存问题——增加唯一标识，如时间戳
  ```typescript
  const timestamp = new Date().getTime()

  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          // 入口文件名
          entryFileNames: `assets/[name].${timestamp}.js`,
          // 块文件名
          chunkFileNames: `assets/[name]-[hash].${timestamp}.js`,
          // 资源文件名 css 图片等等
          assetFileNames: `assets/[name]-[hash].${timestamp}.[ext]`,
        },
      },
    }
  })
  ```
