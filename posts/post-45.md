---
title: "轻量化部署 git server"
date: 2025-12-04
tags: ["git"]
summary: "最小化部署 git server ~"
---

# 创建用户
`adduser git`

# 切换到 git 用户
`su - git`

# 创建裸仓库
没有工作目录，专用于服务器存储，不能直接编辑文件

```shell
mkdir -p /home/git/myproject.git
cd /home/git/myproject.git
git init --bare
```

# 创建钩子脚本
```shell
vim /home/git/myproject.git/hooks/post-receive
# 赋予执行权限
chmod +x /home/git/myproject.git/hooks/post-receive
```
钩子脚本内容
```shell
#!/bin/bash
# 执行你的自定义脚本
/path/to/your/script.sh
# 可选：输出日志到文件（调试用）
# echo "$(date): Push received" >> /tmp/git-hook.log
```

# 使用
```shell
git remote set-url origin ssh://git@42tr.cn:8899/home/git/x.git
```
本地使用
```shell
git clone ssh://git@127.0.0.1/home/git/x.git
```
钩子脚本权限问题 `sudo visudo` 增加一行
```
git ALL=(root) NOPASSWD: /path/to/your/script.sh
```
然后钩子脚本中改用 `sudo /path/to/your/script.sh` 执行
