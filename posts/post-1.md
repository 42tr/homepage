---
title: "树莓派应用开发"
date: 2024-01-11
tags: ["树莓派"]
summary: "设置开机自启、内网穿透"
---

# 设置开机自启
## 创建服务单元
`vi /etc/systemd/system/firefly.service`
```
[Unit]
Description=My Executable Service
After=network.target

[Service]
ExecStart=/root/app/ff/firefly
Restart=always
User=root
Group=root
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

[Install]
WantedBy=multi-user.target
```
## 设置开机自启
- `systemctl start firefly`
- `systemctl enable firefly`

# 内网穿透
使用 [frp](https://gofrp.org/)
## 公网服务器
- 下载安装
  ```shell
  # 创建安装目录
  mkdir frp_service
  # 切换目录
  cd frp_service/
  # 下载frp
  wget https://github.com/fatedier/frp/releases/download/v0.24.1/frp_0.24.1_linux_amd64.tar.gz
  # 解压
  tar -zxvf frp_0.24.1_linux_amd64.tar.gz
  # 切换目录
  cd frp_0.24.1_linux_amd64/
  # 删除客户端配置文件
  rm -f frpc frpc.ini
  # 修改配置文件,vi命令也行
  vim frps.ini
  ```
  frp.ini
  ```
  [common]
  # 监听端口
  bind_port = 7000
  # 映射 http 端扣
  vhost_http_port = 80
  # 特权 token
  privilege_token = 111111
  # 后台管理 端口、用户名、密码
  dashboard_port = 7500
  dashboard_user = raspberry
  dashboard_pwd = pi
  ```
  > **注：建议使用最新版本，0.24.1 出现 https 配置问题，更新后解决**
- 确认服务启动正常：`./frps -c ./frps.ini`
![image.png](/blog/images/13e9553992a4a263b36b3b054a8f2447.image.webp)
- 设置开机自启：`nohup ./frps -c ./frps.ini &`

## 树莓派
- 下载安装
  ```shell
  mkdir frp_service
  cd frp_service/
  wget https://github.com/fatedier/frp/releases/download/v0.24.1/frp_0.24.1_linux_arm.tar.gz
  tar -xzvf frp_0.24.1_linux_arm.tar.gz
  cd frp_0.24.1_linux_arm/
  rm -f frps frps.ini
  vim frpc.ini 
  ```
  frpc.ini
  ```
  #基础配置
  [common]
  server_addr = 111.111.111.111
  server_port = 7000
  privilege_token = 111111

  #tcp配置
  [ssh]
  type = tcp
  local_ip = 192.168.1.13
  local_port = 22
  remote_port = 8888

  #web配置
  [web]
  type = http
  local_port = 80
  custom_domains = kisia.cn
  ```
- 确认服务启动正常：`sudo ./frpc -c frpc.ini`
![](/blog/images/6f93ccda2cc0b14469b1cd43d23e70ad.image.webp)
- 设置自启动：`nohup ./frpc -c ./frpc.ini &`

也可以使用 docker 的方式，注意版本号与服务端一致
```shell
docker run -d \
  --name frpc \
  --restart always \
  -v /disk/app/frpc/frpc.ini:/etc/frp/frpc.ini \
  snowdreamtech/frpc:0.24.1
```

## https
如果需要开启 https，建议映射到 server 端后，在 server 端通过 caddy 开启。
