---
title: "旁路由配置"
date: 2025-01-21
tags: ["树莓派"]
summary: "使用树莓派，建立旁路由，科学上网~"
---

网络拓扑

![image.png](/blog/images/6e212e9e119fc51b87f881028a105c91.image.png)

**避坑：[Docker 运行 OpenWrt 容器时在进行包含 “杀死 OpenWrt Docker 容器进程” 的操作的时候确实会出现这个问题。目前还不清楚是哪方面的原因。](https://github.com/SuLingGG/OpenWrt-Docker/issues/8)**

**解决办法：关闭容器后尽快删除容器。**

## OpenWrt 使用
### 安装 OpenWrt
为了方便树莓派用于其他用途，使用 docker 的方式
- 下载[镜像包 openwrt-22.03.5-armvirt-64-default-rootfs.tar.gz](https://archive.openwrt.org/releases/22.03.5/targets/armvirt/64/openwrt-22.03.5-armvirt-64-default-rootfs.tar.gz)，来源：https://archive.openwrt.org/releases/22.03.5/targets/armvirt/64/
- 解压得到 tar 包 `gunzip openwrt-22.03.5-armvirt-64-default-rootfs.tar.gz`
- 导入镜像 `docker import openwrt-22.03.5-armvirt-64-default-rootfs.tar openwrt`
  > **推荐**：或者直接在创建 docker 容器时使用 `docker run --restart always --name openwrt -d --network openwrt --privileged registry.cn-shanghai.aliyuncs.com/suling/openwrt:armv8 /sbin/init`
  > 
  > x86 架构使用 `docker run --restart always --name openwrt -d --network openwrt --privileged registry.cn-shanghai.aliyuncs.com/suling/openwrt:x86_64 /sbin/init`
- 打开网卡混杂模式，使网卡可以接收任何流量，添加到启动文件 `ip link set eth0 promisc on`，执行 `ifconfig eth0` 网卡 flag 信息有 `PROMISC` 表示开启成功
  > `eth0: flags=4419<UP,BROADCAST,RUNNING,PROMISC,MULTICAST>  mtu 1500`
- 创建docker网络，网络驱动程序为macvlan，网络命名为openwrt，子网和网关根据实际情况修改 `docker network create -d macvlan --subnet=192.168.3.0/24 --gateway=192.168.3.1 -o parent=eth0 openwrt`
- 创建 docker 容器 `docker run --name openwrt -d --network openwrt --privileged openwrt /sbin/init`
  > 如果报错 `Error response from daemon: failed to create the macvlan port: operation not supported`，执行 `apt install linux-modules-extra-raspi`，linux-modules-extra-raspi 是树莓派 Ubuntu Arm 的不常用扩展，Ubuntu 最新的包管理中默认不包含扩展；因此需要单独安装，安装后需要重启树莓派
- 修改容器网络配置
  ```shell
  docker exec -it openwrt bash
  vi /etc/config/network

  # 修改 lan 配置
  config interface 'lan'
          option ifname 'eth0'
          option proto 'static'
          option netmask '255.255.255.0'
          option ip6assign '60'
          option ipaddr '192.168.1.99'
          option gateway '192.168.1.1'
          option dns '192.168.1.1'
 
  # 修改完成后重启容器的网络
  /etc/init.d/network restart
  ```
  重启完成后访问 http://192.168.1.99 ，使用账户 root 和密码 password 即可进入管理页面
- OpenWrt 配置
    - 登录后在 网络-接口中修改 LAN 接口，在底层基本设置中选择忽略此接口，使用默认路由器做 DHCP 服务器
    ![image.png](/blog/images/d807e4a27bdef4777f72451440341b10.image.png)
     

### OpenWrt 安装 OpenClash 插件
[OpenClash Github](https://github.com/vernesong/OpenClash)

[下载地址](https://github.com/vernesong/OpenClash/releases/tag/v0.46.064)

下载 luci-app-openclash 插件，打开 OpenWrt 管理界面，进入系统列表页找到文件传输，选择上传 luci-app-openclash_0.38.7-beta_all.ipk 插件，并在上传文件列表进行安装，如下图：

![image.png](/blog/images/eb562acdcee9c2eb0cab24c1d9eb6aea.image.png)

进入服务-OpenClash，选择配置文件订阅，新增订阅；输入订阅的链接地址，保存并更新即可；这样以 OpenWrt 为网关的设备就可以通过 OpenClash 访问特定的资源了

启动

![image.png](/blog/images/b1c3e3a40a272173a0c49cc604e37ff3.image.png)

设置路由器的网关和 dns

![image.png](/blog/images/e431a7e0f5044d547310bf030144f952.image.png)

## 参考
- [Clash for OpenWRT（软路由）实现全屋设备科学上网](https://inurl.top/archives/ClashforOpenWRT/)
- [树莓派 4B 容器方式安装 OpenWrt 作为软路由](https://blog.hellowood.dev/posts/%E6%A0%91%E8%8E%93%E6%B4%BE-4b-%E5%AE%B9%E5%99%A8%E6%96%B9%E5%BC%8F%E5%AE%89%E8%A3%85-openwrt-%E4%BD%9C%E4%B8%BA%E8%BD%AF%E8%B7%AF%E7%94%B1/)
- [树莓派中装docker，docker中装openwrt](https://zhuanlan.zhihu.com/p/658788125)
- [最新 OpenClash 使用教程快速入门篇](https://openclash.org/)
