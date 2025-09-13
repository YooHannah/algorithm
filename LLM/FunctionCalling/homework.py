# 作业 通过 Function Calling 查询数据库 推荐流量套餐
from common import print_json, client
import sqlite3
import json

#  描述数据库表结构
database_schema_string = """
CREATE TABLE packageList (
    id INT PRIMARY KEY NOT NULL, -- 主键，不允许为空
    name VARCHAR(255) NOT NULL, -- 套餐名称
    package DECIMAL(10,2) NOT NULL, -- 流量大小(G/月)，不允许为空
    price DECIMAL(10,2) NOT NULL, -- 价格(元/月)，不允许为空
    scale VARCHAR(255) NOT NULL -- 适用人群
);
"""

# 创建数据库连接
conn = sqlite3.connect(':memory:')
cursor = conn.cursor()

# 创建orders表
cursor.execute(database_schema_string)

# 插入5条明确的模拟记录
mock_data = [
    (1, "经济套餐", 10, 50, "无限制"),
    (2, "畅游套餐", 100, 180, "无限制"),
    (3, "无限套餐", 1000, 300, "无限制"),
    (4, "校园套餐", 200, 150, "在校生") 
]

for record in mock_data:
    cursor.execute('''
    INSERT INTO packageList (id, name, package, price, scale)
    VALUES (?, ?, ?, ?, ?)
    ''', record)

# 提交事务
conn.commit()

def get_sql_completion(messages, model="gpt-3.5-turbo"):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
        tools=[{  # 摘自 OpenAI 官方示例 https://github.com/openai/openai-cookbook/blob/main/examples/How_to_call_functions_with_chat_models.ipynb
            "type": "function",
            "function": {
                "name": "ask_database",
                "description": "Use this function to answer user questions about business. \
                            Output should be a fully formed SQL query.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": f"""
                            SQL query extracting info to answer the user's question.
                            SQL should be written using this database schema:
                            {database_schema_string}
                            The query should be returned in plain text, not in JSON.
                            The query should only contain grammars supported by SQLite.
                            """,
                        }
                    },
                    "required": ["query"],
                }
            }
        }],
    )
    return response.choices[0].message

def ask_database(query):
    cursor.execute(query)
    records = cursor.fetchall()
    return records


prompt = "请给我推荐一个性价比最好的套餐"
# prompt = "最贵的套餐是什么？"
# prompt = "学生适合用哪个套餐"

messages = [
    {"role": "system", "content": "你是一个流量推荐客服，基于数据库的数据回答问题"},
    {"role": "user", "content": prompt}
]
response = get_sql_completion(messages)
if response.content is None:
    response.content = ""
messages.append(response)
print("====Function Calling====")
print_json(response)

if response.tool_calls is not None:
    tool_call = response.tool_calls[0]
    if tool_call.function.name == "ask_database":
        arguments = tool_call.function.arguments
        args = json.loads(arguments)
        print("====SQL====")
        print(args["query"])
        result = ask_database(args["query"])
        print("====DB Records====")
        print(result)

        messages.append({
            "tool_call_id": tool_call.id,
            "role": "tool",
            "name": "ask_database",
            "content": str(result)
        })
        response = get_sql_completion(messages)
print("====最终回复====")
print(response.content)

print("====全过程====")
print(messages)
