# <!--数据集管理与测试-->
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough

export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=YOUR_PROJECT_NAME #自定义项目名称（可选）
export LANGCHAIN_API_KEY=LANGCHAIN_API_KEY # LangChain API Key

import os
from datetime import datetime
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "hello-world-"+datetime.now().strftime("%d/%m/%Y %H:%M:%S")

model = ChatOpenAI(model="gpt-3.5-turbo")

prompt = ChatPromptTemplate.from_messages([
    HumanMessagePromptTemplate.from_template("Say hello to {input}!")
])


# 定义输出解析器
parser = StrOutputParser()

chain = (
    {"input": RunnablePassthrough()}
    | prompt
    | model
    | parser
)

chain.invoke("王卓然")

# <!-- 上传数据集 -->
import json

data = []
with open('my_annotations.jsonl', 'r', encoding='utf-8') as fp:
    for line in fp:
        example = json.loads(line.strip())
        item = {
            "input": {
                "outlines": example["outlines"],
                "user_input": example["user_input"]
            },
            "expected_output": example["label"]
        }
        data.append(item)

from langsmith import Client

client = Client()

dataset_name = "assistant-"+datetime.now().strftime("%d/%m/%Y %H:%M:%S")

dataset = client.create_dataset(
    dataset_name,  # 数据集名称
    description="AGIClass线上跟课助手的标注数据",  # 数据集描述
)

inputs, outputs = zip(
    *[({"input": item["input"]}, {"label": item["expected_output"]}) for item in data[:50]]
)
client.create_examples(inputs=inputs, outputs=outputs, dataset_id=dataset.id)

# <!-- 评估函数 -->
from langsmith.schemas import Example, Run

def correct_label(root_run: Run, example: Example) -> dict:
    score = root_run.outputs.get("output") == example.outputs.get("label")
    return {"score": int(score), "key": "accuracy"}

# <!-- 运行测试 -->
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser 

need_answer = PromptTemplate.from_template("""
*********
你是AIGC课程的助教，你的工作是从学员的课堂交流中选择出需要老师回答的问题，加以整理以交给老师回答。
 
课程内容:
{outlines}
*********
学员输入:
{user_input}
*********
如果这是一个需要老师答疑的问题，回复Y，否则回复N。
只回复Y或N，不要回复其他内容。""")

model = ChatOpenAI(temperature=0, model_kwargs={"seed": 42})
parser = StrOutputParser()

chain_v1 = need_answer | model | parser

from langsmith.evaluation import evaluate

results = evaluate(
    lambda inputs: chain_v1.invoke(inputs["input"]),
    data=dataset_name,
    evaluators=[correct_label],
    experiment_prefix="Acc",
    description="测试ChainV1",
)