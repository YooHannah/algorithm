# 03. 一个 A2A 客户端，用于调用 A2A 代理
# 实现client ---> A2A 代理服务 ---> PolicyAgent 的链路调用
import asyncio
import os
import sys

import httpx

from a2a.client import (
    ClientConfig,
    create_client,
    A2ACardResolver,
)
from a2a.helpers import new_text_message, get_message_text
from a2a.types import Role, SendMessageRequest

from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from helper import load_env

load_env()

host = os.environ.get("AGENT_HOST", "localhost")
port = os.environ.get("POLICY_AGENT_PORT", "9999")

prompt = "How much would I pay for mental health therapy?"


async def main() -> None:
    async with httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=30.0)) as httpx_client:
        resolver = A2ACardResolver(
            httpx_client=httpx_client,
            base_url=f"http://{host}:{port}",
        )
        agent_card = await resolver.get_agent_card()

        print("Agent Card:")
        print(agent_card)

        config = ClientConfig(
            streaming=False,
            httpx_client=httpx_client,
        )
        client = await create_client(agent=agent_card, client_config=config)
        print("Client initialized. Sending message...\n")

        message = new_text_message(text=prompt, role=Role.ROLE_USER)
        request = SendMessageRequest(message=message)

        text_content = ""
        async for stream_response in client.send_message(request):
            print('stream_response', stream_response)
            if stream_response.HasField("message"):
                msg = stream_response.message
                text_content = get_message_text(msg)
                print("[Received final message]")
            elif stream_response.HasField("task"):
                task = stream_response.task
                state_name = task.status.State.Name(task.status.state)
                print(f"[Task] id={task.id} state={state_name}")
                if task.artifacts:
                    from a2a.helpers import get_artifact_text
                    text_content = get_artifact_text(task.artifacts[0])
            elif stream_response.HasField("status_update"):
                status = stream_response.status_update.status
                state_name = status.State.Name(status.state)
                print(f"[Status Update] state={state_name}")

        await client.close()

        print("\n" + "=" * 60)
        print("Final Agent Response:")
        print("-" * 60)
        if text_content:
            print(text_content)
        else:
            print("(No text content received)")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
