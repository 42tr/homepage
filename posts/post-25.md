---
title: "windows smb 连不上问题"
date: 2025-07-13
tags: ["兴趣"]
summary: "微软在 Windows 11 24H2 版本中强化了安全策略(面向 IT 专业人员的 Windows 11 版本 24H2 中的新增功能 | Microsoft Learn)，所有连接现在默认都需要 SMB 签名。这项变更可能导致用户无法通过网上邻居（SMB）连接至某些设备，如网络存储服务器(NAS)或通过华硕路由器连接 U盘。"
---

在Windows 11可能无法使用SMB功能的问题，请参考以下2种解决方法择一设置：

注意：此方法可能降低系统的安全性，建议仅在信任的网络环境中使用。

 

方法1. 启用不安全的访客登录：

    a. 使用注册表编辑器：

        a1. 在Windows 的搜索框输入「注册表编辑器」并开启。

        a2. 点击进入此路径「HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\LanmanWorkstation」。

   如果「LanmanWorkstation」 不存在，请右键点击「Microsoft」，选择「新增」>「项」，并命名为「LanmanWorkstation」。

        a3. 右键点击「LanmanWorkstation」，选择「新增」>「DWORD（32 位）值」，命名为「AllowInsecureGuestAuth」。

        a4. 在右侧窗格中，右键点击「AllowInsecureGuestAuth」  > 点击「修改」，将「数值数据」设为「1」，然后按下「确定」。

 

    b. 使用本地组策略编辑器：

        b1. 在键盘按下「 Win键 + R键」，输入 「gpedit.msc」，然后按下「确定」。

        b2. 点击进入此路径「计算机设置」>「系统模板」>「网络」>「Lanman 工作站」。

        b3. 在右侧窗格中，在「启用不安全的来宾登录」 单击右键 > 「编辑」。

        b4. 选择「已启用」，然后按下「确定」。 

 

方法2. 关闭 SMB 签名要求：

    a. 使用注册表编辑器：

        a1. 在Windows 的搜索框输入「注册表编辑器」并开启。

        a2. 点击进入此路径「HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters\RequireSecuritySignature」。

    如果「Parameters」 下没有「RequireSecuritySignature」，请右键点击「Parameters」，选择「新增」>「DWORD（32 位）值」，并命名为「RequireSecuritySignature」。 

        a3. 右键点击「RequireSecuritySignature」 > 点击「修改」，将「数值数据」设为 0，然后按下「确定」。 

 

    b. 使用 Windows PowerShell： 

        b1. 在Windows 的搜索框输入「Windows PowerShell」并以管理员身份运行。

        b2. 输入以下指令，输入完成后在键盘按下「Enter」 键即可。

Set-SmbClientConfiguration -RequireSecuritySignature $false

转载：https://www.asus.com.cn/support/faq/1054736/
