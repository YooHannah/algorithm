# test2 <!-- 自定义检索 -->
# pip install llama-index-vector-stores-chroma
import os 
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import StorageContext
from common import show_list_obj
import chromadb
from chromadb.config import Settings
from llama_index.readers.file import PyMuPDFReader
from llama_index.core.node_parser import TokenTextSplitter

if os.environ.get('CUR_ENV_IS_STUDENT','false')=='true':
    __import__('pysqlite3')
    import sys
    sys.modules['sqlite3']= sys.modules.pop('pysqlite3')

documents = SimpleDirectoryReader(
    "/Users/bytedance/project/LLM/llamaIndex/data", 
    required_exts=[".pdf"],
    file_extractor={".pdf": PyMuPDFReader()}
).load_data()
# 定义 Node Parser
node_parser = TokenTextSplitter(chunk_size=500, chunk_overlap=150)
# 切分文档
nodes = node_parser.get_nodes_from_documents(documents)
print(f"{len(nodes)} nodes loaded")

print("打印前3个node：")
show_list_obj(nodes[:3])
# 构建 index

# 创建 Chroma Client
# EphemeralClient 在内存创建；如果需要存盘，可以使用 PersistentClient
chroma_client = chromadb.EphemeralClient(settings=Settings(allow_reset=True))

chroma_client.reset() # 为演示方便，实际不用每次 reset
chroma_collection = chroma_client.create_collection("testllamaIndex")

# 创建 Vector Store
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)

# Storage Context 是 Vector Store 的存储容器，用于存储文本、index、向量等数据
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# 创建 index：通过 Storage Context 关联到自定义的 Vector Store
index = VectorStoreIndex(nodes, storage_context=storage_context)

# 获取 retriever
vector_retriever = index.as_retriever(similarity_top_k=2)

# 检索
results = vector_retriever.retrieve("期末考试有几个科目")
print("****************检索结果***********")
show_list_obj(results)