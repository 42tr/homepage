---
title: "docker 迁移"
date: 2025-02-21
tags: ["树莓派","docker"]
summary: "树莓派的存储卡空间不足，迁移到机械硬盘中~"
---

- 关闭 `docker` 服务 `systemctl stop docker.socket`
- 迁移路径 `rsync -avzP /var/lib/docker  /disk/docker`
- 备份数据目录 `mv /var/lib/docker /var/lib/docker.bak`
- 添加软链接 `ln -s /disk/docker/ /var/lib/`
- 重启 `docker` 服务 `systemctl start docker`
- **确认 `docker` 正常**
- 删除备份目录 `rm -rf /var/lib/docker.bak`
