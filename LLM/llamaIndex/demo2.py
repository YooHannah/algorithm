# <!--TokenTextSplitter 按指定 token 数切分文本 不同文件类型使用不同parser-->
from llama_index.core import Document
from llama_index.core.node_parser import TokenTextSplitter, MarkdownNodeParser
from common import show_json
from llama_index.readers.file import FlatReader
from pathlib import Path
from demo1 import documents

# print('原始pdf文本')
# print(documents[0].text)
# node_parser = TokenTextSplitter(
#     chunk_size=100,  # 每个 chunk 的最大长度
#     chunk_overlap=50  # chunk 之间重叠长度 
# )

# nodes = node_parser.get_nodes_from_documents(
#     documents, show_progress=False
# )
# print('****************** pdf切割 **************')
# print(len(nodes))
# show_json(nodes[0])
# show_json(nodes[1])
# show_json(nodes[2])

# 使用 node_parser 切分文本
md_docs = FlatReader().load_data(Path("/Users/bytedance/project/LLM/llamaIndex/data/prompt.md"))
print('原始pdf文本')
print(md_docs[0].text)
parser = MarkdownNodeParser()
nodes = parser.get_nodes_from_documents(md_docs)

print('****************** md切割 ***************')
print(len(nodes))
show_json(nodes[0])
show_json(nodes[1])
show_json(nodes[2])