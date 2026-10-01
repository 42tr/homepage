---
title: "leptos 全栈开发"
date: 2025-04-12
tags: ["rust","leptos"]
summary: "尝试使用 Leptos 进行全栈开发~"
---

## 步骤
- `cargo install cargo-leptos`
  
  报错：`fatal error: "algorithm" file not found`

  解决：重装 xcode
  ```shell
  sudo rm -rf /Library/Developer/CommandLineTools
  Xcode-select --install
  ```
- `rustup target add wasm32-unknown-unknown`
- `cargo leptos new --git leptos-rs/start`

  use the Leptos starter template - it comes preconfigured with all these ready from you
  
- `cargo leptos watch`

  build frontend to wasm, compile backend and start it.
  
  报错：
  ```
  it looks like the Rust project used to create this Wasm file was linked against
      version of wasm-bindgen that uses a different bindgen format than this binary:

        rust Wasm file schema version: 0.2.95
           this binary schema version: 0.2.100
  ```
  解决：更新 `Cargo.toml` 中的 `wasm-bindgen` 版本 `wasm-bindgen = "=0.2.95"` 改为 `wasm-bindgen = "=0.2.100"`，然后执行 `cargo update`
  
项目成功启动，默认使用的 actix，不想用，换 axum。

### 使用 axum
- `cargo install cargo-leptos`
- `cargo leptos new --git leptos-rs/start-axum`
- `cd your_project_dir`
- `rustup toolchain install nightly`
- `rustup target add wasm32-unknown-unknown`
- `cargo leptos watch`

### 添加 tailwind
- `npm install tailwindcss`
- Create the file `style/tailwind.css`
  ```css
  @import "tailwindcss";
  ```
- Update `Cargo.toml`
  ```toml
  # IMPORTANT! Remove or comment-out
  # style-file = "style/main.scss"

  # Activates the tailwind build
  tailwind-input-file = "style/tailwind.css"
  ```
- Update `src/app.rs` to use tailwind.

## 编译
`cargo leptos build -r`

## 交叉编译
- 安装编译目标：`rustup target add aarch64-unknown-linux-gnu`
- 安装交叉编译工具链：`brew tap messense/macos-cross-toolchains` + `brew install aarch64-unknown-linux-gnu`（可能不需要）
- 创建 `.cargo/config.toml`
  ```toml
  [target.aarch64-unknown-linux-gnu]
  linker = "aarch64-unknown-linux-gnu-gcc"
  ```
- 编译 `LEPTOS_BIN_TARGET_TRIPLE=aarch64-unknown-linux-gnu cargo leptos build --release`

## 启动
拷贝到服务器
- `x-leptos-axum`
- `site/`

执行
```shell
export LEPTOS_OUTPUT_NAME="x-leptos-axum"
export LEPTOS_SITE_ROOT="site"
export LEPTOS_SITE_PKG_DIR="pkg"
export LEPTOS_SITE_ADDR="0.0.0.0:3000"
export LEPTOS_RELOAD_PORT="3001"
./x-leptos-axum
```
