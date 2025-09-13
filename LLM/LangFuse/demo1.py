# !pip install --upgrade langfuse

# 通过装饰器记录/上报
from langfuse.openai import openai # OpenAI integration
from langfuse.decorators import langfuse_context, observe

from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())
 
# @observe(name="HelloWorld")
# def run():
#     return openai.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[
#           {"role": "user", "content": "对我说Hello, World!"}
#         ],
#     ).choices[0].message.content

# print(run())

# test 2 通过 langfuse_context 记录 User ID、Metadata 等¶
# from langfuse.decorators import observe, langfuse_context
# from langfuse.openai import openai # OpenAI integration
 
# @observe(name="test")
# def run():
#     langfuse_context.update_current_trace(
#         name="HelloWorld",
#         user_id="lyh",
#         metadata={"test":"test value"}
#     )
#     return openai.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[
#           {"role": "user", "content": "对我说Hello, World!"}
#         ],
#     ).choices[0].message.content
 
# print(run())

# # test 3 通过 LangChain 的回调集成

# 重置环境，否则与LangSmith有冲突
# del openai 
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough

model = ChatOpenAI(model="gpt-3.5-turbo")

prompt = ChatPromptTemplate.from_messages([
    HumanMessagePromptTemplate.from_template("Say hello to {input}!")
])


# 定义输出解析器
parser = StrOutputParser()

# chain = (
#     {"input": RunnablePassthrough()}
#     | prompt
#     | model
#     | parser
# )

# @observe()
# def run():
#     langfuse_context.update_current_trace(
#             name="HelloWorld",
#             user_id="lyh",
#         )
    
#     # 获取当前 LangChain 回调处理器
#     langfuse_handler = langfuse_context.get_current_langchain_handler()
    
#     return chain.invoke(input="请介绍一下你自己", config={"callbacks": [langfuse_handler]})

# print(run())


# # test 4 换其他模型上报，其它模型分装在 langchain_community 底包中
from langchain_community.chat_models import QianfanChatEndpoint
from langchain_core.messages import HumanMessage
import os

ernie_model = QianfanChatEndpoint(
    qianfan_ak=os.getenv('ERNIE_CLIENT_ID'),
    qianfan_sk=os.getenv('ERNIE_CLIENT_SECRET')
)

chain = (
    {"input": RunnablePassthrough()}
    | prompt
    | ernie_model
    | parser
)

@observe()
def run():
    langfuse_context.update_current_trace(
            name="ErnieDemo",
            user_id="lyh",
        )
    
    # 获取当前 LangChain 回调处理器
    langfuse_handler = langfuse_context.get_current_langchain_handler()
    
    return chain.invoke(input="lyh", config={"callbacks": [langfuse_handler]})

print(run())