# !pip install langchain==0.1.20
# !pip install langchain-openai==0.1.6
# !pip install langchain-community==0.0.38
#!pip install qianfan
# import os
# os.environ["LANGCHAIN_PROJECT"] = ""
# os.environ["LANGCHAIN_API_KEY"] = ""
# os.environ["LANGCHAIN_ENDPOINT"] = ""
# os.environ["LANGCHAIN_TRACING_V2"] = ""

# OPENAI_API_KEY = "sk-xxxxx"

from common import show_json, client

from langchain_openai import ChatOpenAI
from langchain.schema import (
    AIMessage,  # 等价于OpenAI接口中的assistant role
    HumanMessage,  # 等价于OpenAI接口中的user role
    SystemMessage  # 等价于OpenAI接口中的system role
)
from langchain_community.chat_models import QianfanChatEndpoint
from langchain_core.messages import HumanMessage
import os
os.environ["ERNIE_CLIENT_ID"] = ""
os.environ["ERNIE_CLIENT_SECRET"] = ""

#  OpenAI 模型封装
llm = ChatOpenAI(model="gpt-3.5-turbo")  # gpt-4o 默认是gpt-3.5-turbo
# response = llm.invoke("你是谁")
# print("test1")
# print(response.content)

# # 多轮对话 Session 封装
messages = [
    SystemMessage(content="你是天才。"),
    AIMessage(content="欢迎！"),
    HumanMessage(content="请问天上有多少颗星星")
]

ret = llm.invoke(messages)
print("test2")
print(ret.content)

# 国产模型 其它模型分装在 langchain_community 底包中
# print('id')
# print(os.getenv('ERNIE_CLIENT_ID'))
# print(os.getenv('ERNIE_CLIENT_SECRET'))
# llm = QianfanChatEndpoint(
#     qianfan_ak=os.getenv('ERNIE_CLIENT_ID'),
#     qianfan_sk=os.getenv('ERNIE_CLIENT_SECRET')
# )

# messages = [
#     HumanMessage(content="介绍一下你自己")
# ]

# ret = llm.invoke(messages)

# print(ret.content)