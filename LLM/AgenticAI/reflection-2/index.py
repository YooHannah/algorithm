# Refine an SQL Query with External Feedback
# 这个脚本用于根据用户输入的问题，产出正确的sql 查询结果
# model1 生成v1 SQL，并给出SQL执行结果
# model2 根据v1 SQL 查询语句，执行结果，问题，并给分析结果和refine 之后的 v2 SQL
# 最后用v2sql 查询给出 查询结果

# 这里v1 查询结果 作为 External Feedback 帮助 model2 进行更好的优化


import json
import os

import utils
import pandas as pd
from dotenv import load_dotenv
import aisuite as ai

_ = load_dotenv()

ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_API_BASE = os.getenv("ARK_API_BASE")
ARK_MODEL_NAME = os.getenv("ARK_MODEL_NAME")

client = ai.Client({
    "openai": {
            "api_key": ARK_API_KEY,
            "base_url": ARK_API_BASE,
        }
})

# utils.create_transactions_db()

def generate_sql(question: str, schema: str, model: str) -> str:
    prompt = f"""
    You are a SQL assistant. Given the schema and the user's question, write a SQL query for SQLite.

    Schema:
    {schema}

    User question:
    {question}

    Respond with the SQL only.
    """
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    return response.choices[0].message.content.strip()


# def refine_sql(
#     question: str,
#     sql_query: str,
#     schema: str,
#     model: str,
# ) -> tuple[str, str]:
#     """
#     Reflect on whether a query's *shown output* answers the question,
#     and propose an improved SQL if needed.
#     Returns (feedback, refined_sql).
#     """
#     prompt = f"""
# You are a SQL reviewer and refiner.

# User asked:
# {question}

# Original SQL:
# {sql_query}

# Table Schema:
# {schema}

# Step 1: Briefly evaluate if the SQL OUTPUT fully answers the user's question.
# Step 2: If improvement is needed, provide a refined SQL query for SQLite.
# If the original SQL is already correct, return it unchanged.

# Return STRICT JSON with two fields:
# {{
#   "feedback": "<1-3 sentences explaining the gap or confirming correctness>",
#   "refined_sql": "<final SQL to run>"
# }}
# """
#     response = client.chat.completions.create(
#         model=model,
#         messages=[{"role": "user", "content": prompt}],
#         temperature=0,
#     )

#     content = response.choices[0].message.content
#     try:
#         obj = json.loads(content)
#         feedback = str(obj.get("feedback", "")).strip()
#         refined_sql = str(obj.get("refined_sql", sql_query)).strip()
#         if not refined_sql:
#             refined_sql = sql_query
#     except Exception:
#         # Fallback if model doesn't return valid JSON
#         feedback = content.strip()
#         refined_sql = sql_query

#     return feedback, refined_sql

# Unlike the previous step, where the model only reviewed the SQL text, you will now provide the actual query execution results as external feedback.
# This feedback comes from running the SQL query against the database—just like in Andrew’s video example—
# so the LLM can use the real output to evaluate whether the query truly answers the question.
def refine_sql_external_feedback(
    question: str,
    sql_query: str,
    df_feedback: pd.DataFrame,
    schema: str,
    model: str,
) -> tuple[str, str]:
    """
    Evaluate whether the SQL result answers the user's question and,
    if necessary, propose a refined version of the query.
    Returns (feedback, refined_sql).
    """
    prompt = f"""
    You are a SQL reviewer and refiner.

    User asked:
    {question}

    Original SQL:
    {sql_query}

    SQL Output:
    {df_feedback.to_markdown(index=False)}

    Table Schema:
    {schema}

    Step 1: Briefly evaluate if the SQL output answers the user's question.
    Step 2: If the SQL could be improved, provide a refined SQL query.
    If the original SQL is already correct, return it unchanged.

    Return a strict JSON object with two fields:
    - "feedback": brief evaluation and suggestions
    - "refined_sql": the final SQL to run
    """

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=1.0,
    )

    
    content = response.choices[0].message.content
    try:
        obj = json.loads(content)
        print("content.-----------", obj, sql_query)
        feedback = str(obj.get("feedback", "")).strip()
        refined_sql = str(obj.get("refined_sql", sql_query)).strip()
        print("refined_sql.-----------", refined_sql)
        if not refined_sql:
            print("No refined SQL provided.-----------")
            refined_sql = sql_query
    except Exception:
        # Fallback if the model does not return valid JSON:
        # use the raw content as feedback and keep the original SQL
        print("content.----------- fire", content)
        feedback = content.strip()
        refined_sql = sql_query
    return feedback, refined_sql

def run_sql_workflow(
    db_path: str,
    question: str,
    model_generation: str = "openai:gpt-4.1",
    model_evaluation: str = "openai:gpt-4.1",
):
    """
    End-to-end workflow to generate, execute, evaluate, and refine SQL queries.

    Steps:
      1) Extract database schema
      2) Generate SQL (V1)
      3) Execute V1 → show output
      4) Reflect on V1 with execution feedback → propose refined SQL (V2)
      5) Execute V2 → show final answer
    """

    # 1) Schema
    schema = utils.get_schema(db_path)
    utils.print_html(
        schema,
        title="📘 Step 1 — Extract Database Schema"
    )

    # 2) Generate SQL (V1)
    sql_v1 = generate_sql(question, schema, model_generation)
    utils.print_html(
        sql_v1,
        title="🧠 Step 2 — Generate SQL (V1)"
    )

    # 3) Execute V1
    df_v1 = utils.execute_sql(sql_v1, db_path)
    utils.print_html(
        df_v1,
        title="🧪 Step 3 — Execute V1 (SQL Output)"
    )

    # 4) Reflect on V1 with execution feedback → refine to V2
    feedback, sql_v2 = refine_sql_external_feedback(
        question=question,
        sql_query=sql_v1,
        df_feedback=df_v1,          # external feedback: real output of V1
        schema=schema,
        model=model_evaluation,
    )

    utils.print_html(
        feedback,
        title="🧭 Step 4 — Reflect on V1 (Feedback)"
    )
    utils.print_html(
        sql_v2,
        title="🔁 Step 4 — Refined SQL (V2)"
    )

    # 5) Execute V2
    df_v2 = utils.execute_sql(sql_v2, db_path)
    utils.print_html(
        df_v2,
        title="✅ Step 5 — Execute V2 (Final Answer)"
    )


run_sql_workflow(
    "products.db", 
    "Which color of product has the highest total sales? tell me the highest total sales and the color",
    # model_generation="openai:gpt-4.1",
    # model_evaluation="openai:gpt-4.1"
    model_generation= "openai:" + ARK_MODEL_NAME,
    model_evaluation= "openai:" + ARK_MODEL_NAME
)