---
title: "服务监控"
date: 2025-02-20
tags: ["树莓派","docker","prometheus"]
summary: "基于 docker 搭建 node-exporter + Prometheus + Grafana 服务器监控平台"
---
![image.png](/blog/images/a737c85315a34c42978f48da16a3d713.image.png)

# 安装
## 安装 node-export
`docker run -d --restart=always -p 9100:9100 prom/node-exporter`

验证：访问 http://服务器IP:9100/metrics

![image.png](/blog/images/603f9177fe340e8e62ab80023d0a43f4.image.png)

## 安装 Prometheus
准备 `/disk/app/prometheus/prometheus.yml`，`IP地址` 替换成 node-exporter 所在服务器地址
```yml
global:
  scrape_interval: 60s
  evaluation_interval: 60s
 
scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
        labels:
          instance: prometheus
 
  - job_name: linux
    static_configs:
      - targets: ['IP地址:9100']
        labels:
          instance: localhost
```
创建 docker 容器 `docker run -d --restart=always -p 9090:9090 -v /disk/app/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus`

验证：访问 http://IP地址:9090
![image.png](/blog/images/f27d773f60e8bb4b9cf5232172b9436a.image.png)

## 安装 grafana
`docker run -d --restart=always --name grafana -p 3000:3000  grafana/grafana`

访问 192.168.1.3:3000，用户名密码都是 admin

添加数据源
![image.png](/blog/images/7817ec5761d0b6a9c04e4af4d59bbebc.image.png)

下载ID为11074的[模板文件](https://grafana.com/grafana/dashboards/11074)
![image.png](/blog/images/d9518468ce8790a340294635d815b3b0.image.png)
使用下载的模板文件创建仪表盘
![image.png](/blog/images/58cb1399a5f3fb29b47bb7c61b73fabc.image.png)
效果
![image.png](/blog/images/a737c85315a34c42978f48da16a3d713.image.png)
