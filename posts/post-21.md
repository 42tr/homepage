---
title: "大模型文档处理之 doc"
date: 2025-03-19
tags: ["大模型","文档处理"]
summary: "doc 需要特殊处理~"
---

常用的文档处理工具如下
```python
from langchain_community.document_loaders import (
    BSHTMLLoader,
    CSVLoader,
    Docx2txtLoader,
    OutlookMessageLoader,
    PyPDFLoader,
    TextLoader,
    UnstructuredEPubLoader,
    UnstructuredExcelLoader,
    UnstructuredMarkdownLoader,
    UnstructuredPowerPointLoader,
    UnstructuredRSTLoader,
    UnstructuredXMLLoader,
    YoutubeLoader,
)
```

问题：docx 可以用 Docx2txtLoader 处理，但是 doc 不行，估计是 doc 格式太老了，不想适配了。

尝试过的无效方案：
- 使用 `from langchain_community.document_loaders import UnstructuredWordDocumentLoader`
- 使用 `pandoc`（不支持 doc 的处理）


可行的解决方案：使用 `LibreOffice`
```python
subprocess.check_output([SOFFICE_PATH, "--headless", "--convert-to", "docx", file_path, "--outdir", dir])
```
