---
title: "Leptos 初识"
date: 2024-02-02
tags: ["rust"]
summary: "**Full stack, fully typed.**"
---

A cutting-edge Rust framework for the modern web.

## About
Leptos is a full-stack, isomorphic Rust web framework leveraging fine-grained reactivity to build declarative user interfaces.

## 创建项目
```shell
cargo new hello_leptos
cd hello_leptos
cargo add leptos
cargo install trunk
rustup target add wasm32-unknown-unknown
```
添加依赖 `leptos = { version = "0.6.5", features = ["csr"] }`

下载失败需要设置 rust 源
```
# 放到 `$HOME/.cargo/config` 文件中
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"

# 替换成你偏好的镜像源
replace-with = 'sjtu'
#replace-with = 'ustc'

# 清华大学
[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"

# 中国科学技术大学
[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"

# 上海交通大学
[source.sjtu]
registry = "https://mirrors.sjtug.sjtu.edu.cn/git/crates.io-index"

# rustcc社区
[source.rustcc]
registry = "git://crates.rustcc.cn/crates.io-index"

[net]
git-fetch-with-cli=true
```
启动 `trunk serve --open`

![image.png](/blog/images/7487767c8e581bbd42362ca581a3fc52.image.png)

## 使用 cargo leptos
- 安装 nightly 版本 rust
- `rustup target add wasm32-unknown-unknown`
- 创建 `cargo leptos new --git leptos-rs/start`
- 启动 `cargo leptos serve`
- 构建 `cargo leptos build`
