---
title: "从零开始开发 ESP32"
date: 2026-09-24
tags: ["ESP32", "嵌入式", "IoT", "Wi-Fi", "PCB", "AlphaPulse"]
summary: "以 ESP32-S3 为起点，从准备硬件、点亮屏幕到 Wi-Fi 联网、中文显示和触摸交互，再探索语音唤醒与 PCB 设计，记录一个中文资讯终端的完整开发过程。"
---

从零开始开发 ESP32，我把第一个目标定得很小：先让一块屏幕显示出图片，再逐步加入联网、中文排版和触摸操作。本文以 ESP42 项目为例，记录使用 ESP32-S3 开发中文资讯终端的过程，以及后续语音唤醒实验和 PCB 载板设计。

## 起点：硬件与开发环境

动手之前，我先向 ChatGPT 询问：从零开始做这个 ESP32 项目，需要准备哪些硬件？根据讨论整理好开发板、屏幕、连接材料和调试工具的清单，确认后再到淘宝购买。这样先把需要的东西准备齐，再一步步搭建和验证。

当时整理的购物车里，除了 ESP32-S3 开发板与 2.8 英寸 TFT 屏幕套装，还包括面包板、杜邦线、万用表，以及电阻、LED、按键等基础元件；也准备了 INMP441 麦克风、MAX98357 I2S 功放和扬声器，供后续音频实验使用。

![确认硬件清单后在淘宝选购的购物车截图](/blog/images/esp42-taobao-hardware.png)

*准备硬件时的购物车记录，包含后续实验备料；具体接入终端的硬件以各阶段实现为准。*

项目使用 ESP32-S3-N16R8 开发板，搭配一块 2.8 英寸、240×320 的 SPI ILI9341 屏幕，触摸控制器为 XPT2046。板载 PSRAM 用来容纳画面缓冲和较大的资讯数据，为后续联网留出内部 RAM。

最初的开发工具是 Arduino CLI，显示驱动使用 Adafruit ILI9341 和 GFX 库。仓库验证过的编译配置采用 Arduino Nano ESP32 核心，并显式启用 ESP32 GPIO 编号；这只是软件配置，实物仍是 ESP32-S3 开发板。刷写使用 esptool，串口以 115200 波特率输出诊断信息。

为了在 Windows 上继续开发 ESP-IDF 工程，我在 VSCode 中安装 Espressif 的 **Espressif IDF** 扩展，由扩展统一安装 ESP-IDF、Python、CMake、Ninja、编译器和 esptool，并选择 ESP32-S3 作为目标芯片。打开仓库的 `firmware/` 目录后，可以在 VSCode 的 ESP-IDF 终端中执行：

```text
idf.py set-target esp32s3
idf.py build
idf.py flash monitor
```

`hello_tft/` 和早期 `alphapulse/` 草图保留了 Arduino CLI 的快速验证路径；`firmware/` 则是 ESP-IDF 的 CMake 工程外壳，通过 Arduino component 复用应用代码，并接入 `esp-sr` 组件和 WakeNet 模型分区。这样既能快速点亮屏幕，也能逐步进入更完整的 ESP-IDF 构建、刷写和串口监视流程。

开发顺序是先验证显示和接线，再接入网络与数据，最后完善交互和硬件载板。每完成一步，都留下可复用的示例、脚本或验证记录。

## 先让屏幕亮起来

项目最早从 `hello_tft/` 开始。它用 SPI 驱动 ILI9341，在 ESP32-S3 上显示内置 Flash 的 RGB565 图片，不依赖 SD 卡。这个阶段先把最容易出问题的部分固定下来：LCD 控制器确实返回了 `93 41`，GPIO 接线和竖屏方向也在真实硬件上核对过。

![ESP32-S3 点亮 TFT 屏幕的实拍演示（循环 GIF）](/blog/images/esp42-first-display.gif)

这段实拍动图记录了点亮屏幕阶段的显示效果。先确认供电、SPI 接线和显示输出，再继续做软件功能。

图片转换由 `tools/convert_image.py` 完成，生成的 `display_image.h` 让普通编译不再依赖 Pillow。这样既保留了一个最小可运行的显示示例，也给后面的中文终端留下了可靠的硬件基线。

## 切换到树莓派开发：Linux 主机编译并写入 ESP32

硬件接线稳定后，我把开发主机切换到树莓派。树莓派运行 Raspberry Pi OS，作为一台 Linux 小主机连接开发板、屏幕和串口线；代码可以用 VSCode 远程编辑，也可以直接在终端里使用 ESP-IDF 命令行工具。这样开发板放在桌面上持续运行时，不需要一直占用 Windows 电脑。

![树莓派旁的 ESP32-S3 与 TFT 面包板](/blog/images/esp42-raspberry-pi.jpg)

ESP-IDF 工程的写入流程是：在树莓派上安装 ESP-IDF 和工具链，打开仓库的 `firmware/` 目录，设置 ESP32-S3 目标后编译，再通过 USB 串口写入并打开监视器：

```text
idf.py set-target esp32s3
idf.py build
idf.py -p /dev/ttyACM0 flash
idf.py -p /dev/ttyACM0 monitor
```

`/dev/ttyACM0` 是示例串口名，实际设备可能是 `/dev/ttyUSB0`；可以先用 `ls /dev/ttyACM* /dev/ttyUSB*` 检查。刷写时 ESP-IDF 会把编译出的 bootloader、分区表、应用和模型分区按地址写入 ESP32，监视器则接收 115200 波特率的启动日志和调试命令。

仓库的 `hello_tft/` 和 Arduino 版 `alphapulse/` 也可以在树莓派上使用 Arduino CLI 编译，再用 `esptool` 写入：

```text
arduino-cli compile --fqbn arduino:esp32:nano_nora:PinNumbers=byGPIONumber \
  --output-dir alphapulse/build alphapulse
python3 -m esptool --chip esp32s3 --port /dev/ttyACM0 --baud 460800 write_flash -z \
  0x0 alphapulse/build/alphapulse.ino.bootloader.bin \
  0x8000 alphapulse/build/alphapulse.ino.partitions.bin \
  0x10000 alphapulse/build/alphapulse.ino.bin
```

因此，树莓派承担的是编译、串口刷写和日志观察的主机角色，真正运行资讯界面、Wi-Fi 和 WakeNet 的仍然是 ESP32-S3。

## 从图片演示到独立联网

`alphapulse/` 是现在的主应用。设备启动后从 NVS 读取 Wi-Fi 和网站账号配置，同步时间，再通过 HTTPS 登录 Supabase 接口。证书验证没有被关闭：Google Trust Services 根证书随固件提供，令牌接近过期时刷新，刷新失败再重新登录。

资讯列表每 60 秒更新一次，每次最多取 12 条二星及以上资讯。列表只取标题、正文、来源和时间；用户打开某一条资讯后，设备才单独请求 AI 解析。这个拆分降低了自动刷新的传输量，同时让解析加载期间仍能继续阅读正文。

![ESP32-S3 在 TFT 屏幕上显示 AlphaPulse 中文资讯列表](/blog/images/esp42-wifi-news.jpg)

*联网资讯列表实拍：屏幕显示更新时间、资讯标题，以及上一页、下一页和刷新按钮。*

设备端页面有三个主要状态：

- 列表：每页显示三条资讯，上滑和下滑翻页；
- 正文：长文章按屏幕分页，阅读期间不会被后台刷新替换；
- AI 解析：按需加载，支持分页、切换和返回列表。

网络异常时会保留当前列表并显示失败状态。首次 NTP 同步或登录超时会在设备上提示，并在 10 秒后重试。

## 把网络读取做成可以测试的模块

服务器不一定会主动关闭连接，因此固件没有把“读到 EOF”当作响应结束条件。HTTP 读取器兼容分块传输，设置了 30 秒读取期限和 192 KiB 解码上限：先把完整响应收进 PSRAM，再解析 JSON，避免把解析时间计入网络接收超时。

电脑端的 `tests/test_body_stream.py` 直接编译固件中的读取类，覆盖分块解码、超时和大小限制。这让网络边界行为可以在不接设备的情况下回归测试。

```bash
python3 tests/test_body_stream.py
```

较大的画面缓冲区和资讯 JSON 也放在 PSRAM，内部 RAM 留给 Wi-Fi 和 TLS。这个分配方式是联网终端能够稳定工作的基础之一。

## 触摸交互

屏幕触摸控制器是 XPT2046，与 LCD 共用 SPI，但使用独立的片选 GPIO5。首次启用时依次点击三个十字中心，校准结果写入 NVS；列表、正文和 AI 解析都支持滑动翻页。

交互层特别区分了点击和拖动：滑动至少 32 像素才翻页，短暂触摸断点保留 80 ms 容错，拖动不会误打开资讯。按钮和卡片在松手后短暂高亮，只有确认目标区域后才执行操作。串口还提供 `tap`、`swipe`、`screenshot` 等命令，触摸未接好时也能先验证页面状态机。

下面是触摸滑动查看的实拍动图：

![ESP32-S3 触摸滑动查看演示（循环 GIF）](/blog/images/esp42-touch-swipe.gif)

## 语音唤醒

语音部分经历了两个阶段。最开始为了先验证麦克风、I2S 采样和特征计算链路，我使用个人录音训练了一个轻量的 **MFCC 双中心分类器**：把 1 秒音频窗口转换成 MFCC 特征，按 250 ms 步进持续分析，再比较输入特征到正负样本中心的距离。`tools/train_keyword.py` 和 `data/wake_training.json` 记录了这次离线实验；当时有 39 个可用样本，划分为 29 个训练样本和 10 个测试样本，测试集结果为 10/10。这个结果只说明小样本离线流程跑通，不能代表真实环境下的误唤醒率、距离和噪声表现。

后来运行时方案切换到 **ESP-SR WakeNet**。固件从 `model` 分区加载 `wn9_` 模型，筛选关键词模型 `xiaoaitongxue`，以 16 kHz 单声道 I2S 音频输入运行 `DET_MODE_90`，检测阈值设置为 0.55。WakeNet 保留自己的循环状态，由独立任务持续读取音频并按模型要求的 chunk 大小调用 `detect()`；主循环只接收唤醒事件并更新界面。

当前固件唤醒成功后会输出 `WAKENET_HIT`，并显示 5 秒的语音反馈界面；还没有接入语音指令识别。旧的 `wake_model.h`、`tools/train_keyword.py` 和 `data/wake_training.json` 仍保留在仓库中，作为 MFCC 方案的历史实验资产，不是当前 WakeNet 的运行时模型或性能评估。

下面是语音唤醒的实拍视频：

<video controls playsinline preload="metadata" aria-label="ESP32-S3 语音唤醒演示" style="display:block;width:100%;max-height:75vh;margin:1.5em auto;border-radius:10px;background:#0d1117;">
  <source src="/blog/images/esp42-voice-wake.mp4" type="video/mp4">
  当前浏览器不支持播放此视频。
</video>

## 最新 PCB 载板

在面包板接线验证之后，仓库又生成了 ESP32-S3 TFT Carrier 的 KiCad 原理图、双层 PCB、BOM、自动布线会话、Gerber 和钻孔文件。板框为 70 × 50 mm，接口分成 LCD、Touch、Mic 和 Power/UART 四组：

| 接口 | 主要连接 |
| --- | --- |
| J1 LCD | CS=10、RST=4、DC=2、MOSI=11、SCK=12、MISO=13 |
| J2 Touch | 共用 SPI，独立 CS=5，IRQ 暂不接 |
| J3 Mic | I2S BCLK=15、WS=16、DATA=17 |
| J4 Power/UART | +5V 输入、3V3 LDO、TX=43、RX=44 |

最新布线截图如下：

![ESP32-S3 TFT Carrier 最新 PCB 布线图](/blog/images/esp42-pcb-latest.png)

KiCad CLI 报告当前为 0 个 ERC violation、0 个 DRC violation 和 0 个未连接项目。Gerber 与钻孔文件已经导出，不过正式下单前仍需根据实际采购的 WROOM 模块、屏幕排线和目标板厂规则重新核对。

## 之前的 Codex 工作轨迹

这个仓库的工作不是一次性生成出来的，而是逐步收敛的：

1. **显示原型**：确认 ILI9341 识别、GPIO 接线、图片缩放和 RGB565 资源生成。
2. **联网终端**：加入 Wi-Fi、NTP、HTTPS 证书校验、Supabase 登录和会话续期。
3. **中文与交互**：生成 CJK 字体，实现资讯列表、正文分页、AI 解析、触摸校准和串口模拟操作。
4. **可靠性与语音唤醒**：完成 HTTP 分块读取限制和本地测试；运行时接入 ESP-SR WakeNet、I2S 采样任务和模型分区，旧的 MFCC 训练脚本作为历史实验资产保留。
5. **硬件交付候选版**：生成 KiCad 原理图和 PCB，完成布线、ERC/DRC、BOM、Gerber 和钻孔文件。

真实硬件上已经验证过：设备可以刷写并联网，获取 12 条真实资讯，自动刷新再次成功；中文列表和 AI 解析可以通过帧缓冲检查，串口模拟点击可以完成正文翻页、解析切换和返回列表；触摸三点校准结果也已经保存到板上 NVS。

## 碰到的问题

一开始使用的是 Arduino IDE 的 ESP32 开发板环境，原来的网络代码直接运行在 Arduino 核心上，网站访问正常。为了加载官方 WakeNet，工程后来迁移到 ESP-IDF 5.3.2，并做了几组会同时影响编译、启动和网络的改动：

- Arduino 核心改成作为 ESP-IDF 组件运行；
- Arduino-ESP32 核心版本随 ESP-IDF 组合发生变化；
- 增加 ESP-SR、WakeNet 和模型分区；
- 修改分区表和固件启动方式；
- 增加 mbedTLS 的 PSK 配置；
- 网络请求从原来的 Arduino 编译链切换到新的 IDF 网络栈。

迁移后 Wi-Fi 仍然可以连接，但新的 ESP-IDF / Arduino 组合在访问 Supabase HTTPS 时失败。这个现象说明“能连上 Wi-Fi”并不等于 TLS、证书、HTTP 请求和服务端接口都已经兼容；问题出现在网络请求链路，而不是射频连接本身。

当前的排查方向是保留已经接入的 WakeNet 和模型分区，只把网络部分改成 ESP-IDF 原生 `esp_http_client`，逐层确认时间同步、证书校验、TLS 握手、请求头和响应读取。这样可以把 Arduino `HTTPClient` 与 IDF 网络栈的影响拆开，避免为了修复 HTTPS 又回退语音唤醒的工程迁移。

## 下一步工作

- 接入语音转文字模块，增加语音输入处理功能
- 接入喇叭，增加文字转语音模块
- 尝试电烙铁焊接
- 学习 PCB 制作优化
- 网上项目复刻
