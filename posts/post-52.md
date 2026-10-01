---
title: "轻量级日志监控平台搭建"
date: 2026-04-23
tags: ["日志"]
summary: "搭建一个简单的日志监控平台~"
---

Promtail 是代理，负责收集日志并将其发送给 loki 。

Loki 是主服务器，负责存储日志和处理查询 。

Grafana 用于 UI 展示。

## 环境部署
`promtail-config.yaml`
```yaml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker

    pipeline_stages:
      - docker: {}

      # ✅ 从日志路径中提取 container_id
      - regex:
          expression: '/images/docker/containers/(?P<container_id>[a-f0-9]+)/.*\.log'

      # ✅ 把 container_id 提升为 label
      - labels:
          container_id:

    static_configs:
      - targets:
          - localhost
        labels:
          job: docker
          __path__: /images/docker/containers/*/*.log
```
**注：我的 Docker 目录迁移了，`/images/docker` 改为自己的 Docker 目录**

`docker-compose.yaml`
```yaml
services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"

  promtail:
    image: grafana/promtail:2.9.0
    volumes:
      # - /images/docker/containers:/var/lib/docker/containers:ro
      - /images/docker/containers:/images/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - ./promtail-config.yaml:/etc/promtail/config.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3101:3000"
    volumes:
      - ./grafana-data:/var/lib/grafana
```

`docker compose up -d`

## 使用
进入 3101 端口 Grafana，默认账号密码 `admin/admin`

### 配置 Connections
![image.png](/blog/images/ed8dd87a93573d32a95e2386f88aab42.image.png)

Save & test

### 测试

![image.png](/blog/images/6b8ba2501304c8034d9e9ae0fdb579d1.image.png)

### 配置 Dashboard


![image.png](/blog/images/c47ceca1054a6f4379b912151ec4ef76.image.png)
