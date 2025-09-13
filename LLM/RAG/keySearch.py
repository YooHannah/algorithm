# 关键字搜素 练习

# pip install pdfminer.six
# pip install nltk
# pip install elasticsearch7

from elasticsearch7 import Elasticsearch, helpers
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import re
import warnings

import os, time

from common import get_completion, extract_text_from_pdf, build_prompt, prompt_template


# 注意这里的文件路径是相对路径，需要根据实际情况进行调整
paragraphs = extract_text_from_pdf("/Users/bytedance/project/LLM/RAG/llama2.pdf", min_line_length=10)

print('打印段落啦')
for para in paragraphs[:4]:
    print(para+"\n")

# <!-- 安装 NLTK（文本处理方法库） -->
warnings.simplefilter("ignore")  # 屏蔽 ES 的一些Warnings

# 实验室平台已经内置
# nltk.download('punkt')  # 英文切词、词根、切句等方法
# nltk.download('stopwords')  # 英文停用词库
# print("nltk 安装成功")

def to_keywords(input_string):
    '''（英文）文本只保留关键字'''
    # 使用正则表达式替换所有非字母数字的字符为空格
    no_symbols = re.sub(r'[^a-zA-Z0-9\s]', ' ', input_string)
    word_tokens = word_tokenize(no_symbols)
    # 加载停用词表
    stop_words = set(stopwords.words('english'))
    ps = PorterStemmer()
    # 去停用词，取词根
    filtered_sentence = [ps.stem(w)
                         for w in word_tokens if not w.lower() in stop_words]
    return ' '.join(filtered_sentence)


# <!-- 将文本灌入检索引擎 -->

# 引入配置文件
#<!-- 临时设置环境变量 -->
os.environ['ELASTICSEARCH_BASE_URL'] = 'http://39.106.15.22:9200/'
os.environ['ELASTICSEARCH_PASSWORD'] = 'FKaB1Jpz0Rlw0l6G'
os.environ['ELASTICSEARCH_NAME'] = 'elastic'

ELASTICSEARCH_BASE_URL = os.getenv('ELASTICSEARCH_BASE_URL')
ELASTICSEARCH_PASSWORD = os.getenv('ELASTICSEARCH_PASSWORD')
ELASTICSEARCH_NAME= os.getenv('ELASTICSEARCH_NAME')

# 1. 创建Elasticsearch连接
print('Elasticsearch 开始连接')
es = Elasticsearch(
    hosts=[ELASTICSEARCH_BASE_URL],  # 服务地址与端口
    http_auth=(ELASTICSEARCH_NAME, ELASTICSEARCH_PASSWORD),  # 用户名，密码
)

print('Elasticsearch 连接成功')
# 2. 定义索引名称
index_name = "teacher_demo_index"

# 3. 如果索引已存在，删除它（仅供演示，实际应用时不需要这步）
if es.indices.exists(index=index_name):
    es.indices.delete(index=index_name)

# 4. 创建索引
es.indices.create(index=index_name)

# 5. 灌库指令
actions = [
    {
        "_index": index_name,
        "_source": {
            "keywords": to_keywords(para),
            "text": para
        }
    }
    for para in paragraphs
]

# 6. 文本灌库
helpers.bulk(es, actions)
print('文本灌库成功')
# 灌库是异步的
time.sleep(2)

# <!-- 关键字搜索 -->
def search(query_string, top_n=3):
    # ES 的查询语言
    search_query = {
        "match": {
            "keywords": to_keywords(query_string)
        }
    }
    res = es.search(index=index_name, query=search_query, size=top_n)
    return [hit["_source"]["text"] for hit in res["hits"]["hits"]]

results = search("how many parameters does llama 2 have?", 2)
print('数据库 搜索how many parameters does llama 2 have?')
for r in results:
    print(r+"\n")


user_query = "how many parameters does llama 2 have?"

# 1. 检索
search_results = search(user_query, 2)

# 2. 构建 Prompt
prompt = build_prompt(prompt_template, context=search_results, query=user_query)
print("===Prompt===")
print(prompt)

# 3. 调用 LLM
response = get_completion(prompt)

print("===回复===")
print(response)


