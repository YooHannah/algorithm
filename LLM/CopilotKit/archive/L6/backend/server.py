from pathlib import Path
import sys
import warnings

warnings.filterwarnings("ignore")

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

from fastapi import FastAPI
from todos import todo_tools,AgentState

_LESSON_ROOT = Path(__file__).resolve().parents[1]
if str(_LESSON_ROOT) not in sys.path:
    sys.path.insert(0, str(_LESSON_ROOT))

from helper import get_ark_api_key
from helper import get_ark_api_base
from helper import get_ark_model_name

ARK_API_KEY = get_ark_api_key()
ARK_API_BASE = get_ark_api_base()
ARK_MODEL_NAME = get_ark_model_name()

app = FastAPI()
# graph = create_agent("openai:gpt-4.1")
graph = create_agent(
    model=ChatOpenAI(
        openai_api_key=ARK_API_KEY,
        openai_api_base=ARK_API_BASE,
        model_name=ARK_MODEL_NAME, # 从环境变量读取模型
    ),
    state_schema=AgentState,
    tools=todo_tools,
    middleware=[CopilotKitMiddleware()],
    checkpointer=MemorySaver(),
    system_prompt=(
        "You manage a shared todo list. "
        "Use manage_todos to add, edit, or remove todos. "
        "Use get_todos to check the current list. "
        "When asked to manage todos, call the openOrCloseTodos frontend tool with open=true first. "
        "Keep responses to 1-2 sentences."
    ),
)
agent = LangGraphAGUIAgent(
    name="default",
    description="Lesson 6 shared-state todo agent",
    graph=graph,
)

add_langgraph_fastapi_endpoint(app=app, agent=agent, path="/")


def start_backend(port: int = 8006) -> None:
    from helper import start_server
    start_server(app, port=port)

start_backend(port=8006)

import time
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    print("\n\n🛑 服务已停止")
    import sys
    sys.exit(0)