# 向量检索 练习

import numpy as np
from numpy import dot
from numpy.linalg import norm
import os

from common import client, get_completion, build_prompt, extract_text_from_pdf, prompt_template

import chromadb
from chromadb.config import Settings

if os.environ.get('CUR_ENV_IS_STUDENT',False):
    import sys
    __import__('pysqlite3')
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

def cos_sim(a, b):
    '''余弦距离 -- 越大越相似'''
    return dot(a, b)/(norm(a)*norm(b))


def l2(a, b):
    '''欧氏距离 -- 越小越相似'''
    x = np.asarray(a)-np.asarray(b)
    return norm(x)

# 将文本转向量 texts: string[]
def get_embeddings(texts, model="text-embedding-ada-002", dimensions=None):
    '''封装 OpenAI 的 Embedding 模型接口'''
    if model == "text-embedding-ada-002":
        dimensions = None
    if dimensions:
        data = client.embeddings.create(
            input=texts, model=model, dimensions=dimensions).data
    else:
        data = client.embeddings.create(input=texts, model=model).data
    return [x.embedding for x in data]

# test_query = ["测试文本"]
# vec = get_embeddings(test_query)[0]
# print(f"Total dimension: {len(vec)}")
# print(f"First 10 elements: {vec[:10]}")

# query = "国际争端"

# 且能支持跨语言
# query = "global conflicts"

# documents = [
#     "联合国就苏丹达尔富尔地区大规模暴力事件发出警告",
#     "土耳其、芬兰、瑞典与北约代表将继续就瑞典“入约”问题进行谈判",
#     "日本岐阜市陆上自卫队射击场内发生枪击事件 3人受伤",
#     "国家游泳中心（水立方）：恢复游泳、嬉水乐园等水上项目运营",
#     "我国首次在空间站开展舱外辐射生物学暴露实验",
# ]

# query_vec = get_embeddings([query])[0]
# doc_vecs = get_embeddings(documents)

# print("Query与自己的余弦距离: {:.2f}".format(cos_sim(query_vec, query_vec)))
# print("Query与Documents的余弦距离:")
# for vec in doc_vecs:
#     print(cos_sim(query_vec, vec))

# print()

# print("Query与自己的欧氏距离: {:.2f}".format(l2(query_vec, query_vec)))
# print("Query与Documents的欧氏距离:")
# for vec in doc_vecs:
#     print(l2(query_vec, vec))

# # 只取两页（第一章）
paragraphs = extract_text_from_pdf(
    "/Users/bytedance/project/LLM/RAG/llama2.pdf",
    page_numbers=[2, 3],
    min_line_length=10
)

class MyVectorDBConnector:
    def __init__(self, collection_name, embedding_fn):
        chroma_client = chromadb.Client(Settings(allow_reset=True))

        # 为了演示，实际不需要每次 reset()
        chroma_client.reset()

        # 创建一个 collection
        self.collection = chroma_client.get_or_create_collection(
            name=collection_name)
        self.embedding_fn = embedding_fn

    def add_documents(self, documents):
        '''向 collection 中添加文档与向量'''
        self.collection.add(
            embeddings=self.embedding_fn(documents),  # 每个文档的向量
            documents=documents,  # 文档的原文
            ids=[f"id{i}" for i in range(len(documents))]  # 每个文档的 id
        )
    def search(self, query, top_n):
        '''检索向量数据库'''
        results = self.collection.query(
            query_embeddings=self.embedding_fn([query]),
            n_results=top_n
        )
        return results
# 创建一个向量数据库对象
vector_db = MyVectorDBConnector("demo", get_embeddings)
# 向向量数据库中添加文档
vector_db.add_documents(paragraphs)

user_query = "Llama 2有多少参数"
results = vector_db.search(user_query, 2)

print("===向量数据库检索结果===")
for para in results['documents'][0]:
    print(para+"\n")

# 基于向量检索的 RAG
class RAG_Bot:
    def __init__(self, vector_db, llm_api, n_results=2):
        self.vector_db = vector_db
        self.llm_api = llm_api
        self.n_results = n_results

    def chat(self, user_query):
        # 1. 检索
        search_results = self.vector_db.search(user_query, self.n_results)

        # 2. 构建 Prompt
        prompt = build_prompt(
            prompt_template, context=search_results['documents'][0], query=user_query)

        # 3. 调用 LLM
        response = self.llm_api(prompt)
        return response
    
# 创建一个RAG机器人
bot = RAG_Bot(
    vector_db, # 向量数据库， 在创建的时候注入进去
    llm_api=get_completion
)

user_query = "llama 2有多少参数?"

response = bot.chat(user_query)
print("===RAG机器人回复===")
print(response)