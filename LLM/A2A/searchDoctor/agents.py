import json
import os
import sys
from pathlib import Path

from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI


sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from helper import load_env

load_env()

class ProviderAgent:
    def __init__(self) -> None:
        self.ARK_API_KEY = os.getenv("ARK_API_KEY")
        self.ARK_API_BASE = os.getenv("ARK_API_BASE")
        self.ARK_MODEL_NAME = os.getenv("ARK_MODEL_NAME")
         
        self.mcp_client = MultiServerMCPClient(
            {
                "find_healthcare_providers": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["mcpserver.py"],
                }
            }
        )
        self.agent = None

    async def initialize(self):
        """Initialize the agent asynchronously."""
        print('initialize agent~~~~~~~~~~', self.mcp_client)

        tools = await self.mcp_client.get_tools()
        print('get tools', tools)

        self.agent = create_agent(
            ChatOpenAI(
                api_key=self.ARK_API_KEY,
                base_url=self.ARK_API_BASE,
                model=self.ARK_MODEL_NAME
            ),
            tools,
            name="HealthcareProviderAgent",
            system_prompt="""Your task is to find and list providers using 
            the find_healthcare_providers MCP Tool based on the users query. 
            Only use providers based on the response from the tool. Output 
            the information in a table.""",
        )
        return self

    async def answer_query(self, prompt: str) -> str:
        if self.agent is None:
            raise RuntimeError("""Agent not initialized. Call initialize() 
            first.""")

        response = await self.agent.ainvoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ]
            }
        )
        return response["messages"][-1].content