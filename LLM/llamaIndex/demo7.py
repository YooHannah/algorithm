from llama_index.core import PromptTemplate
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core import ChatPromptTemplate
from llama_index.core import Settings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import Settings

# test1 PromptTemplate 定义提示词模板
prompt = PromptTemplate("写一个关于{topic}的笑话")
print("*****提示词模板返回结果：")
print(prompt.format(topic="Python"))


# test2 ChatPromptTemplate 定义多轮消息模板

chat_text_qa_msgs = [
    ChatMessage(
        role=MessageRole.SYSTEM,
        content="你叫{name}，你必须根据用户提供的上下文回答问题。",
    ),
    ChatMessage(
        role=MessageRole.USER, 
        content=(
            "已知上下文：\n" \
            "{context}\n\n" \
            "问题：{question}"
        )
    ),
]
text_qa_template = ChatPromptTemplate(chat_text_qa_msgs)

print("*****提示词模板多轮返回结果：")

print(
    text_qa_template.format(
        name="天才",
        context="这是一个测试",
        question="你是谁"
    )
)

# test 3 语言模型

llm = OpenAI(temperature=0, model="gpt-3.5-turbo")


# test 4 设置全局语言模型
Settings.llm = OpenAI(temperature=0, model="gpt-3.5-turbo")

# test 5 设置全局embedding模型

# 全局设定
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small", dimensions=512)