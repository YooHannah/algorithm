# 创建助手
from common import client
import json
from typing_extensions import override
from openai import AssistantEventHandler

# # <!--6顶思维帽实验 -->
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

def show_json(obj):
    """把任意对象用排版美观的 JSON 格式打印出来"""
    print(json.dumps(
        json.loads(obj.model_dump_json()),
        indent=4,
        ensure_ascii=False
    ))

hats = {
    "蓝色": "思考过程的控制和组织者。你负责会议的组织、思考过程的概览和总结。"
    + "首先，整个讨论从你开场，你只陈述问题不表达观点。最后，再由你对整个讨论做简短的总结并给出最终方案。",
    "白色": "负责提供客观事实和数据。你需要关注可获得的信息、需要的信息以及如何获取那些还未获得的信息。"
    + "思考“我们有哪些数据？我们还需要哪些信息？”等问题，并提供客观答案。",
    "红色": "代表直觉、情感和直觉反应。不需要解释和辩解你的情感或直觉。"
    + "这是表达未经过滤的情绪和感受的时刻。",
    "黑色": "代表谨慎和批判性思维。你需要指出提案的弱点、风险以及为什么某些事情可能无法按计划进行。"
    + "这不是消极思考，而是为了发现潜在的问题。",
    "黄色": "代表乐观和积极性。你需要探讨提案的价值、好处和可行性。这是寻找和讨论提案中正面方面的时候。",
    "绿色": "代表创造性思维和新想法。鼓励发散思维、提出新的观点、解决方案和创意。这是打破常规和探索新可能性的时候。",
}

queue = ["蓝色", "白色", "红色", "黑色", "黄色", "绿色", "蓝色"]

existing_assistants = {}

def create_assistant(color):
    if color in existing_assistants:
        return existing_assistants[color]
    assistant = client.beta.assistants.create(
        name=f"{color}帽子角色",
        instructions=f"我们在进行一场Six Thinking Hats讨论。按{queue}顺序。你的角色是{color}帽子。",
        # model="gpt-4o",
        model='gpt-3.5-turbo',
    )
    existing_assistants[color] = assistant
    return assistant

# 创建 thread
thread = client.beta.threads.create()

topic = "面向非AI背景的程序员群体设计一门AI大语言模型课程，应该包含哪些内容。"

# # 添加 user message
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content=f"讨论话题：{topic}\n\n[开始]\n",
)

for hat in queue:
    assistant = create_assistant(hat)
    with client.beta.threads.runs.stream(
        thread_id=thread.id,
        assistant_id=assistant.id,
        event_handler=EventHandler(),
    ) as stream:
        stream.until_done()
    print()

===>
assistant 1> 首先，我认为设计这门AI大语言模型课程的目的是让非AI背景的程序员群体能够快速入门并掌握相关知识。在课程内容设计上，
我建议首先介绍AI大语言模型的基本概念和原理，包括语言模型在自然语言处理中的应用和重要性。

接着，可以深入讲解AI大语言模型的工作机制，如基于神经网络的模型架构和训练方法。同时，还应该介绍一些常见的AI大语言模型，比如BERT、GPT等，以及它们的特点和使用场景。

另外，设计这门课程时还应该考虑到非AI背景程序员的实际需求，可以包括如何使用现有的AI大语言模型工具和框架，如TensorFlow、PyTorch等，以及如何应用这些工具来解决实际问题。

最后，我认为在课程中还可以加入一些实践案例和项目实践，让学员通过实际操作来加深对AI大语言模型的理解并提升实践能力。
这样能够帮助非AI背景的程序员群体更好地掌握AI大语言模型的知识和应用。

assistant 1> [结束]

assistant 1> 在这个话题上，你对AI大语言模型课程的内容进行了清晰而详细的讨论。你提出了基本概念、工作机制、常见模型、工具框架和实践案例等内容，
为非AI背景的程序员群体设计了一套系统性的课程。你的思路很清晰，能够全面地满足学员的学习需求。

assistant 1> 在这个讨论中，我们已经听到了各种不同的意见和观点。作为黑色帽子的我，
我想强调的是确保设计的AI大语言模型课程内容能够全面而系统地帮助非AI背景的程序员群体理解这一复杂领域。我们需要确保内容的深度和广度都足够，
同时要关注实践性和可操作性，让学员在学习过程中既能掌握理论知识，又能够应用于实际项目中。这样才能真正帮助他们在AI大语言模型领域取得成功。

assistant 1> 作为绿色帽子，我想说，设计AI大语言模型课程时应该注意激发学员的学习兴趣和潜力。可以结合一些有趣的实例和案例，
让学员在学习过程中感受到AI大语言模型的强大功能和应用前景，激发他们的好奇心和创造力。此外，还可以引入一些互动式的学习方式，
比如小组讨论、实践项目等，让学员积极参与，提高学习效果。通过激发学员的学习兴趣，可以更好地帮助他们掌握AI大语言模型的知识并应用到实际工作中。

assistant 1> 在这个讨论中，我们已经听到了不同颜色帽子的意见，每个角色都从不同的角度对设计AI大语言模型课程的内容提出了宝贵的建议。
综合起来，我们可以看到这门课程应该包括基本概念、工作机制、常见模型、工具框架、实践案例等内容，并且要注重系统性、实践性以及激发学员学习兴趣。
这样设计出的课程才能真正帮助非AI背景的程序员群体快速入门和掌握AI大语言模型知识。

assistant 1> 讨论目前已经进行了一段时间，我们从不同的角度探讨了设计AI大语言模型课程的内容。
作为蓝色帽子，我的任务是总结讨论的重要内容并提出下一步行动计划。
根据讨论，我们可以得出以下结论：设计AI大语言模型课程时应包括基本概念、工作机制、常见模型、工具框架、实践案例等内容，确保内容全面系统；
要注重实践性和可操作性，让学员能够应用所学知识解决实际问题；同时要激发学员学习兴趣，可以引入趣味案例和互动式学习方式。
下一步，我们可以详细制定课程大纲和教学计划，同时考虑如何有效评估学员的学习效果。
这样可以确保设计出一门符合需求的AI大语言模型课程，帮助非AI背景的程序员群体快速学习和掌握相关知识。