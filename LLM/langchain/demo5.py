
# 对话上下文：ConversationBufferMemory
# from langchain.memory import ConversationBufferMemory, ConversationBufferWindowMemory

# history = ConversationBufferMemory()
# history.save_context({"input": "你好啊"}, {"output": "你也好啊"})

# print(history.load_memory_variables({}))

# history.save_context({"input": "你再好啊"}, {"output": "你又好啊"})

# print(history.load_memory_variables({}))

# 只保留一个窗口的上下文：ConversationBufferWindowMemory¶
# from langchain.memory import ConversationBufferWindowMemory

# window = ConversationBufferWindowMemory(k=2)
# window.save_context({"input": "第一轮问"}, {"output": "第一轮答"})
# window.save_context({"input": "第二轮问"}, {"output": "第二轮答"})
# window.save_context({"input": "第三轮问"}, {"output": "第三轮答"})
# print(window.load_memory_variables({}))

# # 通过 Token 数控制上下文长度：ConversationTokenBufferMemory

from langchain.memory import ConversationTokenBufferMemory
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

memory = ConversationTokenBufferMemory(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    max_token_limit=20
)
memory.save_context(
    {"input": "你好啊"}, {"output": "你好，我是你的AI助手。"})
memory.save_context(
    {"input": "你会干什么"}, {"output": "我什么都会"})

print(memory.load_memory_variables({}))
