---
title: "使用 NextCloud 搭建私有云盘"
date: 2025-09-12
tags: ["树莓派"]
summary: "NextCloud + OnlyOffice + Docker"
---

### 部署 `OnlyOffice`

```
docker run -d --restart=always --name onlyoffice -p 9002:80 -p 9001:443 onlyoffice/documentserver
```

获取秘钥 `docker exec -it onlyoffice cat /etc/onlyoffice/documentserver/local.json`


![image.png](/blog/images/3c3b1d8c1a62396c68d1f03247f661bd.image.png)

### 部署 `NextCloud`

```
docker run -d --name nextcloud --restart=always -v /storage02/app/nextcloud:/var/www/html -e TZ="Asia/Shanghai" -p 8002:80 nextcloud
```

### 安装 NextCloud 的 OnlyOffice 插件

离线方式则是进入 `ONLYOFFICE - Apps - App Store - Nextcloud` 页面下载对应版本的onlyoffice插件，然后将插件解压，将文件夹放入nextcloud容器的 `/var/www/html/apps` 目录里面，然后在nextcloud的应用里面就有onlyoffice了，然后启用即可。

`个人中心->管理设置->ONLYOFFICE`，进入到配置 onlyoffice 插件页面，将 onlyoffice 插件服务地址及其上一步获取的秘钥填入里面，并保存。（https 注意切换更多设置中为 https）

### 使用 https

```
# 进入容器
docker exec -it nextcloud bash
# 修改配置
vim /var/www/html/config/config.php
# 修改
'overwrite.cli.url' => 'https://cloud.42tr.cn',
'overwriteprotocol' => 'https',
```
