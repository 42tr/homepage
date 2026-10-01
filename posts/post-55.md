---
title: "麒麟 4.0.2 上的 Electron 适配：从运行库到现代 CSS 降级"
date: 2026-09-08
tags: ["Electron", "麒麟", "Kylin", "Chromium", "CSS", "桌面端"]
summary: "将 Vue 3 + Vite + Tailwind v4 应用打包到麒麟 4.0.2：确定 Electron 22.3.27 兼容上限，并补齐运行库与 Chromium 108 的 CSS 降级。"
---

目标是在麒麟 4.0.2 上把 CoAssist_web 打包成一个自带浏览器的桌面程序。前端项目使用 Vue 3、Vite、Tailwind v4 和 Element Plus；目标系统则以 Ubuntu 16.04 为底，只有 glibc 2.23、4.11 内核和 NSS 3.28，系统库停留在 2016 年的水平。两者之间的版本落差，决定了这不是一次常规的 Electron 打包。

最终可用的方案固定在 Electron 22.3.27（Chromium 108），并以绿色包形式交付：`release/CoAssist-0.0.0-x64.tar.gz`，约 90 MiB，解压即可运行。

## 架构：前端无需改动

桌面端没有改动任何前端请求逻辑。`electron/server.cjs` 在 `127.0.0.1` 的随机端口启动本地 HTTP 服务，负责两件事：

- 托管 `dist/` 静态资源；
- 复刻 Vite 开发服务器的四条代理规则：`/api`、`/map-api`、`/agent-api`、`/crewai`，其中 WebSocket 通过 TCP 隧道转发。

前端原本就全部使用相对路径请求，因此在浏览器和 Electron 中的行为保持一致。`127.0.0.1` 还是安全上下文，LiveKit 的音视频权限可以正常使用。

```text
Electron 窗口
    |
    v
127.0.0.1:<随机端口>
    |-- dist/ 静态资源
    |-- /api      -> 后端服务
    |-- /map-api  -> 地图服务
    |-- /agent-api -> Agent 服务
    `-- /crewai   -> CrewAI 服务（含 WebSocket）
```

## 排障过程：四层问题逐层剥开

### 1. 加载期符号不兼容

最早的错误是 `GLIBC_2.25`、`NSS_3.30 not found`。没有直接盲目降版本，而是先用 `objdump -T` 检查各候选 Electron 二进制的 `GLIBC_`、`NSS_` 符号要求，快速排除不可能在 glibc 2.23 上加载的版本。

运行库的解决方式分两部分：

- 降低 Electron 版本；
- 随包携带 CentOS 7 的 NSS 3.90。该版本仅依赖 glibc 2.17，由 shell wrapper 预先设置 `LD_LIBRARY_PATH`。

随后又遇到 `gbm_bo_get_modifier` 未定义。这不是 NSS 问题，而是图形栈缺库。兼容目录继续补入 `mesa-libgbm 18.3`、`libdrm` 和 `libwayland-server`。

### 2. 运行期启动即段错误

符号加载通过后，Electron 一启动就段错误，`gdb` 回溯显示 `rip=0` 的空调用。排查按最小化原则进行：

- `ELECTRON_RUN_AS_NODE` 能正常运行，排除 Node 本身；
- 直接运行裸 Electron binary 也崩溃，排除业务代码与打包资源；
- Electron 22 能运行，24、25、28 都崩溃。

结论是 Chromium 版本墙，而不是应用层问题。麒麟 4.0.2 的可运行上限为 Electron 22.3.27，对应 Chromium 108；该版本需要固定，不能再按常规节奏跟进 Electron 大版本。

### 3. Chromium 108 无法解析现代 CSS

Electron 22 解决了运行时，却带来浏览器内核兼容问题：Chromium 108 不支持 `oklch()` 和 `color-mix()`，两者都在 Chrome 111 之后才可用。

Tailwind v4 生成的相关样式有 861 处包在 `@supports` 守卫中。Chromium 108 会自动跳过这部分并使用回退规则，因此无需额外处理。

需要处理的是业务样式中的裸 `color-mix(in srgb, var(--token) P%, transparent/white/var(--B))`，共 369 处且没有守卫。为此增加了 `scripts/lower-color-mix.cjs` 构建后处理：

- 根据 `color-mix` 在预乘 alpha 空间插值的规则，预计算为 `var(--token-mixP-*)`；
- 按 token 的 light/dark 主题选择器展开变体规则；
- 保持主题切换行为不变。

`oklch()` 则在 PostCSS 阶段使用 `@csstools/postcss-oklab-function` 生成 RGB 回退，最终将裸 `oklch()` 清零。

处理中还发现有 9 个 CSS 文件带 UTF-8 BOM，导致 Lightning CSS 解析失败；清理 BOM 后，兼容管线可以稳定执行。

### 4. 白屏并不等于加载失败

最后一个现象是页面白屏，但资源和页面实际都已加载成功。根因在绘制阶段：使用 root 运行时，X 会话属于 `osystem` 用户，X 授权无法通过；麒麟的安全机制还会限制 `libGLESv2.so` 的访问权限。

改用桌面会话用户运行后，页面可以正常绘制。这是运行环境权限问题，与 Electron、前端代码和本地 HTTP 服务无关。

## 交付内容

本次适配已在提交 `0cd56a1` 中完成并推送至 Gitea `main` 分支，包含：

- `electron/` 下的本地服务器、启动脚本和兼容运行库配置；
- `electron-builder.yml` 打包配置；
- CSS 兼容构建管线与 `color-mix` 降级脚本；
- 使用说明文档；
- `release/CoAssist-0.0.0-x64.tar.gz` 绿色版产物。

Windows 的 NSIS 安装包仍需要在 x86 环境配合 Wine 构建，当前环境无法产出。

## 后续维护要点

qemu-user 不能用于验证 Electron 的运行期行为：Electron 16、23、24 都会在仿真下崩溃，这是 qemu-user 的限制，不代表真机结论。它仍可用于验证加载期符号解析；版本兼容必须回到真机测试。

面对老系统时，先用 `objdump -T` 检查 `GLIBC_` 和 `NSS_` 符号要求，通常比反复试装版本更快。CSS 降级也不应一概而论，应先区分框架已经通过 `@supports` 保护的特性和业务代码中的裸用特性，只处理后者。

后续如果前端引入 `:has()`、`text-wrap` 等新 CSS 特性，需要同步以 Chromium 108 为基准检查兼容性，并为未受守卫保护的样式补充构建期回退。
