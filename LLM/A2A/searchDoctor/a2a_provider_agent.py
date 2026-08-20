import os
import sys
from pathlib import Path

import uvicorn
from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import (
    AgentCapabilities,
    AgentCard,
    AgentInterface,
    AgentSkill,
)
from a2a.utils.constants import TransportProtocol, PROTOCOL_VERSION_1_0
from a2a.helpers import new_text_message
from agents import ProviderAgent

from starlette.applications import Starlette

from a2a.server.routes import (
    create_agent_card_routes,
    create_jsonrpc_routes,
)
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from helper import load_env

load_env()

class ProviderAgentExecutor(AgentExecutor):
    """This is an agent for finding healthcare providers based on location and specialty."""
    
    def __init__(self) -> None:
        # Don't await in __init__ - it's not async
        self.agent = None
    
    async def _ensure_initialized(self) -> None:
        """Lazy initialization of the agent."""
        if self.agent is None:
            self.agent = await ProviderAgent().initialize()
    
    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        print('start execute')
        
        await self._ensure_initialized()
        
        prompt = context.get_user_input()
        response = await self.agent.answer_query(prompt)
        await event_queue.enqueue_event(new_text_message(text=response))
    
    async def cancel(self, context: RequestContext, event_queue: EventQueue) -> None:
        pass
def main():
    print("Running Healthcare Provider Agent")
    
    HOST = os.environ.get("AGENT_HOST", "localhost")
    PORT = int(os.environ.get("PROVIDER_AGENT_PORT", 9997))
    
    skill = AgentSkill(
        id="find_healthcare_providers",
        name="Find Healthcare Providers",
        description="Finds and lists healthcare providers based on user's location and specialty.",
        tags=["healthcare", "providers", "doctor", "psychiatrist"],
        examples=[
            "Are there any Psychiatrists near me in Boston, MA?",
            "Find a pediatrician in Springfield, IL.",
        ],
    )
    
    agent_card = AgentCard(
        name="HealthcareProviderAgent",
        description="An agent that can find and list healthcare providers based on a user's location and desired specialty.",
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
        agent_executor=ProviderAgentExecutor(),
        task_store=InMemoryTaskStore(),
        agent_card=agent_card,
    )
    
    routes = [
        *create_agent_card_routes(agent_card),
        *create_jsonrpc_routes(request_handler, rpc_url="/"),
    ]

    # testAgent = ProviderAgentExecutor()
    # await testAgent._ensure_initialized()
    # response = await testAgent.agent.answer_query("Are there any Psychiatrists near me in Boston, MA?")
    # print(response)


    app = Starlette(routes=routes)
    print("Running Search Doctor Agent", HOST, PORT)
    uvicorn.run(app, host=HOST, port=PORT)
    
if __name__ == "__main__":
    main()