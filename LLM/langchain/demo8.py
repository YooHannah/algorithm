# 通过 LCEL 实现 Function Calling

from langchain_core.tools import tool
import json
from langchain_core.output_parsers import StrOutputParser
from langchain.output_parsers import JsonOutputToolsParser
from langchain_openai import ChatOpenAI


from typing import Union
from operator import itemgetter
from langchain_core.runnables import (
    Runnable,
    RunnableLambda,
    RunnableMap,
    RunnablePassthrough,
)

from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

@tool
def multiply(first_int: int, second_int: int) -> int:
    """两个整数相乘"""
    return first_int * second_int


@tool
def add(first_int: int, second_int: int) -> int:
    """Add two integers."""
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    """Exponentiate the base to the exponent power."""
    return base**exponent

tools = [multiply, add, exponentiate]
# 模型
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

def log_function_call(data):
    print("Function path :", data)
    return data

def log_text_call(data):
    print("Text path:", data)
    return data

# 带有分支的 LCEL
llm_with_tools = model.bind_tools(tools) | {
    "functions": log_function_call | JsonOutputToolsParser() ,
    "text": log_text_call | StrOutputParser()
}

result = llm_with_tools.invoke("1024的16倍是多少")

print(f'result1: {result}')

result = llm_with_tools.invoke("你是谁")

print(f'result2: {result}')


# <!-- 直接选择工具并运行 -->

# 名称到函数的映射
# tool_map = {tool.name: tool for tool in tools}

# def call_tool(tool_invocation: dict) -> Union[str, Runnable]:
#     """根据模型选择的 tool 动态创建 LCEL"""
#     print(f'tool_invocation: {tool_invocation}')
#     tool = tool_map[tool_invocation["type"]]
#     return RunnablePassthrough.assign(
#         output=itemgetter("args") | tool
#     )


# # .map() 使 function 逐一作用与一组输入
# call_tool_list = RunnableLambda(call_tool).map()
# # https://python.langchain.com/v0.1/docs/expression_language/how_to/routing/#using-a-custom-function-recommended
# def route(response):
#     print(f'route response: {response}')
#     if len(response["functions"]) > 0:
#         return response["functions"]
#     else:
#         return response["text"]


# llm_with_tools = model.bind_tools(tools) | {
#     "functions": JsonOutputToolsParser() | call_tool_list | log_function_call,
#     "text": StrOutputParser() | log_text_call
# } | RunnableLambda(route)

# result = llm_with_tools.invoke("1024的平方是多少")
# print(f'result1: {result}')

# result = llm_with_tools.invoke("你好")
# print(f'result2: {result}')