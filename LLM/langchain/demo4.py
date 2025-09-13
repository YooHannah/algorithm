#!pip install --upgrade langchain-text-splitters
from common import show_json, client

# 文档加载器：Document Loaders
from langchain_community.document_loaders import PyMuPDFLoader

# 文档处理器 TextSplitter
from langchain_text_splitters import RecursiveCharacterTextSplitter

# loader = PyMuPDFLoader("/Users/bytedance/project/LLM/langchain/樱木花道人物介绍3.pdf")
# pages = loader.load_and_split()

# print(pages[0].page_content)

# text_splitter = RecursiveCharacterTextSplitter(
#     chunk_size=500,
#     chunk_overlap=150, 
#     length_function=len,
#     add_start_index=True,
# )

# paragraphs = text_splitter.create_documents([pages[0].page_content])
# print(f'paragraphs len: {len(paragraphs)}')
# for para in paragraphs:
#     print(para.page_content)
#     print('-------')

# 向量数据库与向量检索

from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import PyMuPDFLoader

# # 加载文档
loader = PyMuPDFLoader("/Users/bytedance/project/LLM/langchain/樱木花道人物介绍3.pdf")
pages = loader.load_and_split()

# # 文档切分
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=150,
    length_function=len,
    add_start_index=True,
)

texts = text_splitter.create_documents(
    [page.page_content for page in pages[:4]]
)
print(f'paragraphs len: {len(texts)}')
# #灌库
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
db = FAISS.from_documents(texts, embeddings)

# # 检索 top-3 结果
retriever = db.as_retriever(search_kwargs={"k": 3})

docs = retriever.invoke("期末考试有几门")

for doc in docs:
    print(doc.page_content)
    print("----")