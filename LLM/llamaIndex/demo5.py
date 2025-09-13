# <!-- Ingestion Pipeline 自定义数据处理流程 -->

import time
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext, SimpleDirectoryReader
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.extractors import TitleExtractor
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core import VectorStoreIndex
from llama_index.readers.file import PyMuPDFReader
import nest_asyncio
import chromadb
from chromadb.config import Settings
from common import show_list_obj

from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

llm = OpenAI(model="gpt-3.5-turbo")

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        self.interval = self.end - self.start
        print(f"耗时 {self.interval*1000} ms")
# 创建 Chroma Client
# EphemeralClient 在内存创建；如果需要存盘，可以使用 PersistentClient
chroma_client = chromadb.EphemeralClient(settings=Settings(allow_reset=True))
print("Collections before reset:", chroma_client.list_collections())
chroma_client.reset() # 为演示方便，实际不用每次 reset
print("Collections after reset:", chroma_client.list_collections())
chroma_collection = chroma_client.get_or_create_collection("testllamaIndex")

# 创建 Vector Store
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)

documents = SimpleDirectoryReader(
    "/Users/bytedance/project/LLM/llamaIndex/data", 
    required_exts=[".pdf"],
    file_extractor={".pdf": PyMuPDFReader()}
).load_data()

print(f"{len(documents)} documents loaded")

print(documents[0].text)

pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=500, chunk_overlap=150), # 按句子切分
        TitleExtractor(llm=llm), # 利用 LLM 对文本生成标题
        OpenAIEmbedding(), # 将文本向量化
    ],
    vector_store=vector_store,
)

print('*********************第一次计时**************')
# # 计时
with Timer():
    # Ingest directly into a vector db
    pipeline.run(documents=documents)

# 创建索引
index = VectorStoreIndex.from_vector_store(vector_store)

# # 获取 retriever
vector_retriever = index.as_retriever(similarity_top_k=1)

# # 检索
results = vector_retriever.retrieve("樱木花道的别名是什么")
print('*************检索结果****************')
show_list_obj(results[:1])

# # 本地保存 IngestionPipeline 的缓存
pipeline.persist("/Users/bytedance/project/LLM/llamaIndex/pipeline_storage")

new_pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=500, chunk_overlap=150),
        TitleExtractor(llm = llm),
        OpenAIEmbedding()
    ],
)

# 加载缓存
new_pipeline.load("/Users/bytedance/project/LLM/llamaIndex/pipeline_storage")


print('*********************第二次计时**************')
with Timer():
    nodes = new_pipeline.run(documents=documents)

# 检索后排序详见demo8.py