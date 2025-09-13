# pip install llama-index

#<!-- 与 LlamaIndex 集成 -->
from llama_index.core import Settings
from llama_index.core.callbacks import CallbackManager
from langfuse.llama_index import LlamaIndexCallbackHandler

# 定义 LangFuse 的 CallbackHandler
langfuse_callback_handler = LlamaIndexCallbackHandler()

# 修改 LlamaIndex 的全局设定
Settings.callback_manager = CallbackManager([langfuse_callback_handler])

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.readers.file import PyMuPDFReader
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# 指定全局llm与embedding模型
Settings.llm = OpenAI(temperature=0, model="gpt-3.5-turbo")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small", dimensions=512)
Settings.transforms = [SentenceSplitter(chunk_size=500, chunk_overlap=150)]

# 加载 pdf 文档
documents = SimpleDirectoryReader("/Users/bytedance/project/LLM/LangFuse/data", file_extractor={".pdf": PyMuPDFReader()}).load_data()

# 指定 Vector Store 用于 index
index = VectorStoreIndex.from_documents(documents)

# 构建单轮 query engine
query_engine = index.as_query_engine()

response = query_engine.query("期末有几门考试？")

print(f"Response1: {response}")

langfuse_callback_handler.set_trace_params(
    user_id="lyh",
    session_id="llamaindex-session",
    tags=["demo"]
  )

response = query_engine.query("期末有几门考试?")

print(f"Response2: {response}")