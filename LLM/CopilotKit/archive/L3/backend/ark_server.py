# 本脚本 主要用来练习前端组件的注册
# 注册组件后，大模型响应可以在 `<CopilotChat />` 中调用
# 涉及前端文件
# 1. frontend/src/App.tsx 在前端使用useComponent 注册组件
# 从组件使用开放性(Generative UI)角度考虑，当前渲染组件属于Controlled Generative UI
# 当命中组件的描述时，模型会调用该组件进行渲染

# What is Controlled Generative UI?
# Generative UI is a pattern where agents respond with fully interactive interfaces, not just text. Controlled Generative UI is the most constrained variant: the agent can only render components you explicitly register.

# How it works
# Each registered component is exposed as a tool with:

# a stable name
# a typed input schema
# a mapped React component
# The agent doesn't generate arbitrary UI. It passes structured data into components you've built, all defined on the frontend and registered at runtime.

# Pros and cons
# Pros

# Easy to implement: register a component and you're done.
# High visual polish, since every rendered surface is one you authored.
# Strong safety: the model can only call registered tools with validated arguments.
# Good fit for high-traffic or mission-critical UX where stability matters.
# Cons

# Frontend effort grows with every new capability: each pattern needs its own component.
# Less expressive freedom than declarative or open-ended generative UI.

# 什么是受控生成式用户界面？¶
# Generative UI is a pattern where agents respond with fully interactive interfaces, not just text. Controlled Generative UI is the most constrained variant: the agent can only render components you explicitly register.
# 生成式用户界面是一种模式，在这种模式下，智能体会使用完全交互式的界面进行响应，而不仅仅是文本。而受控生成式用户界面则是最严格的形式：智能体只能渲染你明确注册过的组件。

# How it works  其工作原理如下：¶
# Each registered component is exposed as a tool with:
# 每个已注册的成分都作为一个工具被呈现出来，具有以下功能：

# a stable name  一个稳定的名字
# a typed input schema
# 一个格式化的输入模式
# a mapped React component
# 一个已映射的 React 组件
# The agent doesn't generate arbitrary UI. It passes structured data into components you've built, all defined on the frontend and registered at runtime.
# 该代理不会生成随机的用户界面。它会将结构化数据传递给你已经构建的组件，而这些组件的定义是在前端阶段完成的，并且在运行时被注册到相应的位置。

# Pros and cons  优缺点 ¶
# Pros  优点

# Easy to implement: register a component and you're done.
# 实施起来非常简单：只需注册一个组件即可。
# High visual polish, since every rendered surface is one you authored.
# 视觉效果非常精致，因为所有渲染出的表面都是您亲手创作的。
# Strong safety: the model can only call registered tools with validated arguments.
# 强大的安全性保障：该模型只能调用那些具有有效参数的注册工具。
# Good fit for high-traffic or mission-critical UX where stability matters.
# 非常适合那些需要稳定性能的、高流量或关键任务型的用户界面场景。
# Cons  消费

# Frontend effort grows with every new capability: each pattern needs its own component.
# 随着新功能的不断增加，前端开发的工作量也在逐步上升：每一种模式都需要相应的组件来支持。
# Less expressive freedom than declarative or open-ended generative UI.
# 相比声明式或开放式生成式 UI，其表达自由度要低一些。

from __future__ import annotations

import csv
import sys
import warnings
from pathlib import Path
from typing import Any

warnings.filterwarnings("ignore")

# 将 L3 根目录加入 sys.path，使 helper.py 可以被正确导入
_LESSON_ROOT = Path(__file__).resolve().parents[1]
if str(_LESSON_ROOT) not in sys.path:
    sys.path.insert(0, str(_LESSON_ROOT))

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from fastapi import FastAPI
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

from helper import get_ark_api_key
from helper import get_ark_api_base
from helper import get_ark_model_name

CSV_PATH = _LESSON_ROOT / "db.csv"

ARK_API_KEY = get_ark_api_key()
ARK_API_BASE = get_ark_api_base()
ARK_MODEL_NAME = get_ark_model_name()

@tool
def query_data(query: str) -> list[dict[str, Any]]:
    """Query the lesson dataset. Always call before showing a chart or graph."""
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def _build_graph():
    return create_agent(
        model=ChatOpenAI(
            openai_api_key=ARK_API_KEY,
                openai_api_base=ARK_API_BASE,
                model_name=ARK_MODEL_NAME, # 从环境变量读取模型
            ),
        tools=[query_data],
        middleware=[CopilotKitMiddleware()],
        checkpointer=MemorySaver(),
        # system_prompt=("You are a helpful assistant"),
        system_prompt=(
            "You are a helpful assistant for a demo app with a few available UI tools. "
            "When a user asks for charts based on the lesson dataset, always call query_data first to fetch all CSV rows. "
            "Prefer using a matching frontend tool when it would present the answer clearly. "
            "Use pieChart for category distributions "
            "and flightCard for a single flight summary when relevant. "
            "Tool arguments must match the provided schema exactly."
        ),
    )


def start_backend(port: int = 8003) -> None:
    from helper import start_server

    app = FastAPI()
    agent = LangGraphAGUIAgent(
        name="lesson3_charts_agent",
        description="Lesson 3 controlled generative UI agent",
        graph=_build_graph(),
    )
    add_langgraph_fastapi_endpoint(app=app, agent=agent, path="/")
    start_server(app, port=port)

# 执行python ark_server.py 启动 Ark 服务
start_backend(port=8003)

import time
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    print("\n\n🛑 服务已停止")
    import sys
    sys.exit(0)

