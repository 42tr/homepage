---
title: "树莓派搭建 nas 服务器"
date: 2024-01-26
tags: ["树莓派"]
summary: "多设备数据需要互通必备！"
---

# 准备
## 硬件
- 树莓派 4b
- 磁盘阵列盒 CM461
## 挂载
- 启动磁盘阵列盒，设置 raid 模式（reset 10s）
- 格式化磁盘 `mkfs -t ext4 /dev/sdb`，挂载磁盘 `mount /dev/sdb /disk`

## 开启 smb
- 安装
  ```shell
  apt-get install samba samba-common-bin
  ```
- 添加用户 `useradd smb`，设置密码 `smbpasswd -a smb`
  > 查看 smb 用户: `pdbedit -L`
  > 
  > 删除 smb 用户: `pdbedit -x <username>`
- 修改配置 `/etc/samba/smb.conf`，添加
  ```shell
  [disk]
   path = /disk/
   guest ok = yes
   browseable = yes
   writeable = yes
   create mask = 0777
   # 设置可访问的用户，非必选
   valid users = root
   directory mask = 0777
  ```
- 重启 smb 服务 `systemctl restart smbd`

## 连接
- windows
  > 输入 \\\\ip 即可
  > 
  > 如果修改过用户，连接时会报错，multi user，在 cmd 执行 `net use * /del /y` 清除即可
  > [windows 外网链接问题](https://blog.csdn.net/qq_46106285/article/details/131612914)

- mac
  > mount -t smbfs //\<user>:\<pwd>@\<ip>:\<port>/\<dir> <local_dir>
  > 
  > finder 远程连接

# 部署影音服务器软件
- Plex
- emby
- Jellyfin
  > 免费，安装 `sudo docker run -d -p 8096:8096 -v /disk/app/jellyfin/config:/config -v /disk/resource:/media jellyfin/jellyfin`
