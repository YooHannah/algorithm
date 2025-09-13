# <!-- 用 LCEL 实现工厂模式 -->

from langchain_core.runnables.utils import ConfigurableField
from langchain_openai import ChatOpenAI

from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.runnables import (
    Runnable,
    RunnableLambda,
    RunnableMap,
    RunnablePassthrough,
)
from langchain.schema import HumanMessage
import os
from langchain_core.output_parsers import StrOutputParser

from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

from langchain_community.chat_models import QianfanChatEndpoint

# 模型1
ernie_model = QianfanChatEndpoint(
    qianfan_ak=os.getenv('ERNIE_CLIENT_ID'),
    qianfan_sk=os.getenv('ERNIE_CLIENT_SECRET')
)

# 模型2
gpt_model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


# 通过 configurable_alternatives 按指定字段选择模型
model = gpt_model.configurable_alternatives(
    ConfigurableField(id="llm"), 
    default_key="gpt", 
    ernie=ernie_model,
    # claude=claude_model,
)

# Prompt 模板
prompt = ChatPromptTemplate.from_messages(
    [
        HumanMessagePromptTemplate.from_template("{query}"),
    ]
)

# LCEL
chain = (
    {"query": RunnablePassthrough()} 
    | prompt
    | model
    | StrOutputParser()
)

# 运行时指定模型 "gpt" or "ernie"
ret = chain.with_config(configurable={"llm": ""}).invoke("介绍你自己，包括你的生产商")

print(ret)