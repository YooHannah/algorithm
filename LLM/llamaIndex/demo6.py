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

chroma_client = chromadb.EphemeralClient(settings=Settings(allow_reset=True))
chroma_client.reset()
chroma_collection = chroma_client.get_or_create_collection("testllamaIndex")

vector_store = ChromaVectorStore(chroma_collection=chroma_collection)

documents = SimpleDirectoryReader(
    "/Users/bytedance/project/LLM/llamaIndex/data", 
    required_exts=[".pdf"],
    file_extractor={".pdf": PyMuPDFReader()}
).load_data()

new_pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=500, chunk_overlap=150),
        TitleExtractor(llm = llm),
        OpenAIEmbedding()
    ],
    vector_store=vector_store,
)

new_pipeline.load("/Users/bytedance/project/LLM/llamaIndex/pipeline_storage")

print('********************* 处理 计时**************')
class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        self.interval = self.end - self.start
        print(f"耗时 {self.interval*1000} ms")
with Timer():
    nodes = new_pipeline.run(documents=documents)

# 创建索引
index = VectorStoreIndex.from_vector_store(vector_store)

# test1 单轮问答（Query Engine
qa_engine = index.as_query_engine()
response = qa_engine.query("樱木花道的期末考试有几个科目")

print('***********单轮问答（Query Engine)******************')
print(response)

# test2 流式输出
qa_engine = index.as_query_engine(streaming=True)
response = qa_engine.query("樱木花道的期末考试有几个科目")
print('***********单轮流式输出******************')
response.print_response_stream()

# test 3 多轮对话（Chat Engine）
chat_engine = index.as_chat_engine()
response = chat_engine.chat("樱木花道的期末考试有几个科目")
print('***********多轮第一次流式输出******************')
print(response)

response = chat_engine.chat("樱木花道的期末考试通过了几个科目")
print('***********多轮第二次流式输出******************')
print(response)

# test 4 流式输出

chat_engine = index.as_chat_engine()
streaming_response = chat_engine.stream_chat("樱木花道的期末考试通过了几个科目")
print('***********多轮流式输出******************')
for token in streaming_response.response_gen:
    print(token, end="")