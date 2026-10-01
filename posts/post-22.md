---
title: "docx 生成"
date: 2025-04-01
tags: ["文档处理","docx"]
summary: "python 生成 docx，以及 html 转 docx，使用 docx 库~"
---

## 注意点
- docx 文档携带的样式表不同，存在时直接配置 style 即可，不存在则要使用 `doc.styles.add_style(style, 1)` 配置
- `run.font.name = fontname` 修改中文字体可能无效（测试时发现标题的字体修改失败），因为 docx 只修改 latin 字体，但 eastAsia 才控制中文 `run._element.rPr.rFonts.set(qn("w:eastAsia"), fontname)`

## 关键代码
```python
class HTMLRequest(BaseModel):
    html: str
    type: Optional[str] = None
    template_id: Optional[str] = None

@router.post("/gen_template")
async def gen_template(request: HTMLRequest, bgtasks: BackgroundTasks):
    """
    制式输出
    """
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"{date_str}_{str(uuid.uuid4())[:8]}.docx"
    output_path = os.path.join(STATIC_DIR, output_filename)

    if request.template_id is None:
        await gen_doc_without_template(request.html, output_path)
    else:
        await gen_doc_with_template(request.html, request.template_id, output_path)

    filename = output_filename
    filepath = output_path
    if request.type is not None and request.type == "wps":
        filepath = convert_docx_to_wps(output_path)
        filename = filename.replace(".docx", ".wps")
    elif request.type is not None and request.type == "pdf":
        filepath = convert_docx_to_pdf(output_path)
        filename = filename.replace(".docx", ".pdf")

    # 添加后台任务，返回文件后自动删除
    bgtasks.add_task(cleanup_file, output_path)
    if filepath != output_path:
        bgtasks.add_task(cleanup_file, filepath)
    return FileResponse(
        path = filepath,
        media_type = 'application/octet-stream',
        filename = filename,
        headers = {
            'Content-Disposition': f'attachment; filename="{quote(filename)}"'
        }
    )

FONT_NAME = {'h1': 'SimHei', 'h2': '楷体', 'h3': '仿宋', 'h4': '仿宋', 'p': '仿宋'}
FONT_SIZE = Pt(16)


# 首行缩进
def add_indent(paragraph, indent_chars=2):
    pPr = paragraph._element.get_or_add_pPr()
    ind = OxmlElement('w:ind')
    ind.set(qn("w:firstLine"), str(indent_chars * 300))  # 1个中文字符约300单位
    pPr.append(ind)

# 根据模板以及 html 生成 docx
async def gen_doc_with_template(html: str, template_id: str, output_path: str):
    template = Templates.get_template_by_id(template_id)
    if template is None:
        return
    filename = template.template_path.split("/")[-1]
    template_path = os.path.join(TEMPLATE_DIR, filename)
    doc = Document(template_path)
    available_styles = [s.name for s in doc.styles]
    for paragraph in doc.paragraphs:
        if "content" in paragraph.text:
            paragraph.clear()
            soup = BeautifulSoup(html, 'html.parser')
            def recursive_parse(element, paragraph):
                for child in element.children:
                    if not child.name:
                        continue
                    if child.name.startswith('h') and child.name[1:].isdigit():
                        heading = paragraph.insert_paragraph_before(child.get_text())
                        style = "Heading %s" % child.name[1:]
                        if style in available_styles:
                            heading.style = style
                        else:
                            heading.style = doc.styles.add_style(style, 1)
                        for run in heading.runs:
                            run.font.size = FONT_SIZE
                            run.font.name = FONT_NAME[child.name]
                            # 直接用 run.font.name = fontname 可能无效，因为 docx 只修改 latin 字体，但 eastAsia 才控制中文
                            run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_NAME[child.name])
                            run.font.color.rgb = RGBColor(0, 0, 0)
                            run.font.italic = False
                    elif child.name == 'p':
                        para = paragraph.insert_paragraph_before(child.get_text())
                        for run in para.runs:
                            run.font.size = FONT_SIZE
                            run.font.name = FONT_NAME[child.name]
                            run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_NAME[child.name])
                            run.font.color.rgb = RGBColor(0, 0, 0)
                        add_indent(para, indent_chars=2)
                    else:
                        recursive_parse(child, paragraph)

            recursive_parse(soup, paragraph)

    doc.save(output_path)

# 根据 html 生成 docx
async def gen_doc_without_template(html: str, output_path: str):
    soup = BeautifulSoup(html, 'html.parser')
    doc = Document()
    available_styles = [s.name for s in doc.styles]

    def recursive_parse(element, doc):
        for child in element.children:
            if child.name:
                if child.name.startswith('h') and child.name[1:].isdigit():
                    heading = doc.add_paragraph(child.get_text())
                    style = "Heading %s" % child.name[1:]
                    if style in available_styles:
                        heading.style = style
                    else:
                        heading.style = doc.styles.add_style(style, 1)
                    for run in heading.runs:
                        run.font.size = FONT_SIZE
                        run.font.name = FONT_NAME[child.name]
                        run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_NAME[child.name])
                        run.font.color.rgb = RGBColor(0, 0, 0)
                        run.font.italic = False
                elif child.name == 'p':
                    para = doc.add_paragraph(child.get_text())
                    for run in para.runs:
                        run.font.size = FONT_SIZE
                        run.font.name = FONT_NAME[child.name]
                        run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_NAME[child.name])
                        run.font.color.rgb = RGBColor(0, 0, 0)
                    add_indent(para, indent_chars=2)
                else:
                    recursive_parse(child, doc)

    recursive_parse(soup, doc)
    doc.save(output_path)


# 定义清理文件的函数
def cleanup_file(filepath: str):
    try:
        os.remove(filepath)
        log.info(f"已成功删除文件: {filepath}")
    except OSError as e:
        log.error(f"删除文件失败 {filepath}: {e}")

# docx 转 pdf
def convert_docx_to_pdf(input_path) -> str:
    output_path = input_path.replace(".docx", ".pdf")
    try:
        subprocess.run(["libreoffice", "--headless", "--convert-to", "pdf", input_path, "--outdir", STATIC_DIR], check=True)
        print(f"转换成功: {output_path}")
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"转换失败: {e}")
        return ""

# docx 转 wps
def convert_docx_to_wps(input_path) -> str:
    output_path = input_path.replace(".docx", ".wps")
    try:
        subprocess.run(["libreoffice", "--headless", "--convert-to", "wps", input_path, "--outdir", STATIC_DIR], check=True)
        print(f"转换成功: {output_path}")
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"转换失败: {e}")
        return ""

```
