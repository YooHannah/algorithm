import chromadb
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.ingestion import IngestionPipeline
from llama_index.readers.file import PyMuPDFReader
from llama_index.core import Settings
from llama_index.core import StorageContext
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.core.retrievers import QueryFusionRetriever
# from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.chat_engine import CondenseQuestionChatEngine
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
import nest_asyncio
nest_asyncio.apply() # 只在Jupyter笔记环境中需要此操作，否则会报错
 
# 创建 ChromaDB 向量数据库，并持久化到本地
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# 指定全局llm与embedding模型
Settings.llm = OpenAI(temperature=0, model="gpt-4o")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small", dimensions=512)
# 指定全局llm与embedding模型
Settings.llm = OpenAI(temperature=0, model="gpt-4o")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small", dimensions=512)

splitter = SentenceSplitter(chunk_size=300, chunk_overlap=100)

# 加载 pdf 文档
documents = SimpleDirectoryReader("./data", file_extractor={".pdf": PyMuPDFReader()}).load_data()

# 切分nodes
nodes = splitter.get_nodes_from_documents(documents)

# 新建 collection
collection_name = hex(int(time.time()))
chroma_collection = chroma_client.get_or_create_collection(collection_name)

# 创建 Vector Store
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
# 指定 Vector Store 用于 index
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex(
    nodes, storage_context=storage_context
)

# bm25_retriever = BM25Retriever.from_defaults(nodes=nodes)

# 检索后排序模型
reranker = SentenceTransformerRerank(
    model="BAAI/bge-reranker-large", top_n=2
)

# RAG Fusion
fusion_retriever = QueryFusionRetriever(
    [
        index.as_retriever(),
        # bm25_retriever
    ],
    similarity_top_k=5,
    num_queries=3,  # 生成 query 数
    use_async=True,
    # query_gen_prompt="...",  # 可以自定义 query 生成的 prompt 模板
)

# 构建单轮 query engine
query_engine = RetrieverQueryEngine.from_args(
    fusion_retriever,
    node_postprocessors=[reranker]
)

# 对话引擎
chat_engine = CondenseQuestionChatEngine.from_defaults(
    query_engine=query_engine, 
    # condense_question_prompt=... # 可以自定义 chat message prompt 模板
)

while True:
    question=input("User:")
    if question.strip() == "":
        break
    response = chat_engine.chat(question)
    print(f"AI: {response}")