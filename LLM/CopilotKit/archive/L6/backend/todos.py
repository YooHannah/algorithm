from __future__ import annotations

import uuid

from langchain.agents.middleware import AgentState as BaseAgentState
from langchain.tools import ToolRuntime, tool
from langchain_core.messages import ToolMessage
from langgraph.types import Command
from typing_extensions import TypedDict


class Todo(TypedDict):
    id: str
    title: str
    completed: bool


class AgentState(BaseAgentState):
    todos: list[Todo]
