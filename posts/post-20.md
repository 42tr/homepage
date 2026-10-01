---
title: "atrust vpn 多人使用"
date: 2025-03-16
tags: ["vpn"]
summary: "atrust vpn 多人使用"
---
![image.png](/blog/images/4db44f81000576557aa84a937db48cba.image.png)

# 使用

以 windows 为例
---
- windows 开启 vpn
- windows 开启路由转发
    - 以管理员身份运行 cmd
    - 执行 `reg add HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters /v IPEnableRouter /D 1 /f`
    - 或者进入注册表，将 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\IPEnableRoute`设为1
    - 进入服务，将 `Routing and Remote Access` 服务的启动类型更改为自动并启动服务
    - 或者在 cmd 执行 `sc config RemoteAccess start= auto` 和 `sc start RemoteAccess`
- mac 开启路由转发 `sudo route add 172.0.0.0/8 192.168.2.2`

# 参考
- [macOS借助vmware隔离运行aTrust，实现宿主机“干净”连入局域网](https://blog.csdn.net/baofeidyz/article/details/129851257)
- [Windows 10上开启路由转发及添加路由](https://blog.csdn.net/weixin_44647835/article/details/109616688)
