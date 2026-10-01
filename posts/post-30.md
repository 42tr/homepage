---
title: "Rust 去除对 openssl 的依赖"
date: 2025-01-01
tags: ["rust"]
summary: "Rust 编译文件依赖 openssl 会导致执行报错~"
---

## 背景
开发时碰到的问题，使用 github actions 进行 CI，构建的可执行文件在目标服务器报错：
```txt
./x: error while loading shared libraries: libssl.so.3: cannot open shared object file: No such file or directory
```
原因是 reqwest 库依赖 openssl。reqwest 需要依赖 OpenSSL 库来处理 TLS/SSL 连接，这是因为 HTTPS（安全的 HTTP）通信协议依赖于 SSL/TLS 加密标准来保证数据传输的安全性。

### 解决方法

#### 步骤一

  Rustls 是一个纯 Rust 编写的现代 TLS 库，旨在成为一个内存安全的 `OpenSSL` 替代品；它使用 ring 进行加密，使用 webpki 进行证书验证。 `Rustls` 旨在提供良好的加密安全级别，无需配置即可实现该安全性，并且不提供不安全的功能或过时的加密技术。在 `Cargo.toml` 中，给 reqwest 库设置 `features = ["rustls-tls"]` 并禁用了默认特性（`default-features = false`）。
  ```toml
  [dependencies]
  reqwest = { version = "0.12.9", features = ["json", "rustls-tls"], default-features = false }
  ```
  修改之后重新执行 CI，发现还是相同的报错，检查之后发现 `lettre` 依赖 `native-tls`，而 native-tls 在 Linux 和其他 Unix 系统也依赖 openssl，同时也修改。
  ```toml
  [dependencies]
  lettre = { version = "0.11.11", default-features = false, features = ["builder", "smtp-transport", "rustls-tls"] }
  ```
  注：可以使用 cargo tree 查看依赖树。

#### 步骤二

  上面的修改已经解决了对 openssl 的依赖问题，但是修改后发现可执行文件还是报错：
  ```txt
  ./x: /lib64/libm.so.6: version `GLIBC_2.38' not found (required by ./x)
  ./x: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by ./x)
  ./x: /lib64/libm.so.6: version `GLIBC_2.29' not found (required by ./x)
  ./x: /lib64/libm.so.6: version `GLIBC_2.35' not found (required by ./x)
  ./x: /lib64/libc.so.6: version `GLIBC_2.32' not found (required by ./x)
  ./x: /lib64/libc.so.6: version `GLIBC_2.25' not found (required by ./x)
  ./x: /lib64/libc.so.6: version `GLIBC_2.18' not found (required by ./x)
  ./x: /lib64/libc.so.6: version `GLIBC_2.33' not found (required by ./x)
  ./x: /lib64/libc.so.6: version `GLIBC_2.28' not found (required by ./x)
  ./x: /lib64/libc.so.6: version `GLIBC_2.34' not found (required by ./x)
  ```

  这个错误表明，在运行编译后的二进制文件时，所运行的系统上的 GNU C Library (glibc) 的版本低于编译该二进制文件时所依赖的版本（2.38）。要解决这个问题，第一种办法是降低编译时的 glibc 版本或者升级运行时的 glibc 版本。第二种办法是让程序不要动态链接到系统库，可以通过使用 musl 工具链静态编译。修改编译脚本。
  ```shell
  rustup target add x86_64-unknown-linux-musl
  cargo build --target x86_64-unknown-linux-musl --release
  ```

  这会生成一个与 `glibc` 无关的静态链接二进制文件，可以在任何 Linux 系统上运行。 编译报错
  ```txt
  ring@0.17.8: Compiler family detection failed due to error: ToolNotFound: Failed to find tool. Is musl-gcc installed?
  ```
  这个错误表明，在尝试用 `musl` 工具链编译 `ring` 时，`musl-gcc` 工具未找到。`ring` 在某些环境中需要 `musl-gcc` 来生成与 `musl` 静态链接的代码。安装工具即可 `apt-get install musl-tools`。

  修改后成功运行。
