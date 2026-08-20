
import asyncio
import os
from agent_framework.a2a import A2AAgent
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from helper import load_env

load_env()
async def main() -> None:
    host = os.environ.get("AGENT_HOST")
    port = os.environ.get("PROVIDER_AGENT_PORT")
    base_url = f"http://{host}:{port}"

    # Create A2A agent with direct URL configuration
    healthcare_provider_agent = A2AAgent(
        name="HealthcareProviderAgent",
        url=base_url,
    )

    prompt = "I'm based in Austin, TX. Are there any Psychiatrists near me?"
    print('start')
    result = await healthcare_provider_agent.run(prompt)
    print(result)

if __name__ == "__main__":
    asyncio.run(main())