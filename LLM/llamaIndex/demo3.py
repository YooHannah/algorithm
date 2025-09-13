from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.node_parser import TokenTextSplitter
from llama_index.readers.file import PyMuPDFReader
from common import show_list_obj
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# test1 <!-- 向量检索 -->
# 加载 pdf 文档
documents = SimpleDirectoryReader(
    "/Users/bytedance/project/LLM/llamaIndex/data", 
    required_exts=[".pdf"],
    file_extractor={".pdf": PyMuPDFReader()}
).load_data()
# 定义 Node Parser
node_parser = TokenTextSplitter(chunk_size=500, chunk_overlap=150)
# 切分文档
nodes = node_parser.get_nodes_from_documents(documents)
# print(f"{len(nodes)} nodes loaded")

# print("打印前3个node：")
# show_list_obj(nodes[:3])
# 构建 index
# LlamaIndex 默认的 Embedding 模型是 OpenAIEmbedding(model="text-embedding-ada-002")。#
index = VectorStoreIndex(nodes)

# 获取 retriever
vector_retriever = index.as_retriever(
    similarity_top_k=2 # 返回前两个结果
)

# 检索
results = vector_retriever.retrieve("樱木花道的别名是什么")

print("\n\n检索结果：")
show_list_obj(results)

