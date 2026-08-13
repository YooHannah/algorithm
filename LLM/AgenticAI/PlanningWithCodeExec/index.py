# Instead of asking the LLM to output a plan in JSON format and then manually executing each step, 
# we will allow it to write Python code that directly captures multiple steps of a plan. 
# By executing this code, we can carry out complex queries automatically.

# 练习planning 模式，自行规划任务并编写代码执行

# ==== Imports ====
from __future__ import annotations
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import re, io, sys, traceback, json
from typing import Any, Dict, Optional
from tinydb import Query, where

# Utility modules
import utils      # helper functions for prompting/printing
import inv_utils  # functions for inventory, transactions, schema building, and TinyDB seeding

load_dotenv()
ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_API_BASE = os.getenv("ARK_API_BASE")
ARK_MODEL_NAME = os.getenv("ARK_MODEL_NAME")
client = OpenAI(
    base_url=ARK_API_BASE,
    api_key=ARK_API_KEY,
)

db, inventory_tbl, transactions_tbl = inv_utils.seed_db()

# utils.print_html(json.dumps(inventory_tbl.all(), indent=2), title="Inventory Table")
# utils.print_html(json.dumps(transactions_tbl.all(), indent=2), title="Transactions Table")

PROMPT = """You are a senior data assistant. PLAN BY WRITING PYTHON CODE USING TINYDB.

Database Schema & Samples (read-only):
{schema_block}

Execution Environment (already imported/provided):
- Variables: db, inventory_tbl, transactions_tbl  # TinyDB Table objects
- Helpers: get_current_balance(tbl) -> float, next_transaction_id(tbl, prefix="TXN") -> str
- Natural language: user_request: str  # the original user message

PLANNING RULES (critical):
- Derive ALL filters/parameters from user_request (shape/keywords, price ranges "under/over/between", stock mentions,
  quantities, buy/return intent). Do NOT hard-code values.
- Build TinyDB queries dynamically with Query(). If a constraint isn't in user_request, don't apply it.
- Be conservative: if intent is ambiguous, do read-only (DRY RUN).

TRANSACTION POLICY (hard):
- Do NOT create aggregated multi-item transactions.
- If the request contains multiple items, create a separate transaction row PER ITEM.
- For each item:
  - compute its own line total (unit_price * qty),
  - insert ONE transaction with that amount,
  - update balance sequentially (balance += line_total),
  - update the item’s stock.
- If any requested item lacks sufficient stock, do NOT mutate anything; reply with STATUS="insufficient_stock".

HUMAN RESPONSE REQUIREMENT (hard):
- You MUST set a variable named `answer_text` (type str) with a short, customer-friendly sentence (1–2 lines).
- This sentence is the only user-facing message. No dataframes/JSON, no boilerplate disclaimers.
- If nothing matches, politely say so and offer a nearby alternative (closest style/price) or a next step.

ACTION POLICY:
- If the request clearly asks to change state (buy/purchase/return/restock/adjust):
    ACTION="mutate"; SHOULD_MUTATE=True; perform the change and write a matching transaction row.
  Otherwise:
    ACTION="read"; SHOULD_MUTATE=False; simulate and explain briefly as a dry run (in logs only).

FAILURE & EDGE-CASE HANDLING (must implement):
- Do not capture outer variables in Query.test. Pass them as explicit args.
- Always set a short `answer_text`. Also set a string `STATUS` to one of:
  "success", "no_match", "insufficient_stock", "invalid_request", "unsupported_intent".
- no_match: No items satisfy the filters → suggest the closest in style/price, or invite a different range.
- insufficient_stock: Item found but stock < requested qty → state available qty and offer the max you can fulfill.
- invalid_request: Unable to parse essential info (e.g., quantity for a purchase/return) → ask for the missing piece succinctly.
- unsupported_intent: The action is outside the store’s capabilities → provide the nearest supported alternative.
- In all cases, keep the tone helpful and concise (1–2 sentences). Put technical details (e.g., ACTION/DRY RUN) only in stdout logs.

OUTPUT CONTRACT:
- Return ONLY executable Python between these tags (no extra text):
  <execute_python>
  # your python
  </execute_python>

CODE CHECKLIST (follow in code):
1) Parse intent & constraints from user_request (regex ok).
2) Build TinyDB condition incrementally; query inventory_tbl.
3) If mutate: validate stock, update inventory, insert a transaction (new id, amount, balance, timestamp).
4) ALWAYS set:
   - `answer_text` (human sentence, required),
   - `STATUS` (see list above).
   Also print a brief log to stdout, e.g., "LOG: ACTION=read DRY_RUN=True STATUS=no_match".
5) Optional: set `answer_rows` or `answer_json` if useful, but `answer_text` is mandatory.

TONE EXAMPLES (for `answer_text`):
- success: "Yes, we have our Classic sunglasses, a round frame, for $60."
- no_match: "We don’t have round frames under $100 in stock right now, but our Moon round frame is available at $120."
- insufficient_stock: "We only have 1 pair of Classic left; I can reserve that for you."
- invalid_request: "I can help with that—how many pairs would you like to purchase?"
- unsupported_intent: "We can’t refurbish frames, but I can suggest similar new models."

Constraints:
- Use TinyDB Query for filtering. Standard library imports only if needed.
- Keep code clear and commented with numbered steps.

User request:
{question}
"""

# ---------- 1) Code generation ----------
def generate_llm_code(
    prompt: str,
    *,
    inventory_tbl,
    transactions_tbl,
    model: str = "gpt-4.1-mini",
    temperature: float = 0.2,
) -> str:
    """
    Ask the LLM to produce a plan-with-code response.
    Returns the FULL assistant content (including surrounding text and tags).
    The actual code extraction happens later in execute_generated_code.
    """
    schema_block = inv_utils.build_schema_block(inventory_tbl, transactions_tbl)
    prompt = PROMPT.format(schema_block=schema_block, question=prompt)

    resp = client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {
                "role": "system",
                "content": "You write safe, well-commented TinyDB code to handle data questions and updates."
            },
            {"role": "user", "content": prompt},
        ],
    )
    content = resp.choices[0].message.content or ""
    
    return content 
 
# Render the results as formatted JSON in the notebook UI
# utils.print_html(json.dumps(round_sunglasses, indent=2), title="Inventory Status: Round Sunglasses")

# # Inspect the LLM’s plan + code (no execution here)
# utils.print_html(full_content_round, title="Plan with Code (Full Response)")

# --- Helper: extract code between <execute_python>...</execute_python> ---
def _extract_execute_block(text: str) -> str:
    """
    Returns the Python code inside <execute_python>...</execute_python>.
    If no tags are found, assumes 'text' is already raw Python code.
    """
    if not text:
        raise RuntimeError("Empty content passed to code executor.")
    m = re.search(r"<execute_python>(.*?)</execute_python>", text, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else text.strip()


# ---------- 2) Code execution ----------
def execute_generated_code(
    code_or_content: str,
    *,
    db,
    inventory_tbl,
    transactions_tbl,
    user_request: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Execute code in a controlled namespace.
    Accepts either raw Python code OR full content with <execute_python> tags.
    Returns minimal artifacts: stdout, error, and extracted answer.
    """
    # Extract code here (now centralized)
    code = _extract_execute_block(code_or_content)

    # Inspect the LLM’s plan + code (no execution here)
    utils.print_html(code, title="real Code (Full Response)")

    SAFE_GLOBALS = {
        "Query": Query,
        "get_current_balance": inv_utils.get_current_balance,
        "next_transaction_id": inv_utils.next_transaction_id,
        "user_request": user_request or "",
    }
    SAFE_LOCALS = {
        "db": db,
        "inventory_tbl": inventory_tbl,
        "transactions_tbl": transactions_tbl,
    }

    # Capture stdout from the executed code
    _stdout_buf, _old_stdout = io.StringIO(), sys.stdout
    sys.stdout = _stdout_buf
    err_text = None
    try:
        exec(code, SAFE_GLOBALS, SAFE_LOCALS)
    except Exception:
        err_text = traceback.format_exc()
    finally:
        sys.stdout = _old_stdout
    printed = _stdout_buf.getvalue().strip()
    utils.print_html(SAFE_LOCALS, title="Plan Execution · SAFE_LOCALS--------- return")

    # Extract possible answers set by the generated code
    answer = (
        SAFE_LOCALS.get("answer_text")
        or SAFE_LOCALS.get("answer_rows")
        or SAFE_LOCALS.get("answer_json")
    )
    return {
        "code": code,            # <- ya sin etiquetas
        "stdout": printed,
        "error": err_text,
        "answer": answer,
        "transactions_tbl": transactions_tbl.all(),  # For inspection
        "inventory_tbl": inventory_tbl.all(),  # For inspection
    }
# ------------------------------------------------------测试1 ------------------------------------------------------
# Andrew's prompt from the lecture
# Item = Query()                    # Create a Query object to reference fields (e.g., Item.name, Item.description)

# Search the inventory table for documents where either the description OR the name
# contains the word "round" (case-insensitive). The check is done inline:
# - (v or "") ensures we handle None by converting it to an empty string
# - .lower() normalizes case
# - " round " enforces a crude word boundary (won't match "wraparound")
# round_sunglasses = inventory_tbl.search(
#     (Item.description.test(lambda v: " round " in ((v or "").lower()))) |
#     (Item.name.test(        lambda v: " round " in ((v or "").lower())))
# )

# prompt_round = "Do you have any round sunglasses in stock that are under $100?"

# Generate the plan-as-code (FULL content; may include <execute_python> tags)
# full_content_round = generate_llm_code(
#     prompt_round,
#     inventory_tbl=inventory_tbl,
#     transactions_tbl=transactions_tbl,
#     model=ARK_MODEL_NAME,
#     temperature=1.0,
# )
# Execute the generated plan for the round-sunglasses question
# result = execute_generated_code(
#     full_content_round,          # the full LLM response you generated earlier
#     db=db,
#     inventory_tbl=inventory_tbl,
#     transactions_tbl=transactions_tbl,
#     user_request=prompt_round, # e.g., "Do you have any round sunglasses in stock that are under $100?"
# )

# # Peek at exactly what Python the plan executed
# utils.print_html(result["answer"], title="Plan Execution · Extracted Answer")

# ------------------------------------------------------测试2 ------------------------------------------------------

# Item = Query()                    # Create a Query object to reference fields (e.g., Item.name, Item.description)

# # Query: fetch all inventory rows whose 'name' is exactly "Aviator".
# # Notes:
# # - This is a case-sensitive equality check. "aviator" won't match.
# # - If you need case-insensitive matching, consider a .test(...) or .matches(...) with re.I.
# aviators = inventory_tbl.search(
#     (Item.name == "Aviator")
# )

# # Display the matched documents in a readable JSON panel
# utils.print_html(json.dumps(aviators, indent=2), title="Inventory status: Aviator sunglasses before return")


# prompt_aviator = "Return 2 Aviator sunglasses I bought last week."

# # Generate the plan-as-code (FULL content; may include <execute_python> tags)
# full_content_aviator = generate_llm_code(
#     prompt_aviator,
#     inventory_tbl=inventory_tbl,
#     transactions_tbl=transactions_tbl,
#     model=ARK_MODEL_NAME,
#     temperature=1,
# )

# Inspect the LLM’s plan + code (no execution here)
# utils.print_html(full_content_aviator, title="Plan with Code (Full Response)")

# utils.print_html(json.dumps(transactions_tbl.all(), indent=2), title="Transactions Table Before Return")

# Execute the generated plan for the round-sunglasses question
# result = execute_generated_code(
#     full_content_aviator,          # the full LLM response you generated earlier
#     db=db,
#     inventory_tbl=inventory_tbl,
#     transactions_tbl=transactions_tbl,
#     user_request=prompt_aviator, # e.g., "Return 2 aviator sunglasses I bought last week."
# )

# # # Peek at exactly what Python the plan executed
# utils.print_html(result["answer"], title="Plan Execution · Extracted Answer")

# utils.print_html(json.dumps(transactions_tbl.all(), indent=2), title="Transactions Table After Return")

# Item = Query()                  

# aviators = inventory_tbl.search(
#     (Item.name == "Aviator")
# )

# utils.print_html(json.dumps(aviators, indent=2), title="Inventory status: Aviator sunglasses after return")

# ------------------------------------------------------ 封装workflow后测试 ------------------------------------------------------
def customer_service_agent(
    question: str,
    *,
    db,
    inventory_tbl,
    transactions_tbl,
    model: str = "o4-mini",
    temperature: float = 1.0,
    reseed: bool = False,
) -> dict:
    """
    End-to-end helper:
      1) (Optional) reseed inventory & transactions
      2) Generate plan-as-code from `question`
      3) Execute in a controlled namespace
      4) Render before/after snapshots and return artifacts

    Returns:
      {
        "full_content": <raw LLM response (may include <execute_python> tags)>,
        "exec": {
            "code": <extracted python>,
            "stdout": <plan logs>,
            "error": <traceback or None>,
            "answer": <answer_text/rows/json>,
            "inventory_after": [...],
            "transactions_after": [...]
        }
      }
    """
    # 0) Optional reseed
    if reseed:
        inv_utils.create_inventory()
        inv_utils.create_transactions()

    # 1) Show the question
    utils.print_html(question, title="User Question")

    # 2) Generate plan-as-code (FULL content)
    full_content = generate_llm_code(
        question,
        inventory_tbl=inventory_tbl,
        transactions_tbl=transactions_tbl,
        model=model,
        temperature=temperature,
    )
    utils.print_html('code generated', title="Plan with Code (Full Response)")
    # utils.print_html(full_content, title="Plan with Code (Full Response)")

    # 3) Before snapshots
    # utils.print_html(json.dumps(inventory_tbl.all(), indent=2), title="Inventory Table · Before")
    # utils.print_html(json.dumps(transactions_tbl.all(), indent=2), title="Transactions Table · Before")

    # 4) Execute
    exec_res = execute_generated_code(
        full_content,
        db=db,
        inventory_tbl=inventory_tbl,
        transactions_tbl=transactions_tbl,
        user_request=question,
    )

    # 5) After snapshots + final answer
    utils.print_html(exec_res["answer"], title="Plan Execution · Extracted Answer")
    utils.print_html(json.dumps(inventory_tbl.all(), indent=2), title="Inventory Table · After")
    utils.print_html(json.dumps(transactions_tbl.all(), indent=2), title="Transactions Table · After")

    # 6) Return artifacts
    return {
        "full_content": full_content,
        "exec": {
            "code": exec_res["code"],
            "stdout": exec_res["stdout"],
            "error": exec_res["error"],
            "answer": exec_res["answer"],
            "inventory_after": inventory_tbl.all(),
            "transactions_after": transactions_tbl.all(),
        },
    }

# try these prompts:
# 1) Read-only (Andrew’s example): “Do you have any round sunglasses in stock that are under $100?” 
# 2) Mutation — return: “Return 2 Aviator sunglasses.” 
# 3) Mutation — purchase: “Purchase 3 Wayfarer sunglasses for customer Alice.” 
# 4) Mutation - purchase multiple items: "I want to buy 3 pairs of classic sunglasses and 1 pair of aviator."

prompt = "I want to buy 3 pairs of classic sunglasses and 1 pair of aviator sunglasses."

out = customer_service_agent(
    prompt,
    db=db,
    inventory_tbl=inventory_tbl,
    transactions_tbl=transactions_tbl,
    model=ARK_MODEL_NAME,
    temperature=1.0,
    reseed=True,   # set False to keep current state of the inventory and the transactions
)
