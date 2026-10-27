# 维护导出文件

正文位于 `docs/`，结构化数据位于 `data/design.json`。修改源文件后核对图示中的文字和数字，再更新阅读附件。

1. `build_visuals.py`：生成五张 SVG 规则图。
2. `render_diagrams.mjs`：用 sharp 将 SVG 导出 PNG。
3. `build_document.py`：读取正文与图示，使用 reportlab 导出 PDF 和本地 HTML 阅读版；当前字体路径为 Windows 黑体。
4. `build_workbook.mjs`：使用 `@oai/artifact-tool` 从 JSON 生成工作簿，重算、检查蓄力边界并导出。需要在能解析该包的 Node 环境运行。
5. `verify_design.py`：使用 pypdf 检查参数关系、CSV 一致性和 PDF 内容；不运行游戏功能测试。

CSV 需与 JSON 一起维护。文档校验记录说明检查范围；游戏用例只有在引擎原型中执行并记录证据后才能标为通过。预览和临时检查文件不提交。
