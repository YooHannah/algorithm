# ================================
# Standard library imports
# ================================
import base64
import json
from html import escape
from typing import Any

# ================================
# Third-party imports
# ================================
import pandas as pd
try:
    from IPython.display import HTML, display
    _IPYTHON_AVAILABLE = True
except ImportError:
    _IPYTHON_AVAILABLE = False
    HTML = None
    display = None


def _in_notebook() -> bool:
    """Return True if running inside a Jupyter/IPython notebook, False for plain terminal."""
    if not _IPYTHON_AVAILABLE:
        return False
    try:
        from IPython import get_ipython
        shell = get_ipython()
        if shell is None:
            return False
        klass = shell.__class__.__name__
        return "ZMQInteractiveShell" in klass or "Shell" in klass
    except Exception:
        return False


def _term_box(text_block: str, header: str | None = None) -> str:
    """Render text_block inside a Unicode box suitable for terminal display."""
    lines = text_block.splitlines() or [""]
    width = max(len(line) for line in lines)
    if header:
        width = max(width, len(header) + 2)
    border = "─" * (width + 2)
    out = [f"┌{border}┐"]
    if header:
        out.append(f"│ {header.ljust(width)} │")
        out.append(f"├{border}┤")
    for line in lines:
        out.append(f"│ {line.ljust(width)} │")
    out.append(f"└{border}┘")
    return "\n".join(out)


def render_pretty_table_html(df: pd.DataFrame, title: str = "Data Table") -> str:
    table_html = df.to_html(index=False, classes="styled-table")
    return f"""
    <style>
      .styled-table {{
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 14px;
        width: 100%;
        color: black;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
      }}
      .styled-table th, .styled-table td {{
        border: 1px solid #ddd;
        padding: 8px;
      }}
      .styled-table th {{
        background-color: #007acc;
        color: white;
        text-align: left;
      }}
      .styled-table tr:nth-child(even) {{ background-color: #e6f4ff; }}
      .styled-table tr:nth-child(odd)  {{ background-color: white;    }}
    </style>
    <h3>{escape(title)}</h3>
    {table_html}
    """


def format_logs_as_pretty_html(logs: list[dict], logo_path: str = "dl_logo.jpg") -> str:
    status_styles = {
        "success": {"bg": "#e0f0ff", "color": "#000000"},
        "fixed":   {"bg": "#fffbe6", "color": "#333333"},
        "error":   {"bg": "#ffe6e6", "color": "#000000"},
    }
    card_blocks = ""
    for log in logs:
        status = log.get("status", "success")
        style = status_styles.get(status, {"bg": "#f4f4f4", "color": "#000000"})
        bg, text_color = style["bg"], style["color"]
        step = escape(str(log.get("step", "")))
        desc = escape(str(log.get("description", "")))
        stxt = escape(str(status))
        card_blocks += f"""
        <div style="display:flex;align-items:center;background-color:{bg};margin:12px 0;
                    padding:12px 16px;border-radius:8px;box-shadow:2px 2px 5px rgba(0,0,0,0.05);">
          <img src="https://coursera-university-assets.s3.amazonaws.com/b4/5cb90bb92f420b99bf323a0356f451/Icon.png"
               alt="Logo" style="height:60px;margin-right:16px;border-radius:6px;"/>
          <div style="color:{text_color};">
            <h3 style="margin:0 0 4px 0;">Step {step}</h3>
            <p style="margin:4px 0;font-size:14px;">{desc}</p>
            <p style="margin:4px 0;"><strong>Status:</strong> <code>{stxt}</code></p>
          </div>
        </div>
        """
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:800px;margin:auto;">
      <div style="text-align:center;padding:20px 0;">
        <img src="https://learn.deeplearning.ai/assets/dlai-logo.png" alt="Logo" style="max-height:80px;"/>
        <h2 style="margin-top:10px;">Customer Return Workflow Summary</h2>
      </div>
      {card_blocks}
    </div>
    """


def render_image_with_quote_html(image_url: str, quote: str, width: int = 512) -> None:
    if not _in_notebook():
        lines = [
            f"[Image] {image_url}",
            f"\"{quote}\"",
        ]
        print(_term_box("\n".join(lines), header="Image with Quote"))
        return
    html = f"""
    <div style="position:relative;width:{width}px;margin-bottom:20px;">
      <img src="{escape(image_url)}" style="width:100%;border-radius:8px;display:block;">
      <div style="
          position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
          background:rgba(0,0,0,0.6);color:white;padding:10px 20px;border-radius:8px;
          font-size:1.2em;font-family:'Segoe UI',sans-serif;font-weight:500;text-align:center;
          text-shadow:1px 1px 4px #000;">
        {escape(quote)}
      </div>
    </div>
    """
    display(HTML(html))


def log_tool_call_html(tool_name: str, arguments: Any) -> None:
    if not _in_notebook():
        lines = [
            f"📞 Tool Call: {tool_name}",
            str(arguments),
        ]
        print(_term_box("\n".join(lines), header="Tool Call"))
        return
    display(HTML(f"""
      <div style="border-left:4px solid #1976D2;padding:.8em;margin:1em 0;
                  background-color:#e3f2fd;color:#0D47A1;font-family:'Segoe UI',sans-serif;">
        <div style="font-size:15px;font-weight:bold;margin-bottom:4px;">
          📞 <span style="color:#0B3D91;">Tool Call:</span> <span style="color:#0B3D91;">{escape(str(tool_name))}</span>
        </div>
        <code style="display:block;background:#e8f0fe;color:#1b1b1b;padding:6px;border-radius:4px;
                     font-size:13px;white-space:pre-wrap;">{escape(str(arguments))}</code>
      </div>
    """))


def log_tool_result_html(result: Any) -> None:
    if not _in_notebook():
        print(_term_box(str(result), header="✅ Tool Result"))
        return
    display(HTML(f"""
      <div style="border-left:4px solid #558B2F;padding:.8em;margin:1em 0;
                  background-color:#f1f8e9;color:#33691E;">
        <strong>✅ Tool Result:</strong>
        <pre style="white-space:pre-wrap;font-size:13px;color:#2E7D32;">{escape(str(result))}</pre>
      </div>
    """))


def log_final_summary_html(content: str) -> None:
    if not _in_notebook():
        print(_term_box(content.strip(), header="✅ Final Summary"))
        return
    display(HTML(f"""
      <div style="border-left:4px solid #2E7D32;padding:1em;margin:1em 0;
                  background-color:#e8f5e9;color:#1B5E20;">
        <strong>✅ Final Summary:</strong>
        <pre style="white-space:pre-wrap;font-size:13px;color:#1B5E20;">{escape(content.strip())}</pre>
      </div>
    """))


def log_unexpected_html() -> None:
    if not _in_notebook():
        print(_term_box("No tool_calls or content returned.", header="⚠️ Unexpected"))
        return
    display(HTML("""
      <div style="border-left:4px solid #F57C00;padding:1em;margin:1em 0;
                  background-color:#fff3e0;color:#E65100;">
        <strong>⚠️ Unexpected:</strong> No tool_calls or content returned.
      </div>
    """))


def log_agent_title_html(title: str, icon: str = "🕵️‍♂️") -> None:
    if not _in_notebook():
        print(_term_box(f"{icon} {title}", header="Agent"))
        return
    display(HTML(f"""
      <div style="padding:1em;margin:1em 0;background-color:#f0f4f8;border-left:6px solid #1976D2;">
        <h2 style="margin:0;color:#0D47A1;font-family:'Segoe UI',sans-serif;">
          {escape(icon)} {escape(title)}
        </h2>
      </div>
    """))


def print_html(content: Any, title: str | None = None, is_image: bool = False) -> None:
    """
    Pretty-print inside a styled card.
    - If is_image=True and content is a string: treat as image path/URL and render <img>.
    - If content is a pandas DataFrame/Series: render as an HTML table.
    - Otherwise (strings): show as code/text in <pre><code>.
    Auto-detects Jupyter notebook vs plain terminal and uses the appropriate renderer.
    """
    if not _in_notebook():
        if is_image and isinstance(content, str):
            body = f"[Image] {content}  (cannot display in terminal)"
            print(_term_box(body, header=title))
            return

        if isinstance(content, (pd.DataFrame, pd.Series)):
            df = content if isinstance(content, pd.DataFrame) else content.to_frame()
            try:
                import tabulate
                body = tabulate.tabulate(df, headers="keys", tablefmt="grid", showindex=False)
            except ImportError:
                body = df.to_string(index=False)
            print(_term_box(body, header=title))
            return

        if isinstance(content, str):
            body = content
        else:
            body = str(content)
        print(_term_box(body, header=title))
        return

    def image_to_base64(image_path: str) -> str:
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode("utf-8")

    if is_image and isinstance(content, str):
        b64 = image_to_base64(content)
        rendered = f'<img src="data:image/png;base64,{b64}" alt="Image" style="max-width:100%;height:auto;border-radius:8px;">'
    elif isinstance(content, pd.DataFrame):
        rendered = content.to_html(classes="pretty-table", index=False, border=0, escape=False)
    elif isinstance(content, pd.Series):
        rendered = content.to_frame().to_html(classes="pretty-table", border=0, escape=False)
    elif isinstance(content, str):
        rendered = f"<pre><code>{escape(content)}</code></pre>"
    else:
        rendered = f"<pre><code>{escape(str(content))}</code></pre>"

    css = """
    <style>
      .pretty-card{
        font-family: ui-sans-serif, system-ui;
        border: 2px solid transparent;
        border-radius: 14px;
        padding: 14px 16px;
        margin: 10px 0;
        background: linear-gradient(#fff, #fff) padding-box,
                    linear-gradient(135deg, #3b82f6, #9333ea) border-box;
        color: #111;
        box-shadow: 0 4px 12px rgba(0,0,0,.08);
      }
      .pretty-title{
        font-weight:700;
        margin-bottom:8px;
        font-size:14px;
        color:#111;
      }
      /* 🔒 Scopeado SOLO a la tarjeta */
      .pretty-card pre,
      .pretty-card code {
        background: #f3f4f6;
        color: #111;
        padding: 8px;
        border-radius: 8px;
        display: block;
        overflow-x: auto;
        font-size: 13px;
        white-space: pre-wrap;
      }
      .pretty-card img { max-width:100%; height:auto; border-radius:8px; }
      .pretty-card table.pretty-table {
        border-collapse: collapse;
        width: 100%;
        font-size: 13px;
        color: #111;
      }
      .pretty-card table.pretty-table th,
      .pretty-card table.pretty-table td {
        border: 1px solid #e5e7eb;
        padding: 6px 8px;
        text-align: left;
      }
      .pretty-card table.pretty-table th { background: #f9fafb; font-weight: 600; }
    </style>
    """
    title_html = f'<div class="pretty-title">{escape(title)}</div>' if title else ""
    card = f'<div class="pretty-card">{title_html}{rendered}</div>'
    display(HTML(css + card))
