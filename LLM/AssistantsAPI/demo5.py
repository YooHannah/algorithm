from common import show_json, client
import sqlite3
from typing_extensions import override
from openai import AssistantEventHandler
import json

# <!-- 创建 Assistant 时声明 Function 查询数据库 -->
assistant = client.beta.assistants.create(
  instructions="你叫瓜瓜。你是AGI课堂的助手。你只回答跟AI大模型有关的问题。不要跟学生闲聊。每次回答问题前，你要拆解问题并输出一步一步的思考过程。",
  # model="gpt-4o",
  model='gpt-3.5-turbo',
  tools=[{
    "type": "function",
    "function": {
      "name": "course_info",
      "description": "用于查看具体课程信息，包括时间表，题目，讲师，等等。Function输入必须是一个合法的SQL表达式。",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "SQL query extracting info to answer the user's question.\nSQL should be written using this database schema:\n\nCREATE TABLE Courses (\n\tid INT AUTO_INCREMENT PRIMARY KEY,\n\tcourse_date DATE NOT NULL,\n\tstart_time TIME NOT NULL,\n\tend_time TIME NOT NULL,\n\tcourse_name VARCHAR(255) NOT NULL,\n\tinstructor VARCHAR(255) NOT NULL\n);\n\nThe query should be returned in plain text, not in JSON.\nThe query should only contain grammars supported by SQLite."
          }
        },
        "required": [
          "query"
        ]
      }
    }
  }]
)

print(assistant.id)
# 定义本地函数和数据库

# 创建数据库连接
conn = sqlite3.connect(':memory:')
cursor = conn.cursor()

# 创建orders表
cursor.execute("""
CREATE TABLE Courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    instructor VARCHAR(255) NOT NULL
);
""")

# 插入5条明确的模拟记录
timetable = [
    ('2024-01-23', '20:00', '22:00', '大模型应用开发基础', '孙志岗'),
    ('2024-01-25', '20:00', '22:00', 'Prompt Engineering', '孙志岗'),
    ('2024-01-29', '20:00', '22:00', '赠课：软件开发基础概念与环境搭建', '西树'),
    ('2024-02-20', '20:00', '22:00', '从AI编程认知AI', '林晓鑫'),
    ('2024-02-22', '20:00', '22:00', 'Function Calling', '孙志岗'),
    ('2024-02-29', '20:00', '22:00', 'RAG和Embeddings', '王卓然'),
    ('2024-03-05', '20:00', '22:00', 'Assistants API', '王卓然'),
    ('2024-03-07', '20:00', '22:00', 'Semantic Kernel', '王卓然'),
    ('2024-03-14', '20:00', '22:00', 'LangChain', '王卓然'),
    ('2024-03-19', '20:00', '22:00', 'LLM应用开发工具链', '王卓然'),
    ('2024-03-21', '20:00', '22:00', '手撕 AutoGPT', '王卓然'),
    ('2024-03-26', '20:00', '22:00', '模型微调（上）', '王卓然'),
    ('2024-03-28', '20:00', '22:00', '模型微调（下）', '王卓然'),
    ('2024-04-09', '20:00', '22:00', '多模态大模型（上）', '多老师'),
    ('2024-04-11', '20:00', '22:00', '多模态大模型（中）', '多老师'),
    ('2024-04-16', '20:00', '22:00', '多模态大模型（下）', '多老师'),
    ('2024-04-18', '20:00', '22:00', 'AI产品部署和交付（上）', '王树冬'),
    ('2024-04-23', '20:00', '22:00', 'AI产品部署和交付（下）', '王树冬'),
    ('2024-04-25', '20:00', '22:00', '抓住大模型时代的创业机遇', '孙志岗'),
    ('2024-05-07', '20:00', '22:00', '产品运营和业务沟通', '孙志岗'),
    ('2024-05-09', '20:00', '22:00', '产品设计', '孙志岗'),
    ('2024-05-14', '20:00', '22:00', '项目方案分析与设计', '王卓然'),
]

for record in timetable:
    cursor.execute('''
    INSERT INTO Courses (course_date, start_time, end_time, course_name, instructor)
    VALUES (?, ?, ?, ?, ?)
    ''', record)

# 提交事务
conn.commit()


def query_database(query):
    cursor.execute(query)
    records = cursor.fetchall()
    return str(records)

# 可以被回调的函数放入此字典
available_functions = {
    "course_info": query_database,
}


class EventHandler(AssistantEventHandler):
    @override
    def on_text_created(self, text) -> None:
        """响应回复创建事件"""
        print(f"\nassistant 1> ", end="", flush=True)

    @override
    def on_text_delta(self, delta, snapshot):
        """响应输出生成的流片段"""
        print(delta.value, end="", flush=True)

    @override
    def on_tool_call_created(self, tool_call):
        """响应工具调用"""
        print(f"\nassistant 2> {tool_call.type}\n", flush=True)

    @override
    def on_tool_call_delta(self, delta, snapshot):
        """响应工具调用的流片段"""
        if delta.type == 'code_interpreter':
            if delta.code_interpreter.input:
                print(delta.code_interpreter.input, end="", flush=True)
            if delta.code_interpreter.outputs:
                print(f"\n\noutput >", flush=True)
                for output in delta.code_interpreter.outputs:
                    if output.type == "logs":
                        print(f"\n{output.logs}", flush=True)

    @override
    def on_event(self, event):
        """
        响应 'requires_action' 事件
        """
        if event.event == 'thread.run.requires_action':
            run_id = event.data.id  # 获取 run ID
            self.handle_requires_action(event.data, run_id)

    def handle_requires_action(self, data, run_id):
        tool_outputs = []

        for tool in data.required_action.submit_tool_outputs.tool_calls:
            arguments = json.loads(tool.function.arguments)
            print(
                f"{tool.function.name}({arguments})",
                flush=True
            )
            # 运行 function
            tool_outputs.append({
                "tool_call_id": tool.id,
                "output": available_functions[tool.function.name](
                    **arguments
                )}
            )

        # 提交 function 的结果，并继续运行 run
        self.submit_tool_outputs(tool_outputs, run_id)

    def submit_tool_outputs(self, tool_outputs, run_id):
        """提交function结果，并继续流"""
        with client.beta.threads.runs.submit_tool_outputs_stream(
            thread_id=self.current_run.thread_id,
            run_id=self.current_run.id,
            tool_outputs=tool_outputs,
            event_handler=EventHandler(),
        ) as stream:
            stream.until_done()

# 创建 thread
thread = client.beta.threads.create()

# 添加 user message
message = client.beta.threads.messages.create(
    # thread_id=thread.id,
    thread_id='thread_YAuzzNUxYPL5FP1mxjjqD3x5',
    role="user",
    content="根据每节课的开始结束时间, 计算每节课的平均时长",
)
# 使用 stream 接口并传入 EventHandler
with client.beta.threads.runs.stream(
    # thread_id=thread.id,
    thread_id='thread_YAuzzNUxYPL5FP1mxjjqD3x5',
    # assistant_id=assistant.id, #assistant.id,
    assistant_id='asst_iunxbY3pxABMcwkDfvxHjYeN',
    event_handler=EventHandler(),
) as stream:
    stream.until_done()

#<!--两个无依赖的 function 会在一次请求中一起被调用-->

# 创建 thread
thread = client.beta.threads.create()

# 添加 user message
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="王卓然上几堂课，比孙志岗多上几堂",
)
# 使用 stream 接口并传入 EventHandler
with client.beta.threads.runs.stream(
    thread_id=thread.id,
    assistant_id=assistant.id,
    event_handler=EventHandler(),
) as stream:
    stream.until_done()