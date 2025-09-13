from common import show_json, client
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder,
    PromptTemplate
)
from langchain_core.messages import AIMessage, HumanMessage


# test 1PromptTemplate 可以在模板中自定义变量
# template = PromptTemplate.from_template("给我讲个关于{subject}的笑话")
# print("===Template===")
# print(template)
# print("===Prompt===")
# print(template.format(subject='小明'))


# 定义 LLM
# llm = ChatOpenAI(model="gpt-3.5-turbo")
# 通过 Prompt 调用 LLM
# ret = llm.invoke(template.format(subject='小明'))
# 打印输出
# print(ret.content)

# test 2 ChatPromptTemplate 用模板表示的对话上下文
# template = ChatPromptTemplate.from_messages(
#     [
#         SystemMessagePromptTemplate.from_template(
#             "你是{product}的客服助手。你的名字叫{name}"),
#         HumanMessagePromptTemplate.from_template("{query}"),
#     ]
# )

llm = ChatOpenAI(model="gpt-3.5-turbo")
# prompt = template.format_messages(
#     product="故宫",
#     name="故宫掌门人",
#     query="你是谁,你有什么作用"
# )

# print(prompt)

# ret = llm.invoke(prompt)

# print(ret.content)

# # test 3 MessagesPlaceholder 把多轮对话变成模板

# human_prompt = "Translate your answer to {language}."
# human_message_template = HumanMessagePromptTemplate.from_template(human_prompt)

# chat_prompt = ChatPromptTemplate.from_messages(
#     # variable_name 是 message placeholder 在模板中的变量名
#     # 用于在赋值时使用
#     [MessagesPlaceholder(variable_name="conversation"), human_message_template]
# )


# human_message = HumanMessage(content="Who is Elon Musk?")
# ai_message = AIMessage(
#     content="Elon Musk is a billionaire entrepreneur, inventor, and industrial designer"
# )

# messages = chat_prompt.format_prompt(
#     # 对 "conversation" 和 "language" 赋值
#     conversation=[human_message, ai_message], language="中文"
# )

# print(messages.to_messages())

# result = llm.invoke(messages)
# print(result.content)

# # test 4 从文件加载 Prompt 模板
template = PromptTemplate.from_file("/Users/bytedance/project/LLM/langchain/example_prompt_template.txt")
print("===Template===")
print(template)
print("===Prompt===")
print(template.format(topic='黑色幽默'))