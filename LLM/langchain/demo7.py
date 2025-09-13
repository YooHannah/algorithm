# <!-- 用 LCEL 实现 RAG -->
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough
from langchain.prompts import ChatPromptTemplate
import json

from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# 加载文档
loader = PyMuPDFLoader("/Users/bytedance/project/LLM/langchain/樱木花道人物介绍3.pdf")
pages = loader.load_and_split()

# 文档切分
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

# 灌库
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
db = FAISS.from_documents(texts, embeddings)

# 检索 top-2 结果
retriever = db.as_retriever(search_kwargs={"k": 2})


# Prompt模板
template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

# 模型
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

# Chain
rag_chain = (
    {"question": RunnablePassthrough(), "context": retriever}
    | prompt
    | model
    | StrOutputParser()
)

ret = rag_chain.invoke("期末考试有几门课")

print("直接运行")
print(ret)

# print("流式输出：")
# for s in rag_chain.stream("期末考试有几门课"):
#     print(s, end="")


