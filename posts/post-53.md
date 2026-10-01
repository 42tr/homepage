---
title: "用 OpenDataLoader PDF 搭一个兼容 MinerU 的解析服务"
date: 2026-08-10
tags: ["PDF", "OpenDataLoader", "FastAPI"]
summary: "把 OpenDataLoader PDF 包装成兼容 /file_parse 的 HTTP 服务，并聊聊格式适配背后的细节。"
---

最近整理了一下 PDF 解析的调用链。上层应用已经按照 MinerU 的 `/file_parse` 接口接入，如果直接替换解析引擎，上传参数、页码规则和返回数据都要跟着修改。于是有了 [opendataloader-pdf-service](https://github.com/42tr/opendataloader-pdf-service)：在 [OpenDataLoader PDF](https://github.com/opendataloader-project/opendataloader-pdf) 外面加一层轻量的 FastAPI 适配器，尽量保持原有调用方式不变。

这个项目不是重新实现 PDF 解析算法。真正的版面分析、文本提取和 Markdown 生成仍由 `opendataloader-pdf` 完成，服务本身负责处理 HTTP 上传、参数转换、结果适配和文件打包。

## 一条请求是怎样完成的

项目只有一个主要接口：`POST /file_parse`。一次请求大致经过下面几个阶段：

```text
multipart 上传
    ↓
分块写入任务目录
    ↓
pdfinfo 读取页数和每页尺寸
    ↓
opendataloader-pdf 生成 JSON、Markdown 和图片
    ↓
转换为兼容的 content_list
    ↓
返回 JSON，或打包为 ZIP
```

服务会为每次请求生成一个 8 位任务 ID，并把文件写入 `output/<task_id>/`。上传文件按 1 MiB 分块落盘，因此不会先把整份 PDF 全部读进内存。解析工作是同步且偏 CPU/IO 密集的，接口通过 FastAPI 的 `run_in_threadpool` 执行，避免直接阻塞异步事件循环。

OpenDataLoader 一次可以接收多份输入，所以批量上传的文件会在一次转换调用中完成。每个文件仍有独立的 `success` 或 `failed` 状态，最终响应还会汇总总数、成功数、失败数和耗时。

## 兼容层主要适配了什么

表面上看，这个服务只是把 Python 函数放到 HTTP 接口后面，实际最有价值的部分是两种数据格式之间的转换。

### 页码规则

接口沿用 `start_page_id` 和 `end_page_id`：从 0 开始，并且包含结束页；OpenDataLoader 的 `pages` 参数从 1 开始。比如：

```text
start_page_id=0, end_page_id=2  -> pages="1-3"
start_page_id=3, end_page_id=3  -> pages="4"
```

如果只给起始页，服务会先通过 `pdfinfo` 获取总页数，再生成从起始页到末页的范围。

### 坐标系统

这是最容易出现“文字对了，框却飘了”的地方。OpenDataLoader 返回 PDF 坐标，原点位于左下角；MinerU 风格的 `bbox` 使用左上角原点，并把每一页分别归一化到 `0-1000`。

服务先用 `pdfinfo -box` 读取每页真实宽高，然后进行坐标翻转和缩放：

```text
x' = x / page_width  * 1000
y' = (page_height - y) / page_height * 1000
```

最终的 `bbox` 固定为 `[x0, y0, x1, y1]` 整数数组，并限制在 `0-1000` 范围内。这里按页读取尺寸很重要，因为同一份 PDF 里可能同时存在横向页和纵向页，不能拿第一页的尺寸套用整份文档。

### 内容列表

OpenDataLoader 的文档 JSON 是树形结构，而兼容接口需要较扁平的 `content_list`。适配器会按元素类型转换：

- 普通段落、标题和列表项转换为 `text`；
- 页眉、页脚保留为 `header`、`footer`；
- 表格转成包含 `rowspan`、`colspan` 的 HTML；
- 图片转换为 `image`，并保留图片路径、页码和坐标。

有些图片会嵌套在列表、表格单元格或页眉中。代码会递归遍历整棵元素树，将这些图片额外提升为独立条目，避免扁平化时悄悄丢失。

当 `return_images=true` 时，解析器输出的图片会转换成 Data URI 放在响应的 `images` 字典中。既支持 OpenDataLoader JSON 已经内嵌的图片，也会扫描外部图片目录并进行 Base64 编码。

## 本地启动

项目使用 Python 3.11 或 3.12，并通过 `uv` 管理依赖。OpenDataLoader PDF 的本地解析器依赖 Java，读取 PDF 元数据还需要 Poppler 提供的 `pdfinfo`。

准备好 `uv`、Java 11+ 和 Poppler 后运行：

```bash
git clone https://github.com/42tr/opendataloader-pdf-service.git
cd opendataloader-pdf-service
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

启动后可以访问 `http://localhost:8000/docs` 查看 Swagger 文档，或通过健康检查确认服务状态：

```bash
curl http://localhost:8000/health
```

返回结果如下：

```json
{"status":"ok","parser":"opendataloader-pdf"}
```

解析一份 PDF：

```bash
curl -X POST 'http://localhost:8000/file_parse' \
  -F 'files=@./example.pdf' \
  -F 'return_md=true' \
  -F 'return_content_list=true' \
  -F 'return_images=true' \
  -o output.json
```

批量上传只需重复 `files` 字段：

```bash
curl -X POST 'http://localhost:8000/file_parse' \
  -F 'files=@./a.pdf' \
  -F 'files=@./b.pdf' \
  -F 'start_page_id=0' \
  -F 'end_page_id=4'
```

如果设置 `response_format_zip=true`，接口会返回 ZIP 文件，其中包含响应 JSON 和本次上传的 PDF。

## 用 Docker 部署

仓库里的 Dockerfile 使用 `python:3.11-slim-bookworm`，并预装 OpenJDK 17 和 `poppler-utils`，省去了宿主机准备解析环境的步骤：

```bash
docker build -t opendataloader-pdf-api .
docker run --rm \
  -p 8000:8000 \
  -v "$PWD/output:/app/output" \
  opendataloader-pdf-api
```

挂载 `output` 目录后，任务文件在容器退出后仍然保留。镜像通过 `uv sync --frozen` 按锁文件安装依赖，部署结果也更容易复现。

## 后端选择与兼容边界

默认的 `backend=pipeline` 使用 OpenDataLoader 本地 Java 解析器。传入 `docling`、`docling-fast` 或 `hybrid` 时会统一映射为 `docling-fast`，这要求另行部署 `opendataloader-pdf-hybrid` 服务；`hancom-ai` 也会原样映射到对应混合后端。其他值会回落到本地解析。

兼容不等于功能完全相同，当前有几个边界需要注意：

- 服务目前面向 PDF，OpenDataLoader 不原生支持 Office 文件；
- `formula_enable`、`table_enable` 等字段为了兼容现有客户端会被接收，但不会改变 OpenDataLoader 的解析行为；
- `output_dir`、语言相关字段和部分中间结果开关同样只保留接口形状；
- 任务目录不会自动清理，长期运行时需要额外配置定时清理或生命周期策略；
- 接口没有内置鉴权、限流和上传大小限制，暴露到公网前应放在网关之后。

这种适配方式的好处是把变化控制在服务端：已有客户端仍然上传同样的 multipart 表单、读取相近的结果结构，而底层解析器可以独立替换和演进。对于依赖 Markdown、版面坐标、表格和图片的 RAG 或文档入库流程，这层小小的边界转换往往比“再写一个解析器”更实用。
