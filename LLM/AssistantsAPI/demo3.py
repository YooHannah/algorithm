from common import show_json, client
from demo1 import assistant
from openai import AssistantEventHandler

# <!-- test3 执行run thread携带绑定的message  role user 向assistant指定的LLM提问 -->
thread = client.beta.threads.create()
# 方式一： 直接输出完整回答 client.beta.threads.runs.create_and_poll
message = client.beta.threads.messages.create( # 再绑个问题
    # thread_id=thread.id,
    thread_id='thread_weWKPDNoUkSutvEbLhcx0rUS',
    role="user",
    content="一共有多少节课？",
)
run = client.beta.threads.runs.create_and_poll(
    # thread_id=thread.id, thread_YAuzzNUxYPL5FP1mxjjqD3x5
    # assistant_id=assistant.id, asst_KGyKdGhQfkU3U244O0gJaQED
    thread_id='thread_weWKPDNoUkSutvEbLhcx0rUS',
    assistant_id='asst_KGyKdGhQfkU3U244O0gJaQED'
)

if run.status == 'completed':
    messages = client.beta.threads.messages.list(
        # thread_id=thread.id
        thread_id='thread_weWKPDNoUkSutvEbLhcx0rUS',
    )
    print('直接执行run')
    show_json(messages)
else:
    print(run.status)

# 方式二： 一个字一个字的形式返回 client.beta.threads.runs.stream
# 可以用event_handler 进行拦截

class EventHandler(AssistantEventHandler):
    @override
    def on_text_created(self, text) -> None:
        """响应输出创建事件"""
        print('响应输出创建事件')
        print(f"\nassistant > ", end="", flush=True)

    @override
    def on_text_delta(self, delta, snapshot):
        """响应输出生成的流片段"""
        print('响应输出生成的流片段')
        print(delta.value, end="", flush=True)

message = client.beta.threads.messages.create(
    # thread_id=thread.id,
    thread_id='thread_YAuzzNUxYPL5FP1mxjjqD3x5',
    role="user",
    content="一共有多少节课？",
)
# 使用 stream 接口并传入 EventHandler
with client.beta.threads.runs.stream(
    # thread_id=thread.id,
    # assistant_id=assistant_id,
    thread_id='thread_YAuzzNUxYPL5FP1mxjjqD3x5',
    assistant_id='asst_KGyKdGhQfkU3U244O0gJaQED',
    event_handler=EventHandler(),
) as stream:
    stream.until_done()
