from beeai_framework.adapters.a2a.agents import A2AAgent
from beeai_framework.memory import UnconstrainedMemory
import asyncio
from a2a_healthcare_agent import ConciseGlobalTrajectoryMiddleware
async def main() -> None:
    agent = A2AAgent(url="http://127.0.0.1:9996", 
                 memory=UnconstrainedMemory())
    response = await agent.run(
        "I'm based in Austin, TX. How do I get mental health therapy near me and what does my insurance cover?"
    ).middleware(ConciseGlobalTrajectoryMiddleware())


if __name__ == "__main__":
    asyncio.run(main())
