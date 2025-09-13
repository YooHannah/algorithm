
from common import client
import json
from typing_extensions import override
from openai import AssistantEventHandler

# <!-- test4 使用 Tools -->

# 实验一 使用code_interpreter  实现【类function calling】 效果

# assistant = client.beta.assistants.create(
#     name="Demo Assistant",
#     instructions="你是人工智能助手。你可以通过代码回答很多数学问题。",
#     tools=[{"type": "code_interpreter"}], # 声明 code_interpreter 工具
#     model="gpt-3.5-turbo"
# )

# print(assistant.id)
# 在回调中加入 code_interpreter 的事件响应
class EventHandler(AssistantEventHandler):
    @override
    def on_text_created(self, text) -> None:
        """响应输出创建事件"""
        print(f"\nassistant 1 > ", end="", flush=True)

    @override
    def on_text_delta(self, delta, snapshot):
        """响应输出生成的流片段"""
        print(delta.value, end="", flush=True)

    @override
    def on_tool_call_created(self, tool_call):
        """响应工具调用"""
        # print('响应工具调用')
        print(f"\nassistant 2 > {tool_call.type}\n", flush=True)

    @override
    def on_tool_call_delta(self, delta, snapshot):
        """响应工具调用的流片段"""
        # print('响应工具调用的流片段')
        if delta.type == 'code_interpreter':
            if delta.code_interpreter.input:
                print(delta.code_interpreter.input, end="", flush=True)
        if delta.code_interpreter.outputs:
            print(f"\n\noutput >", flush=True)
            for output in delta.code_interpreter.outputs:
                if output.type == "logs":
                    print(f"\n{output.logs}", flush=True)

# 创建 thread
# thread = client.beta.threads.create()
# print(thread)
# 添加新一轮的 user message
# message = client.beta.threads.messages.create(
#     # thread_id=thread.id,
#     thread_id='thread_YAuzzNUxYPL5FP1mxjjqD3x5',
#     role="user",
#     content="用代码计算 1234567 的平方根",
# )
# # 使用 stream 接口并传入 EventHandler
# with client.beta.threads.runs.stream(
#     # thread_id=thread.id,
#     thread_id='thread_YAuzzNUxYPL5FP1mxjjqD3x5',
#     # assistant_id=assistant.id,
#     assistant_id='asst_fsAIgxQORAuqUGRNEoq82tOK',
#     event_handler=EventHandler(),
# ) as stream:
#     stream.until_done()

# 实验二： 通过上传文件，使用 code_interpreter, 对指定资源查询，实现【类rag】效果
# # 上传文件到 OpenAI
file = client.files.create(
    file=open("/Users/bytedance/project/LLM/AssistantsAPI/mydata.csv", "rb"),
    purpose='assistants'
)

# 创建 assistant
my_assistant = client.beta.assistants.create(
    name="CodeInterpreterWithFileDemo",
    instructions="你是数据分析师，按要求分析数据。",
    # model="gpt-4o",
    model='gpt-3.5-turbo',
    tools=[{"type": "code_interpreter"}],
    tool_resources={
        "code_interpreter": {
          "file_ids": [file.id]  # 为 code_interpreter 关联文件
        }
    }
)

# 创建 thread
# thread = client.beta.threads.create()

# 添加新一轮的 user message
message = client.beta.threads.messages.create(
    # thread_id=thread.id,
    thread_id='thread_YAuzzNUxYPL5FP1mxjjqD3x5',
    role="user",
    content="统计csv文件中的总销售额",
)
# 使用 stream 接口并传入 EventHandler
with client.beta.threads.runs.stream(
    # thread_id=thread.id,
    thread_id='thread_YAuzzNUxYPL5FP1mxjjqD3x5',
    assistant_id=my_assistant.id,
    event_handler=EventHandler(),
) as stream:
    stream.until_done()

