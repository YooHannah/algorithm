import json
from openai import OpenAI
from common import extract_text_from_pdf, get_completion, build_prompt, prompt_template, split_text
import os, time
from elasticsearch7 import Elasticsearch, helpers
import chromadb
from chromadb.config import Settings
from keySearch import es_connector
from embeddingSearch import vecdb_connector
from rrf import rrf

# paragraphs = extract_text_from_pdf(
#     "/Users/bytedance/project/LLM/RAG/homework/樱木花道人物介绍.pdf",
#     page_numbers=[0,1],
#     min_line_length=10
# )

# chunks = split_text(paragraphs, chunk_size=200, overlap_size=50) # 优化1 文档交叠切割
# # 文档灌库
# es_connector.add_documents(chunks)
# vecdb_connector.add_documents(chunks)

query ="樱木军团都有谁"
# 关键字检索
# keyword_search_results = es_connector.search(query, 3)
# print('关键字检索结果')
# print(json.dumps(keyword_search_results, indent=4, ensure_ascii=False))
# # 向量检索
# vector_search_results = {
#     "doc_"+str(paragraphs.index(doc)): {
#         "text": doc,
#         "rank": i
#     }
#     for i, doc in enumerate(
#         vecdb_connector.search(query, 3)["documents"][0]
#     )
# }  # 把结果转成跟上面关键字检索结果一样的格式

# print('向量检索结果')
# print(json.dumps(vector_search_results, indent=4, ensure_ascii=False))

# # 融合两次检索的排序结果
# reranked = rrf([keyword_search_results])
# print('融合排序结果')
# print(json.dumps(reranked, indent=4, ensure_ascii=False))

class RAG_Bot:
    def __init__(self, vector_db, es_db, llm_api, n_results=3):
        self.vector_db = vector_db
        self.es_db = es_db
        self.llm_api = llm_api
        self.n_results = n_results

    def chat(self, user_query):
        # 1. 检索
        keyword_search_results = self.es_db.search(query, 3)
        print('关键字检索结果')
        print(json.dumps(keyword_search_results, indent=4, ensure_ascii=False))
        vector_search_results = {
           "doc_"+str(i): {
              "text": doc,
              "rank": i
          }
          for i, doc in enumerate(
              self.vector_db.search(query, 3)["documents"][0]
          )
        } 
        print('向量检索结果')
        print(json.dumps(vector_search_results, indent=4, ensure_ascii=False))

        reranked = rrf([keyword_search_results, vector_search_results]) # 优化2 混合检索排序
        print('融合排序结果')
        print(json.dumps(reranked, indent=4, ensure_ascii=False))
        print
        # 2. 构建 Prompt
        prompt = build_prompt(
            prompt_template, context=reranked[0][1]['text'], query=user_query)

        # 3. 调用 LLM
        response = self.llm_api(prompt)
        return response
    
# 创建一个RAG机器人
bot = RAG_Bot(
    vecdb_connector, # 向量数据库， 在创建的时候注入进去
    es_connector, # es 关键字搜索数据库
    llm_api=get_completion
)

response = bot.chat(query)
print("===RAG机器人回复===")
print(response)