from common import show_json, client

# <!-- test2 创建 thread -->

# 创建 thread
thread = client.beta.threads.create()
print('thread')
show_json(thread)

#可以根据需要，自定义 `metadata`，比如创建 thread 时，把 thread 归属的用户信息存入。
thread = client.beta.threads.create(
    metadata={"fullname": "王卓然", "username": "wzr"}
)
show_json(thread)
thread = client.beta.threads.retrieve(thread.id)
show_json(thread)

thread = client.beta.threads.create(
    messages=[
        {
            "role": "user",
            "content": "你好",
        },
        {
            "role": "assistant",
            "content": "有什么可以帮您？",
        },
        {
            "role": "user",
            "content": "你是谁？",
        },
    ]
)
print("显示-----")
show_json(thread)  # 显示 thread id: thread_weWKPDNoUkSutvEbLhcx0rUS
print("-----")
show_json(client.beta.threads.messages.list(
    thread.id))  # 显示指定 thread 中的 message 列表