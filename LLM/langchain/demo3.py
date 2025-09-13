from common import show_json, client
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from typing import List, Dict
from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import PydanticOutputParser
from langchain.output_parsers import OutputFixingParser

# 定义你的输出对象
class Date(BaseModel):
    year: int = Field(description="Year")
    month: int = Field(description="Month")
    day: int = Field(description="Day")
    era: str = Field(description="BC or AD")

# test 1 自动根据 Pydantic 类的定义，生成输出的格式说明
model_name = 'gpt-3.5-turbo'
temperature = 0
model = ChatOpenAI(model_name=model_name, temperature=temperature)

# 根据Pydantic对象的定义，构造一个OutputParser
parser = PydanticOutputParser(pydantic_object=Date)

template = """提取用户输入中的日期。
{format_instructions}
用户输入:
{query}"""

prompt = PromptTemplate(
    template=template,
    input_variables=["query"],
    # 直接从OutputParser中获取输出描述，并对模板的变量预先赋值
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

print("====Format Instruction=====")
print(parser.get_format_instructions())


query = "2023年四月6日天气晴..."
model_input = prompt.format_prompt(query=query)

print("====Prompt=====")
print(model_input.to_string())

output = model.invoke(model_input.to_messages())
print("====模型原始输出=====")
print(output.content)
print("====Parse后的输出=====")
date = parser.parse(output.content)
print(date.dict())

# test 2 Auto-Fixing Parser 利用 LLM 自动根据解析异常修复并重新解析

new_parser = OutputFixingParser.from_llm(
    parser=parser, llm=ChatOpenAI(model="gpt-3.5-turbo"))

# 我们把之前output的格式改错
output = output.content.replace("4", "四月")
print("===格式错误的Output===")
print(output)
try:
    date = parser.parse(output)
except Exception as e:
    print("===出现异常===")
    print(e)

# 用OutputFixingParser自动修复并解析
date = new_parser.parse(output)
print("===重新解析结果===")
print(date.json())
