---
title: "ios 消息推送"
date: 2025-02-21
tags: ["消息推送","ios"]
summary: "使用 bark，Android 可以使用 gotify~"
---

## docker 部署

`docker run -dt --name bark -p 16009:8080 -v /disk/app/bark/data:/data finab/bark-server`

## ios 应用下载
下载 bark，添加服务器

![IMG_4836.PNG](/blog/images/eb9cfee42c115c2595268127e7cf2f37.IMG_4836.PNG)

## 发送请求
curl https://bark.ioiox.com/your_key/标题/内容

更多参见 bark 应用里的例子
