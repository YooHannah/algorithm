# 本脚本主要练习 
# 1. 声明不同模型agent 
# 2. 通过copilotKit 在 frontend 中直接进行切换调用不同agent

# 涉及前端文件
# 1. frontend/server.ts 在前端注册agent
# 2. frontend/src/main.tsx 在前端调用agent
# 3. frontend/src/App.tsx 在具体组件中切换指定agent

import warnings
from fastapi import FastAPI

# CopilotKit and AG-UI dependencies for the AG-UI server
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import LangGraphAGUIAgent
from copilotkit import CopilotKitMiddleware

# LangChain agent imports
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

#  create and start a Google ADK agent on port 8009
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from google.adk.agents import LlmAgent

# Simple helper that starts the server and manages port conflicts
from helper import start_server
from helper import load_api_keys

from helper import get_ark_api_key
from helper import get_ark_api_base
from helper import get_ark_model_name

ARK_API_KEY = get_ark_api_key()
ARK_API_BASE = get_ark_api_base()
ARK_MODEL_NAME = get_ark_model_name()

load_api_keys()

warnings.filterwarnings("ignore")

# *************************** 建一个LangChain agent ***************************

# Build the AG-UI endpoint into a FastAPI app
# CopilotKit 通过兼容 AG-UI 的 HTTP 端点连接到agent。在这里，将启动一个 FastAPI 服务器并挂载一个 LangGraphAGUIAgent。
app = FastAPI()
graph = create_agent("openai:gpt-4.1")
agent = LangGraphAGUIAgent(
    name="lesson2_agent",
    description="Lesson 2 chart agent",
    graph=graph,
)
add_langgraph_fastapi_endpoint(app=app, agent=agent, path="/")

# Start the server
start_server(app, port=8002)

# Make a pre-built LangChain agent
# CopilotKitMiddleware connects your agent to CopilotKit — it lets the model discover and call frontend tools
# Without the middleware, the agent only sees backend-defined tools.
graph = create_agent(
    model=ChatOpenAI(model="gpt-4.1"),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    checkpointer=MemorySaver(),
    system_prompt=("You are a helpful assistant"),
)

# Update the agent's graph (hot reloads) 
# 使用 agent.graph 替换graph
agent.graph = graph 
print("✓ Agent graph updated!")

# *************************** 建一个Google ADK agent ***************************

# create and start a Google ADK agent on port 8009
gemini_agent = LlmAgent(
    name="assistant",
    model="gemini-2.5-flash",
    instruction="Be helpful and fun!",
)

adk_agent = ADKAgent(
    adk_agent=gemini_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app_adk = FastAPI()
add_adk_fastapi_endpoint(app_adk, adk_agent, path="/")

start_server(app_adk, port=8009)

#* ************************* 建一个火山引擎 ADK agent ***************************

ark_app_sdk = FastAPI()
ark_graph = create_agent(
    model=ChatOpenAI(
        openai_api_key=ARK_API_KEY,
        openai_api_base=ARK_API_BASE,
        model_name=ARK_MODEL_NAME, # 从环境变量读取模型
    ),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    checkpointer=MemorySaver(),
    system_prompt=("You are a helpful assistant"),
)
ark_agent = LangGraphAGUIAgent(
    name="ark_agent",
    description="Ark agent for Lesson 2",
    graph=ark_graph,
)
add_langgraph_fastapi_endpoint(ark_app_sdk, ark_agent, path="/")

# Start the server
start_server(ark_app_sdk, port=8010)

# start_server 适合在 Jupyter Notebook 中运行（daemon 线程）
# 在 Notebook 里，Python 进程（Kernel）一直跑着，所以 daemon 线程也会一直活着
# 线程类型                     主程序退出时          适合场景 
# 守护线程 ( daemon=True )     ✅ 一起被杀掉         Jupyter Notebook、临时后台任务 
# 非守护线程 ( daemon=False )  ❌ 主程序会等它跑完     独立服务、常驻进程

# 下面的循环让终端运行时服务保持活跃
print("\n" + "="*50)
print("✅ 所有服务已启动，按 Ctrl+C 停止")
print("   Agent 服务: http://localhost:8002")
print("   ADK 服务:   http://localhost:8009")
print("   Ark 服务:   http://localhost:8010")
print("="*50)

import time
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    print("\n\n🛑 服务已停止")
    import sys
    sys.exit(0)
