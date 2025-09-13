#<!-- 数据集管理与测试 -->
import json
from langfuse import Langfuse
from langfuse.model import CreateDatasetRequest, CreateDatasetItemRequest
from tqdm import tqdm
import langfuse

# Prompt 模板与 Chain（LCEL）
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

# 在数据集上测试效果
from concurrent.futures import ThreadPoolExecutor
import threading
from langfuse import Langfuse
from datetime import datetime

from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

from datasets import load_dataset
# dataset = load_dataset("liwu/MNBVC", 'math_qa', split='train', streaming=True)

# next(iter(dataset))  # get the first line

# itemes = iter(dataset)
# <!-- 上传已有数据集 -->
# 调整数据格式 {"input":{...},"expected_output":"label"}
data = []
# with open('my_annotations.jsonl', 'r', encoding='utf-8') as fp:
#     for line in fp:
#         example = json.loads(line.strip())
#         item = {
#             "input": {
#                 "outlines": example["outlines"],
#                 "user_input": example["user_input"]
#             },
#             "expected_output": example["label"]
#         }
#         data.append(item)
# for i in range(30):
#     item = next(itemes)
#     answer = item["答"].split()[1]
#     print(f'position {i} \n 问题: {item["问"]} \n 答案: {item["答"]} \n 标签: {answer}')
#     item = {
#         "input": {
#             "user_input": item["问"]
#         },
#         "expected_output": answer
#     }
#     data.append(item)

dataset_name = "my-dataset"

# 初始化客户端
langfuse=Langfuse()

# dataset_info = langfuse.get_dataset(dataset_name)
# print('enable_scoring\n')
# print(vars(dataset_info))


# # 创建数据集，如果已存在不会重复创建
# try:
#     langfuse.create_dataset(
#         name=dataset_name,
#         # optional description
#         description="My first dataset",
#         # optional metadata
#         metadata={
#             "author": "lyh",
#             "type": "test"
#         }
#     )
# except:
#     pass

# # 考虑演示运行速度，只上传前5条数据
# for item in tqdm(data[:5]):
#     langfuse.create_dataset_item(
#         dataset_name=dataset_name,
#         input=item["input"],
#         expected_output=item["expected_output"]
#     )

# <!-- 定义评估函数 -->
def simple_evaluation(output, expected_output):
    return output == expected_output

# <!-- 运行测试 -->

# Prompt 模板与 Chain（LCEL）

need_answer = PromptTemplate.from_template("""
*********
你是一个数学天才，特别会解决用户问题，并给出计算结果 。
                                           
*********
用户问题:
{user_input}
*********
根据用户的问题给出一个数字即可，不要回复其他内容。""")

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, seed=42)
parser = StrOutputParser()

chain_v1 = (
    need_answer
    | model
    | parser
)

# 在数据集上测试效果
langfuse = Langfuse()
lock = threading.Lock()

def run_evaluation(chain, dataset_name, run_name):
    dataset = langfuse.get_dataset(dataset_name)

    def process_item(item):
        with lock:
            handler = item.get_langchain_handler(run_name=run_name)

        # Assuming chain.invoke is a synchronous function
        output = chain.invoke(item.input, config={"callbacks": [handler]})

        # Assuming handler.root_span.score is a synchronous function
        print(f"{output} == {item.expected_output} \n {simple_evaluation(output, item.expected_output)}")
        handler.trace.score(
            name="accuracy",
            value=simple_evaluation(output, item.expected_output)
        )
        print('.', end='', flush=True)

    # for item in dataset.items:
    #    process_item(item)

    with ThreadPoolExecutor(max_workers=4) as executor:
        print("Processing items...")
        executor.map(process_item, dataset.items[3:])


run_evaluation(chain_v1, "my-dataset", "v1-"+datetime.now().strftime("%d/%m/%Y %H:%M:%S"))

# 保证全部数据同步到云端
langfuse.flush()