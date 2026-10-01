---
title: "rust shimmy 使用"
date: 2025-09-17
tags: ["rust"]
summary: "快速部署模型~"
---

## 下载模型

`pip install -U huggingface_hub -i https://pypi.tuna.tsinghua.edu.cn/simple`

~~注册 `huggingface`，获得 Token~~

~~`huggingface-cli login`，使用 Token 登录~~

切换源：`export HF_ENDPOINT=https://hf-mirror.com`

`huggingface-cli download bartowski/Llama-3.2-1B-Instruct-GGUF Llama-3.2-1B-Instruct-Q4_K_M.gguf --local-dir ./models`

## 安装 shimmy
安装 rust
```shell
# 安装依赖
sudo apt install curl build-essential gcc
# 使用脚本下载并安装
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

安装 cmake
```shell
sudo apt update
sudo apt install cmake
```

安装使用 shimmy
```shell
cargo install shimmy --features huggingface
shimmy serve --bind 0.0.0.0:11435 &
```

注：使用的目录
> Hugging Face cache: ~/.cache/huggingface/hub/
> 
> Ollama models: ~/.ollama/models/
> 
> Local directory: ./models/
> 
> Environment: SHIMMY_BASE_GGUF=path/to/model.gguf
