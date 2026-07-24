from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

import logging
logging.getLogger("langgraph.checkpoint").setLevel(logging.ERROR)

agent = create_agent(
    model=ChatOpenAI(
        model="gpt-5.4-mini",
    ),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    checkpointer=MemorySaver(),
    system_prompt=(
        """
        You are a helpful assistant. 
        
        For sandboxed UI (not excalidraw):
        - When making it rain tacos, use taco emojis and don't add controls
        """
    ),
)

graph = agent
