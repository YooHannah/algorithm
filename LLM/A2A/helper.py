import json
import textwrap
from dotenv import load_dotenv, find_dotenv
def load_env():
    _ = load_dotenv(find_dotenv())

def _box(title: str, content: str, width: int = 88) -> str:
    lines = []
    title_bar = f" {title} "
    pad = width - 2 - len(title_bar)
    lines.append(f"┌{title_bar}{'─' * max(pad, 0)}┐")
    for raw in content.splitlines() or [""]:
        wrapped = textwrap.wrap(raw, width=width - 4) or [""]
        for w in wrapped:
            lines.append(f"│ {w}{' ' * (width - 3 - len(w))}│")
    lines.append(f"└{'─' * (width - 2)}┘")
    return "\n".join(lines)


def pretty_print_response(resp) -> None:
    answer_parts = []
    reasoning_parts = []

    for item in (resp.output or []):
        item_type = getattr(item, "type", None)
        if item_type == "message":
            for c in (getattr(item, "content", None) or []):
                txt = getattr(c, "text", None)
                if txt:
                    answer_parts.append(txt)
        elif item_type == "reasoning":
            for s in (getattr(item, "summary", None) or []):
                txt = getattr(s, "text", None)
                if txt:
                    reasoning_parts.append(txt)

    if reasoning_parts:
        print(_box("Reasoning", "\n".join(reasoning_parts)))
        print()

    answer = "\n".join(answer_parts).strip() or "(empty)"
    print(_box("Answer", answer))
    print()

    usage = getattr(resp, "usage", None)
    if usage is not None:
        inp = getattr(usage, "input_tokens", 0)
        out = getattr(usage, "output_tokens", 0)
        total = getattr(usage, "total_tokens", inp + out)
        out_detail = getattr(usage, "output_tokens_details", None)
        reasoning_tok = getattr(out_detail, "reasoning_tokens", 0) if out_detail else 0
        in_detail = getattr(usage, "input_tokens_details", None)
        cached = getattr(in_detail, "cached_tokens", 0) if in_detail else 0

        stats = (
            f"Model      : {getattr(resp, 'model', 'N/A')}\n"
            f"Input      : {inp} tokens  (cached: {cached})\n"
            f"Output     : {out} tokens  (reasoning: {reasoning_tok})\n"
            f"Total      : {total} tokens\n"
            f"Status     : {getattr(resp, 'status', 'N/A')}"
        )
        print(_box("Usage", stats, width=60))
