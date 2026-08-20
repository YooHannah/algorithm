# 02. 一个 A2A 代理，并连接agents.py 中的 PolicyAgent 
import asyncio
import os
import sys
import uvicorn

from starlette.applications import Starlette

from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.routes import (
    create_agent_card_routes,
    create_jsonrpc_routes,
)
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import (
    AgentCapabilities,
    AgentCard,
    AgentInterface,
    AgentSkill,
)
from a2a.helpers import new_text_message
from a2a.utils.constants import TransportProtocol, PROTOCOL_VERSION_1_0
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from helper import load_env
from agents import PolicyAgent


class PolicyAgentExecutor(AgentExecutor):
    def __init__(self) -> None:
        self.agent = PolicyAgent()

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        prompt = context.get_user_input()
        if not prompt:
            return
        response = await asyncio.to_thread(self.agent.answer_question, prompt)
        message = new_text_message(text=response)
        await event_queue.enqueue_event(message)

    async def cancel(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        pass


def main() -> None:
    print("Running A2A Health Insurance Policy Agent")
    load_env()
    PORT = int(os.environ.get("POLICY_AGENT_PORT", 9999))
    HOST = os.environ.get("AGENT_HOST", "localhost")

    skill = AgentSkill(
        id="insurance_coverage",
        name="Insurance coverage",
        description="Provides information about insurance coverage options and details.",
        tags=["insurance", "coverage"],
        examples=["What does my policy cover?", "Are mental health services included?"],
    )

    agent_card = AgentCard(
        name="InsurancePolicyCoverageAgent",
        description="Provides information about insurance policy coverage options and details.",
        version="1.0.0",
        default_input_modes=["text"],
        default_output_modes=["text"],
        capabilities=AgentCapabilities(streaming=False),
        skills=[skill],
        supported_interfaces=[
            AgentInterface(
                protocol_binding=TransportProtocol.JSONRPC,
                protocol_version=PROTOCOL_VERSION_1_0,
                url=f"http://{HOST}:{PORT}/",
            ),
        ],
    )

    request_handler = DefaultRequestHandler(
        agent_executor=PolicyAgentExecutor(),
        task_store=InMemoryTaskStore(),
        agent_card=agent_card,
    )

    routes = [
        *create_agent_card_routes(agent_card),
        *create_jsonrpc_routes(request_handler, rpc_url="/"),
    ]

    app = Starlette(routes=routes)
    uvicorn.run(app, host=HOST, port=PORT)


if __name__ == "__main__":
    main()
