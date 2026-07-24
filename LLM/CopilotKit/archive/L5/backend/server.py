from __future__ import annotations

import logging
import warnings

warnings.filterwarnings("ignore")
logging.getLogger("langgraph.checkpoint").setLevel(logging.ERROR)

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from fastapi import FastAPI
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

import textwrap

SYSTEM_PROMPT: str = textwrap.dedent("""
    You are a helpful assistant operating in an interactive UI. Your name is Bob.

    Default behavior:
    - For any visual/interactive output, use the sandbox UI tool with a 400px tall card wrapping all content you make.
    - For an architecture or whiteboarding, use Excalidraw
    - Otherwise, respond conversationally.

    
    WHEN MAKING SANDBOX UI:
    - Always wrap your UI in a 400px tall card. NEVER MAKE A UI WITHOUT A CARD.
    - When making it rain tacos, use emojis - do NOT generate an SVG for it

    WHEN USING EXALIDRAW:
    - Remember you're on a cartesian plane - you need to account for the size of cards and labels.
    - Network/architecture diagrams (any request to draw/show a diagram
      with routers, servers, laptops, etc.): use the excalidraw tool
      instead of the sandbox UI. Keep it clean and simple, with clear
      labels and a title.
""").strip()

def _build_graph():
    return create_agent(
        model=ChatOpenAI(
            model="gpt-5.4-mini",
            temperature=0,
        ),
        tools=[],
        middleware=[CopilotKitMiddleware()],
        checkpointer=MemorySaver(),
        system_prompt=(
           SYSTEM_PROMPT
        ),
    )


def start_backend(port: int = 8005) -> None:
    from helper import start_server

    app = FastAPI()
    agent = LangGraphAGUIAgent(
        name="app_agent",
        description="Simple MCP app agent",
        graph=_build_graph(),
    )
    add_langgraph_fastapi_endpoint(app=app, agent=agent, path="/")
    start_server(app, port=port)
