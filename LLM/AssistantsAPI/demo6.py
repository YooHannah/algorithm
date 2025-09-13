from common import client
import json
from typing_extensions import override
from openai import AssistantEventHandler
from demo5 import EventHandler

# <!-- 内置的 RAG 功能 -->

# 创建 Vector Store
vector_store = client.beta.vector_stores.create(
  name="MyVectorStore"
)

# 通过代码上传文件到 OpenAI 的存储空间
file = client.files.create(
  file=open("/Users/bytedance/project/LLM/AssistantsAPI/test.pdf", "rb"),
  purpose="assistants"
)

# 通过代码将文件添加到 Vector Store

vector_store_file = client.beta.vector_stores.files.create(
  vector_store_id=vector_store.id,
  file_id=file.id
)

# 批量上传文件到 Vector Store

# files = ['file1.pdf','file2.pdf']

# file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
#     vector_store_id=vector_store.id,
#     files=[open(filename, "rb") for filename in files]
# )

# # <!-- RAG -->
assistant = client.beta.assistants.create(
  instructions="你是个问答机器人，你根据给定的知识回答用户问题。",
  # model="gpt-4o",
  model='gpt-3.5-turbo',
  tools=[{"type": "file_search"}],
)

assistant = client.beta.assistants.update(
  assistant_id=assistant.id,
  tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)

# 创建 thread
thread = client.beta.threads.create()

# 添加 user message
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="男生可以服用元气膏吗",
)
# 使用 stream 接口并传入 EventHandler
with client.beta.threads.runs.stream(
    thread_id=thread.id,
    assistant_id=assistant.id,
    event_handler=EventHandler(),
) as stream:
    stream.until_done()