# ================================
# Standard library imports
# ================================
import base64
import json
import re
from html import escape
from typing import Any, Optional

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

# ================================
# Personal / local imports
# ================================
# 

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

# ================================
# Utility function
# ================================
def print_html(content: Any, title: str | None = None, is_image: bool = False):
    """
    Pretty-print inside a styled card.
    - If is_image=True and content is a string: treat as image path/URL and render <img>.
    - If content is a pandas DataFrame/Series: render as an HTML table.
    - Otherwise (strings/otros): show as code/text in <pre><code>.
    Auto-detects Jupyter notebook vs plain terminal and uses the appropriate renderer.
    """
    try:
        from html import escape as _escape
    except ImportError:
        _escape = lambda x: x

    # ── Terminal (non-notebook) fallback ──────────────────────────────────
    if not _in_notebook():
        def _term_box(text_block: str) -> str:
            lines = text_block.splitlines() or [""]
            width = max(len(line) for line in lines)
            width = max(width, len(title or "") + 2)
            border = "─" * (width + 2)
            out = [f"┌{border}┐"]
            if title:
                out.append(f"│ {title.ljust(width)} │")
                out.append(f"├{border}┤")
            for line in lines:
                out.append(f"│ {line.ljust(width)} │")
            out.append(f"└{border}┘")
            return "\n".join(out)

        if is_image and isinstance(content, str):
            body = f"[Image] {content}  (cannot display in terminal)"
            print(_term_box(body))
            return

        if isinstance(content, (pd.DataFrame, pd.Series)):
            df = content if isinstance(content, pd.DataFrame) else content.to_frame()
            try:
                import tabulate
                body = tabulate.tabulate(df, headers="keys", tablefmt="grid", showindex=False)
            except ImportError:
                body = df.to_string(index=False)
            print(_term_box(body))
            return

        if isinstance(content, str):
            body = content
        else:
            body = str(content)
        print(_term_box(body))
        return

    # ── Jupyter notebook renderer (original) ──────────────────────────────
    def image_to_base64(image_path: str) -> str:
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode("utf-8")

    # Render content
    if is_image and isinstance(content, str):
        b64 = image_to_base64(content)
        rendered = f'<img src="data:image/png;base64,{b64}" alt="Image" style="max-width:100%; height:auto; border-radius:8px;">'
    elif isinstance(content, pd.DataFrame):
        rendered = content.to_html(classes="pretty-table", index=False, border=0, escape=False)
    elif isinstance(content, pd.Series):
        rendered = content.to_frame().to_html(classes="pretty-table", border=0, escape=False)
    elif isinstance(content, str):
        rendered = f"<pre><code>{_escape(content)}</code></pre>"
    else:
        rendered = f"<pre><code>{_escape(str(content))}</code></pre>"

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
    /* 🔒 Solo afecta lo DENTRO de la tarjeta */
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
    .pretty-card img { max-width: 100%; height: auto; border-radius: 8px; }
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

    title_html = f'<div class="pretty-title">{title}</div>' if title else ""
    card = f'<div class="pretty-card">{title_html}{rendered}</div>'
    display(HTML(css + card))