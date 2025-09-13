from common import client
import json
from typing_extensions import override
from openai import AssistantEventHandler

# <!-- test1 创建 assistant -->

assistant = client.beta.assistants.create(
    name="AGIClass Demo",
    instructions="你是一个中学老师，只能回答和教学相关的问题",
    # model="gpt-4o",
    model='gpt-3.5-turbo'
)

print(assistant.id)
