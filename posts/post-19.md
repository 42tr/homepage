---
title: "Open WebUI 开发"
date: 2025-03-11
tags: ["AI"]
summary: "Open WebUI is an extensible, feature-rich, and user-friendly self-hosted AI platform designed to operate entirely offline. It supports various LLM runners like Ollama and OpenAI-compatible APIs, with built-in inference engine for RAG, making it a powerful AI deployment solution."
---
![image.png](/blog/images/db2f85ecce74bb233dfe0ddaa3dc56a5.image.png)

- [github](https://github.com/open-webui/open-webui)
- [官网](https://openwebui.com/)
- [参考文档](https://docs.openwebui.com/)

# 启动
- 下载源码
- 配置文件：`cp -RPp .env.example .env`
- 下载前端依赖：根目录下 `npm install`
- 构建前端代码(注意 node 版本)：根目录下 `npm run build`
- 下载后端依赖：backend 目录下
  ```shell
  conda create --name open-webui python=3.11
  conda activate open-webui
  pip install -r requirements.txt -U
  ```
- 启动后端：backend 目录下 `sh start.sh`

# 遇到的问题

## Docker 部署
### 镜像构建失败
`The following signatures couldn't be verified because the public key is not available: NO_PUBKEY 0E98404D386FA1D9`

可能为 Docker 版本问题，升级 Docker 版本（尝试升级到 20.10.9 解决）
![image.png](/blog/images/5e76f9d514d436fe0a97fea6fc1f9ae0.image.png)

### 镜像构建慢
修改源
```shell
RUN echo "deb http://mirrors.tuna.tsinghua.edu.cn/debian bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    echo "deb http://mirrors.tuna.tsinghua.edu.cn/debian bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.tuna.tsinghua.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    rm -rf /etc/apt/sources.list.d/* && \
    apt update && apt upgrade -y
```

## 打包成二进制
使用 pyinstaller
配置 `main.spec`
```
# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all, collect_submodules, collect_data_files
from PyInstaller.building.build_main import Tree

datas, binaries, hiddenimports = collect_all('chromadb')
datas += collect_data_files("unstructured")

hiddenimports+=[
    "onnxruntime",
    "tokenizers",
    "tqdm",
    "passlib.handlers.bcrypt",
]

excludes=['torch.utils.tensorboard']

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,
    noarchive=False,
    optimize=0,
)

a.datas += [
  ('CHANGELOG.md', '../../CHANGELOG.md', 'DATA'),
  ('emoji/unicode_codes/emoji.json', '/root/anaconda3/envs/open-webui-clean/lib/python3.11/site-packages/emoji/unicode_codes/emoji.json', 'DATA')
]
a.datas += Tree('./static', prefix='static')
a.datas += Tree('../../build', prefix='build')
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```
执行 `pyinstaller main.spec`，构建的包在 `dist/main`

# 参考
- [【GPG error golang 1.19】](https://blog.csdn.net/nanhai_happy/article/details/142636677)
