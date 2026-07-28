from pathlib import Path
import sys
from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

_LESSON_ROOT = Path(__file__).resolve().parents[1]
if str(_LESSON_ROOT) not in sys.path:
    sys.path.insert(0, str(_LESSON_ROOT))

from helper import get_ark_api_key
from helper import get_ark_api_base
from helper import get_ark_model_name

ARK_API_KEY = get_ark_api_key()
ARK_API_BASE = get_ark_api_base()
ARK_MODEL_NAME = get_ark_model_name()

import logging
logging.getLogger("langgraph.checkpoint").setLevel(logging.ERROR)

agent = create_agent(
    model=ChatOpenAI(
        # model="gpt-5.4-mini",
        openai_api_key=ARK_API_KEY,
        openai_api_base=ARK_API_BASE,
        model_name=ARK_MODEL_NAME, # 从环境变量读取模型
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
