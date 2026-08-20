# 05. 组合多个agent 调用 用google 相关sdk

import os
import asyncio

from google.adk.agents import SequentialAgent
from google.adk.agents.remote_a2a_agent import (
    RemoteA2aAgent,
)
from google.adk.runners import InMemoryRunner
from helper import load_env

load_env()

host = os.environ.get("AGENT_HOST")
policy_port = os.environ.get("POLICY_AGENT_PORT")
research_port = os.environ.get("RESEARCH_AGENT_PORT")

print("Running Healthcare Workflow Agent")

async def main() -> None:
    print("Initializing agents...")
    policy_agent = RemoteA2aAgent(
        name="policy_agent",
        agent_card=f"http://{host}:{policy_port}",
    )
    print("Policy agent initialized.")

    research_agent = RemoteA2aAgent(
        name="research_agent",
        agent_card=f"http://{host}:{research_port}",
    )
    print("Research agent initialized.")

    root_agent = SequentialAgent(
        name="root_agent",
        description="Healthcare Routing Agent",
        sub_agents=[
            research_agent,
            policy_agent,
        ],
    )
    print("Root agent initialized.")

    prompt = "How can I get mental health therapy?"

    print("Running prompt: ", prompt)
    runner = InMemoryRunner(root_agent)
    print("Runner initialized.")

    for event in await runner.run_debug(prompt, quiet=True):
        if event.is_final_response() and event.content:
            print("Final response received:----------------")
            print(event.content.parts[0].text)


if __name__ == "__main__":
    asyncio.run(main())

