import warnings

warnings.filterwarnings("ignore")

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import LangGraphAGUIAgent
from langchain.agents import create_agent

from fastapi import FastAPI

app = FastAPI()
graph = create_agent("openai:gpt-4.1")
agent = LangGraphAGUIAgent(
    name="default",
    description="Lesson 6 shared-state todo agent",
    graph=graph,
)

add_langgraph_fastapi_endpoint(app=app, agent=agent, path="/")


def start_backend(port: int = 8006) -> None:
    from helper import start_server
    start_server(app, port=port)
