# <!-- 加载本地数据 -->
from common import show_json
from llama_index.core import SimpleDirectoryReader
from llama_index.readers.file import PyMuPDFReader
# from llama_index.readers.feishu_docs import FeishuDocsReader

# test1 
# reader = SimpleDirectoryReader(
#         input_dir="/Users/bytedance/project/LLM/llamaIndex/data", # 目标目录
#         recursive=False, # 是否递归遍历子目录
#         required_exts=[".pdf"] # (可选)只读取指定后缀的文件
#     )
# documents = reader.load_data()

# show_json(documents[0])

# print(documents[0].text)

# test2 加载指定文件加载器
reader = SimpleDirectoryReader(
        input_dir="/Users/bytedance/project/LLM/llamaIndex/data", # 目标目录
        recursive=False, # 是否递归遍历子目录
        required_exts=[".pdf"], # (可选)只读取指定后缀的文件
        file_extractor={".pdf": PyMuPDFReader()} # here 指定特定的文件加载器 
    )

documents = reader.load_data()

print(documents[0].text)

# test3 <!-- 加载飞书文档 -->

# 见说明文档
app_id = "cli_a6f1c0fa1fd9d00b"
app_secret = "dMXCTy8DGaty2xn8I858ZbFDFvcqgiep"

# https://agiclass.feishu.cn/docx/FULadzkWmovlfkxSgLPcE4oWnPf
# 链接最后的 "FULadzkWmovlfkxSgLPcE4oWnPf" 为文档 ID 
# doc_ids = ["FULadzkWmovlfkxSgLPcE4oWnPf"]

# 定义飞书文档加载器
# loader = FeishuDocsReader(app_id, app_secret)

#加载文档
# documents = loader.load_data(document_ids=doc_ids)

#显示前1000字符
# print(documents[0].text[:1000])