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
from helper import install_frontend
from helper import start_frontend
from helper import display_app



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

# # Start the frontend
# install_frontend()
# start_frontend(port=3002)
# display_app(port=3002)

# 执行 start_server 适合在juppyter notebook 中运行
# python-c "
# exec(open('index.py').read())
# import time
# while True:
#     time.sleep(60)
# "
