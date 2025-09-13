# <!-- Prompt 版本管理 -->
#  按名称加载
from langfuse import Langfuse
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

langfuse = Langfuse()

prompt = langfuse.get_prompt("demo", label="latest")

# 按名称和版本号加载
# prompt = langfuse.get_prompt("demo", version=2)

# 对模板中的变量赋值
compiled_prompt = prompt.compile(input="请问你是谁", outlines="需要告诉我你的名字和作用")

print(compiled_prompt)

# 获取 config

# prompt = langfuse.get_prompt("demo", version=5)
print('xxxx config')
print(prompt.config)