---
title: "麒麟 Kylin 4.0.2 + 4.11 内核 Docker 安装"
date: 2026-09-07
tags: ["Docker", "麒麟", "Kylin", "运维"]
summary: "在老版本麒麟系统（4.11 内核）上用官方静态二进制包离线安装 Docker 20.10，并配置 systemd 服务。"
---

最近在一台麒麟 Kylin 4.0.2 的服务器上装 Docker，内核版本是 4.11。这个环境有几个限制：

- 系统比较老，官方 yum/apt 源里没有可用的 Docker 包，第三方源也基本不再支持这个内核版本
- 机器可能无法直接访问外网，或者网络受限
- 新版本的 Docker 对内核特性（cgroup v2、iptables-nft 等）要求越来越高，在老内核上容易翻车

综合考虑下来，最稳妥的方案是使用 Docker 官方提供的**静态编译二进制包**（static binaries），不依赖包管理器，对系统侵入最小，卸载也干净。版本选择上用了 20.10.24 —— 这是 20.10 系列的最后一个版本，对老内核兼容性最好，再新的 23.x/24.x 在 4.11 内核上可能遇到 iptables 或 cgroup 相关的兼容问题。

## 1. 下载并解压静态二进制包

```shell
cd /tmp

wget https://download.docker.com/linux/static/stable/x86_64/docker-20.10.24.tgz

tar -xzf docker-20.10.24.tgz
cp docker/* /usr/bin/
chmod +x /usr/bin/docker*
```

压缩包里包含完整的运行时组件：`docker`（CLI）、`dockerd`（守护进程）、`containerd`、`containerd-shim`、`ctr`、`runc`、`docker-init`、`docker-proxy` 等，全部复制到 `/usr/bin/` 即可。

如果是 aarch64 架构的麒麟机器，把下载链接中的 `x86_64` 换成 `aarch64`。

## 2. 配置 daemon.json

```shell
mkdir -p /etc/docker

cat > /etc/docker/daemon.json <<'EOF'
{
  "storage-driver": "overlay2"
}
EOF
```

4.11 内核已经支持 overlay2，比默认的 devicemapper 或 vfs 性能好得多。如果机器在内网、拉镜像困难，可以顺便配上镜像加速和私有仓库地址：

```json
{
  "storage-driver": "overlay2",
  "registry-mirrors": ["https://<你的镜像加速地址>"],
  "insecure-registries": ["<私有仓库地址>"]
}
```

## 3. 编写 systemd 服务

静态包不带服务文件，需要自己写。containerd 和 dockerd 分成两个 service，dockerd 依赖 containerd：

```shell
cat > /etc/systemd/system/containerd.service <<'EOF'
[Unit]
Description=containerd container runtime
After=network.target

[Service]
ExecStart=/usr/bin/containerd
Restart=always
RestartSec=2
LimitNOFILE=1048576
LimitNPROC=1048576
LimitCORE=infinity

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/docker.service <<'EOF'
[Unit]
Description=Docker Application Container Engine
After=network.target containerd.service
Requires=containerd.service

[Service]
Type=notify
ExecStart=/usr/bin/dockerd --containerd=/run/containerd/containerd.sock
Restart=always
RestartSec=2
LimitNOFILE=1048576
LimitNPROC=1048576
LimitCORE=infinity

[Install]
WantedBy=multi-user.target
EOF
```

几个注意点：

- `Type=notify`：dockerd 启动完成后会主动通知 systemd，避免 `After` 依赖判断过早
- `--containerd=/run/containerd/containerd.sock`：显式指定使用外部 containerd，否则 dockerd 会自己拉起一个
- `LimitNOFILE`/`LimitNPROC`/`LimitCORE`：容器场景下默认值太小容易出问题，直接放大

## 4. 启动并验证

```shell
systemctl daemon-reload
systemctl enable containerd
systemctl enable docker
systemctl start containerd
systemctl start docker

docker version
docker info
```

`docker version` 能同时看到 Client 和 Server 信息、`docker info` 正常输出系统信息（Storage Driver 应为 `overlay2`），就说明安装成功了。可以再跑个容器验证一下：

```shell
docker run --rm hello-world
```

## 5. 安装 Docker Compose 插件

Compose V2 以 Docker CLI 插件的形式分发，也是一个独立的静态二进制，放到插件目录即可使用：

```shell
mkdir -p /usr/local/lib/docker/cli-plugins

wget -O /usr/local/lib/docker/cli-plugins/docker-compose \
  https://github.com/docker/compose/releases/download/v2.24.7/docker-compose-linux-x86_64

chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

docker compose version
```

正常的话会看到类似输出：

```text
Docker Compose version v2.24.7
```

之后就可以正常使用 `docker compose` 子命令了：

```shell
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

注意 V2 的用法是 `docker compose`（空格，作为 docker 的子命令），不再是老版本的 `docker-compose`（连字符，独立命令）。如果旧脚本里还在用 `docker-compose`，可以加一个软链接兼容：

```shell
ln -s /usr/local/lib/docker/cli-plugins/docker-compose /usr/bin/docker-compose
```

## 常见问题

**dockerd 启动报 iptables 相关错误。** 老内核可能没有 `xt_conntrack` 等模块，或者系统默认用了 nftables。可以先 `modprobe br_netfilter overlay`，仍然不行的话在 `daemon.json` 里加 `"iptables": false` 绕过（代价是容器端口映射需要自己管）。

**`docker info` 提示 swap cgroup 警告。** 麒麟老版本默认没开 swap 限制，需要在 GRUB 内核参数里加 `cgroup_enable=memory swapaccount=1` 然后重启，不影响使用的话可以忽略。

**卸载。** 静态安装卸载很简单：`systemctl stop docker containerd`，删掉 `/usr/bin/docker*`、`/usr/bin/containerd*`、`/usr/bin/runc` 等二进制，再删 `/etc/systemd/system/{docker,containerd}.service`、`/etc/docker/` 和 `/var/lib/docker/` 即可。
