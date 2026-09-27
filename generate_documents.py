import os
import re
import html
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Sets background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell padding."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def create_docx(md_path, docx_path):
    print("Generating DOCX...")
    doc = Document()

    # Page setup - Standard Letter with 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Style colors
    COLOR_PRIMARY = RGBColor(30, 58, 138)     # Deep Navy #1E3A8A
    COLOR_SECONDARY = RGBColor(37, 99, 235)   # Blue #2563EB
    COLOR_DARK = RGBColor(30, 41, 59)         # Dark Slate #1E293B
    COLOR_BODY = RGBColor(51, 65, 85)         # Charcoal #334155
    COLOR_MUTED = RGBColor(100, 116, 139)     # Slate Muted #64748B

    # Document Title Page
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(40)
    title_p.paragraph_format.space_after = Pt(8)
    title_run = title_p.add_run("RESQLINK")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(32)
    title_run.font.bold = True
    title_run.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(16)
    sub_run = sub_p.add_run("Comprehensive Technical & Product Dossier")
    sub_run.font.name = "Arial"
    sub_run.font.size = Pt(16)
    sub_run.font.color.rgb = COLOR_SECONDARY

    tag_p = doc.add_paragraph()
    tag_p.paragraph_format.space_before = Pt(0)
    tag_p.paragraph_format.space_after = Pt(28)
    tag_run = tag_p.add_run('“When help is nearby, make it reachable.”')
    tag_run.font.name = "Arial"
    tag_run.font.size = Pt(13)
    tag_run.font.italic = True
    tag_run.font.color.rgb = COLOR_MUTED

    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Platform", "ResQLink Emergency Coordination System"),
        ("Architecture", "Next.js 14 App Router, Prisma ORM, SQLite, Leaflet"),
        ("Document Version", "1.0.0 (Production Hackathon Build & Audit)"),
        ("Target Roles", "Citizens, Verified Volunteers, Crisis Command Admins"),
        ("Classification", "Technical Dossier & Presentation Handoff Document"),
    ]
    for i, (k, v) in enumerate(meta_data):
        row = meta_table.rows[i]
        c1, c2 = row.cells[0], row.cells[1]
        c1.width = Inches(2.2)
        c2.width = Inches(4.3)
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(k)
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = COLOR_DARK
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(v)
        r2.font.size = Pt(10)
        r2.font.color.rgb = COLOR_BODY
        set_cell_background(c1, "F8FAFC")
        set_cell_background(c2, "FFFFFF")
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c2, top=60, bottom=60, left=100, right=100)

    doc.add_page_break()

    # Parse and render Markdown content
    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    in_code_block = False
    code_lines = []
    in_table = False
    table_rows = []

    def flush_table(rows):
        if not rows:
            return
        parsed_rows = []
        for r in rows:
            # Split by | and strip
            parts = [c.strip() for c in r.strip().strip("|").split("|")]
            # Filter out separator rows like |---|---|
            if any(re.match(r"^:?-+:?$", c) for c in parts):
                continue
            if parts and any(parts):
                parsed_rows.append(parts)

        if not parsed_rows:
            return

        col_count = max(len(r) for r in parsed_rows)
        tbl = doc.add_table(rows=len(parsed_rows), cols=col_count)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

        for row_idx, row_data in enumerate(parsed_rows):
            is_header = (row_idx == 0)
            table_row = tbl.rows[row_idx]
            for col_idx in range(col_count):
                cell = table_row.cells[col_idx]
                text = row_data[col_idx] if col_idx < len(row_data) else ""
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(3)
                run = p.add_run(clean_md_formatting(text))
                run.font.name = "Arial"
                run.font.size = Pt(9)
                if is_header:
                    run.font.bold = True
                    run.font.color.rgb = RGBColor(255, 255, 255)
                    set_cell_background(cell, "1E3A8A")
                else:
                    run.font.color.rgb = COLOR_BODY
                    bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
                    set_cell_background(cell, bg)
                set_cell_margins(cell, top=60, bottom=60, left=100, right=100)

        p_spacer = doc.add_paragraph()
        p_spacer.paragraph_format.space_before = Pt(6)
        p_spacer.paragraph_format.space_after = Pt(6)

    def clean_md_formatting(t):
        t = re.sub(r"\*\*(.*?)\*\*", r"\1", t)
        t = re.sub(r"\*(.*?)\*", r"\1", t)
        t = re.sub(r"`(.*?)`", r"\1", t)
        t = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", t)
        t = t.replace("\\$", "$")
        return t

    for line in lines:
        line_str = line.rstrip()

        # Handle Code Blocks
        if line_str.startswith("```"):
            if in_code_block:
                # End code block
                in_code_block = False
                code_text = "\n".join(code_lines)
                code_p = doc.add_paragraph()
                code_p.paragraph_format.space_before = Pt(4)
                code_p.paragraph_format.space_after = Pt(6)
                code_p.paragraph_format.left_indent = Inches(0.2)
                code_run = code_p.add_run(code_text)
                code_run.font.name = "Consolas"
                code_run.font.size = Pt(8.5)
                code_run.font.color.rgb = RGBColor(30, 41, 59)
                code_lines = []
            else:
                if in_table:
                    flush_table(table_rows)
                    in_table = False
                    table_rows = []
                in_code_block = True
                code_lines = []
            continue

        if in_code_block:
            code_lines.append(line_str)
            continue

        # Handle Tables
        if line_str.startswith("|") and line_str.endswith("|"):
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(line_str)
            continue
        elif in_table:
            flush_table(table_rows)
            in_table = False
            table_rows = []

        # Handle Headings
        if line_str.startswith("# "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(22)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_md_formatting(line_str[2:]))
            run.font.name = "Arial"
            run.font.size = Pt(20)
            run.font.bold = True
            run.font.color.rgb = COLOR_PRIMARY

        elif line_str.startswith("## "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_md_formatting(line_str[3:]))
            run.font.name = "Arial"
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = COLOR_SECONDARY

        elif line_str.startswith("### "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_md_formatting(line_str[4:]))
            run.font.name = "Arial"
            run.font.size = Pt(11.5)
            run.font.bold = True
            run.font.color.rgb = COLOR_DARK

        elif line_str.startswith("---"):
            # Horizontal rule divider
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run("―" * 50)
            run.font.color.rgb = RGBColor(226, 232, 240)

        elif line_str.startswith("> "):
            # Blockquote
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(clean_md_formatting(line_str[2:]))
            run.font.name = "Arial"
            run.font.size = Pt(10)
            run.font.italic = True
            run.font.color.rgb = COLOR_PRIMARY

        elif line_str.startswith("* ") or line_str.startswith("- "):
            # Bullet list item
            p = doc.add_paragraph(style="List Bullet")
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            text = line_str[2:]
            format_inline_text(p, text, COLOR_BODY)

        elif re.match(r"^\d+\.\s", line_str):
            # Numbered list item
            p = doc.add_paragraph(style="List Number")
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            text = re.sub(r"^\d+\.\s", "", line_str)
            format_inline_text(p, text, COLOR_BODY)

        elif line_str.strip():
            # Standard paragraph
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.15
            format_inline_text(p, line_str, COLOR_BODY)

    if in_table:
        flush_table(table_rows)

    doc.save(docx_path)
    print(f"DOCX successfully generated at: {docx_path}")

def format_inline_text(paragraph, text, base_color):
    """Parses bold and inline code in paragraphs."""
    tokens = re.split(r"(\*\*.*?\*\*|`.*?`|\*.*?\*)", text)
    for tok in tokens:
        if not tok:
            continue
        if tok.startswith("**") and tok.endswith("**"):
            r = paragraph.add_run(tok[2:-2])
            r.font.name = "Arial"
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(15, 23, 42)
        elif tok.startswith("`") and tok.endswith("`"):
            r = paragraph.add_run(tok[1:-1])
            r.font.name = "Consolas"
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(225, 29, 72)
        elif tok.startswith("*") and tok.endswith("*"):
            r = paragraph.add_run(tok[1:-1])
            r.font.name = "Arial"
            r.font.size = Pt(10)
            r.font.italic = True
            r.font.color.rgb = base_color
        else:
            r = paragraph.add_run(tok)
            r.font.name = "Arial"
            r.font.size = Pt(10)
            r.font.color.rgb = base_color

def create_html(md_path, html_path):
    print("Generating HTML...")
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Convert Markdown to clean HTML with modern design
    import markdown
    # If markdown module not installed, we can do regex or simple conversion
    try:
        import markdown
        html_body = markdown.markdown(md_text, extensions=["tables", "fenced_code", "toc"])
    except ImportError:
        # Fallback simple converter
        html_body = fallback_md_to_html(md_text)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ResQLink — Comprehensive Technical & Product Dossier</title>
  <style>
    :root {{
      --primary: #1e3a8a;
      --primary-light: #3b82f6;
      --secondary: #0f172a;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #334155;
      --text-heading: #0f172a;
      --code-bg: #f1f5f9;
      --tag: #ecfdf5;
      --tag-text: #065f46;
    }}

    @media print {{
      body {{ background: white !important; padding: 0 !important; }}
      .no-print {{ display: none !important; }}
      .page-break {{ page-break-after: always; }}
      @page {{
        margin: 1.8cm;
        size: A4 portrait;
      }}
    }}

    * {{ box-sizing: border-box; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      color: var(--text);
      background-color: var(--bg);
      margin: 0;
      padding: 40px 20px;
    }}

    .document-container {{
      max-width: 960px;
      margin: 0 auto;
      background: var(--card-bg);
      padding: 60px 80px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border);
    }}

    /* Action Bar */
    .action-bar {{
      position: sticky;
      top: 20px;
      z-index: 100;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 24px;
    }}
    .btn {{
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }}
    .btn-primary {{
      background: var(--primary);
      color: white;
    }}
    .btn-primary:hover {{ background: #1d4ed8; }}

    /* Header & Cover */
    .cover-badge {{
      display: inline-block;
      padding: 4px 12px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }}
    h1.doc-title {{
      font-size: 38px;
      font-weight: 900;
      color: var(--primary);
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }}
    .doc-subtitle {{
      font-size: 20px;
      font-weight: 600;
      color: var(--primary-light);
      margin: 0 0 12px 0;
    }}
    .doc-tagline {{
      font-size: 16px;
      font-style: italic;
      color: #64748b;
      margin: 0 0 32px 0;
    }}

    .meta-grid {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 40px;
    }}
    .meta-item {{ font-size: 13px; }}
    .meta-label {{ font-weight: 700; color: var(--text-heading); margin-right: 6px; }}

    /* Headings */
    h1 {{
      font-size: 24px;
      font-weight: 800;
      color: var(--primary);
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-top: 48px;
      margin-bottom: 16px;
    }}
    h2 {{
      font-size: 18px;
      font-weight: 700;
      color: var(--primary-light);
      margin-top: 32px;
      margin-bottom: 12px;
    }}
    h3 {{
      font-size: 15px;
      font-weight: 700;
      color: var(--text-heading);
      margin-top: 24px;
      margin-bottom: 8px;
    }}

    /* Tables */
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      margin: 20px 0;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }}
    th {{
      background: #1e3a8a;
      color: white;
      text-align: left;
      padding: 10px 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }}
    td {{
      padding: 9px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: var(--text);
    }}
    tr:nth-child(even) {{ background-color: #f8fafc; }}
    tr:hover {{ background-color: #f1f5f9; }}

    /* Code Blocks */
    pre {{
      background: #0f172a;
      color: #e2e8f0;
      padding: 16px 20px;
      border-radius: 10px;
      font-family: "Consolas", "Courier New", monospace;
      font-size: 12px;
      overflow-x: auto;
      line-height: 1.5;
      margin: 18px 0;
    }}
    code {{
      font-family: "Consolas", "Courier New", monospace;
      font-size: 0.9em;
      background: #f1f5f9;
      color: #e11d48;
      padding: 2px 6px;
      border-radius: 4px;
    }}
    pre code {{
      background: none;
      color: inherit;
      padding: 0;
    }}

    /* Quotes */
    blockquote {{
      border-left: 4px solid var(--primary-light);
      padding: 12px 18px;
      margin: 16px 0;
      background: #eff6ff;
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: #1e40af;
    }}

    /* Lists */
    ul, ol {{
      padding-left: 24px;
      margin: 12px 0;
    }}
    li {{
      margin-bottom: 6px;
      font-size: 14px;
    }}

    hr {{
      border: none;
      border-top: 1px solid var(--border);
      margin: 36px 0;
    }}
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn btn-primary" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    <div class="cover-badge">Official Hackathon Project Handoff</div>
    <h1 class="doc-title">RESQLINK</h1>
    <div class="doc-subtitle">Comprehensive Technical & Product Dossier</div>
    <div class="doc-tagline">“When help is nearby, make it reachable.”</div>

    <div class="meta-grid">
      <div class="meta-item"><span class="meta-label">Platform:</span> ResQLink Emergency Coordination Platform</div>
      <div class="meta-item"><span class="meta-label">Architecture:</span> Next.js 14 App Router, Prisma ORM, SQLite</div>
      <div class="meta-item"><span class="meta-label">Version:</span> 1.0.0 (Production Hackathon Build)</div>
      <div class="meta-item"><span class="meta-label">Target Roles:</span> Citizen, Volunteer, Emergency Operations Admin</div>
    </div>

    <hr>

    <div class="markdown-content">
      {html_body}
    </div>
  </div>
</body>
</html>
"""

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"HTML successfully generated at: {html_path}")

def fallback_md_to_html(md):
    """Lightweight markdown to HTML converter for standard elements."""
    lines = md.split("\n")
    out = []
    in_code = False
    in_table = False
    table_rows = []

    for l in lines:
        if l.startswith("```"):
            if in_code:
                in_code = False
                out.append("</pre>")
            else:
                in_code = True
                out.append("<pre><code>")
            continue

        if in_code:
            out.append(html.escape(l))
            continue

        if l.startswith("|") and l.endswith("|"):
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(l)
            continue
        elif in_table:
            out.append(render_html_table(table_rows))
            in_table = False
            table_rows = []

        if l.startswith("# "):
            out.append(f"<h1>{html.escape(l[2:])}</h1>")
        elif l.startswith("## "):
            out.append(f"<h2>{html.escape(l[3:])}</h2>")
        elif l.startswith("### "):
            out.append(f"<h3>{html.escape(l[4:])}</h3>")
        elif l.startswith("---"):
            out.append("<hr>")
        elif l.startswith("> "):
            out.append(f"<blockquote>{html.escape(l[2:])}</blockquote>")
        elif l.startswith("* ") or l.startswith("- "):
            out.append(f"<ul><li>{html.escape(l[2:])}</li></ul>")
        elif re.match(r"^\d+\.\s", l):
            clean_item = re.sub(r"^\d+\.\s", "", l)
            out.append(f"<ol><li>{html.escape(clean_item)}</li></ol>")
        elif l.strip():
            formatted = html.escape(l)
            formatted = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", formatted)
            formatted = re.sub(r"`(.*?)`", r"<code>\1</code>", formatted)
            out.append(f"<p>{formatted}</p>")

    if in_table:
        out.append(render_html_table(table_rows))

    return "\n".join(out)

def render_html_table(rows):
    html_tbl = ["<table>"]
    header = True
    for r in rows:
        parts = [c.strip() for c in r.strip().strip("|").split("|")]
        if any(re.match(r"^:?-+:?$", c) for c in parts):
            continue
        tag = "th" if header else "td"
        html_tbl.append("<tr>" + "".join(f"<{tag}>{html.escape(c)}</{tag}>" for c in parts) + "</tr>")
        header = False
    html_tbl.append("</table>")
    return "\n".join(html_tbl)

if __name__ == "__main__":
    src_md = r"c:\Users\karth\OneDrive\Desktop\hackathon\RESQLINK_PROJECT_DOSSIER.md"
    out_docx = r"c:\Users\karth\OneDrive\Desktop\hackathon\ResQLink_Project_Dossier.docx"
    out_html = r"c:\Users\karth\OneDrive\Desktop\hackathon\ResQLink_Project_Dossier.html"

    create_docx(src_md, out_docx)
    create_html(src_md, out_html)
    print("All documents generated successfully!")
