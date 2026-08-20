# 04. 一个 HealthResearchAgent 代理服务，用于调用 HealthResearchAgent
import asyncio
import json
import os
import sys
import time

import aisuite
from openai import OpenAI
from tavily import TavilyClient
import uvicorn
from google.adk.a2a.utils.agent_to_a2a import to_a2a
from google.adk.agents import LlmAgent
from google.adk.tools import google_search

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

load_env()

PORT = int(os.environ.get("RESEARCH_AGENT_PORT"))
HOST = os.environ.get("AGENT_HOST")

# research_agent = LlmAgent(
#     # NOTE: This model has been updated since the video was recorded.
#     model="gemini-3.1-pro-preview",
#     name="HealthResearchAgent",
#     tools=[google_search],
#     description="Provides healthcare information about symptoms, health "
#     "conditions, treatments, and procedures using up-to-date web resources.",
#     instruction="""You are a healthcare research agent tasked with 
#     providing information about health conditions. Use the google_search 
#     tool to find information on the web about options, symptoms, treatments, 
#     and procedures. Cite your sources in your responses. Output all of the 
#     information you find.""",
# )
mockdata = [
  {
    "title": "Finding Help | North Carolina Alliance of YMCAs",
    "content": "Mental Health Professionals: If you’re wondering how to ask for mental health help, the answer is to make an appointment with a mental health professional. According to the National Alliance on Mental Illness, millions of people in the U.S. talk to mental health professionals regularly. Don’t be afraid to get the help you need. [...] Federal Resources\n\nPaying for Mental Health Treatment\n\nThe most crucial part of recovering from a mental health issue is receiving adequate care from a qualified doctor or mental health practitioner. Unfortunately, mental health treatments can be costly, and affordable insurance that covers the cost of these treatments is difficult to get in the United States. [...] Substance Abuse and Mental Health Services Administration (SAMSHA): If you, or someone you know, needs help with a substance abuse or mental health disorder, contact SAMHSA’s National Helpline at 1-800-662-HELP (4357) or TTY: 1-800-487-4889, or texting your zip code to 435748 (HELP4U), or using SAMHSA’s Behavioral Health Treatment Services Locator to get help.\n\nCharlotte-Area Resources\n\n### Mental Health Treatment Options\n\nFinding a Mental Health Therapist or Peer Support Group",
    "url": "https://www.ncymcas.org/finding-help"
  },
  {
    "title": "Finding Therapy | Mental Health America",
    "content": "You can use Psychology Today’s Therapy Directory to search for mental health professionals in your area. You can search by zip code, city, last name, etc. For each provider listed, you can read about their therapy approach, specialty areas, information about their fees including whether they accept insurance and whether they offer sliding scale fees, as well as their credentials and contact information. There are a variety of options for sorting your results to find providers who most closely [...] Hero Image\n\nThe following resources can be used to help you find mental health treatment services, including affordable treatment for those without insurance, in your community. [...] who most closely match your needs. You can also send them an initial e-mail.",
    "url": "https://mhanational.org/resources/finding-therapy"
  },
  {
    "title": "Mental Health Counseling | MinuteClinic®",
    "content": "At your first mental health counseling visit, a MinuteClinic licensed therapist will start with an introductory conversation to understand your situation. They can help you with options to help you deal with life’s challenges. Regular counseling sessions include:\n\n   Personalized care planning\n   Ongoing counseling and support to address concerns\n   Connecting and collaborating with specialists if you need a higher level of care\n\n.\n\n### How can I schedule a mental health counseling visit?",
    "url": "https://www.cvs.com/minuteclinic/services/mental-health-counseling"
  },
  {
    "title": "Mental health for all",
    "content": "Call 988 or talk to someone now(external link).\n\n#### When you need support\n\nMental health is an essential part of your healthcare. If mental health or substance is affecting your daily life, contact your doctor. Ask for help including treatments like therapy and medication.\n\nDon’t have a doctor? Find out how to get health insurance through Covered California(external link).\n\nHave coverage and can’t get treatment? Call the Department of Managed Health Care at \n\n1-888-466-2219.",
    "url": "https://www.mentalhealth.ca.gov"
  },
  {
    "title": "Finding a Mental Health Professional",
    "content": "Can you make a direct appointment with a psychiatrist, or do you need to see a primary care doctor first for a referral?\n   How does your plan cover visits to therapists? Therapy coverage can vary greatly between insurance plans.\n   If you need help with a specific condition such as addiction or an eating disorder, ask for doctors with the subspecialty you need. [...] Treatments & Approaches\n           Treatments & Approaches Overview\n           Types of Mental Health Professionals\n           Psychotherapy\n           Getting Treatment During a Crisis\n           Treatment Settings\n           Mental Health Medications\n           Psychosocial Treatments\n           Complementary Health Approaches\n           ECT, TMS and Other Brain Stimulation Therapies [...] Treatments & Approaches\n           Treatments & Approaches Overview\n           Types of Mental Health Professionals\n           Psychotherapy\n           Getting Treatment During a Crisis\n           Treatment Settings\n           Mental Health Medications\n           Psychosocial Treatments\n           Complementary Health Approaches\n           ECT, TMS and Other Brain Stimulation Therapies",
    "url": "https://www.nami.org/living-with-a-mental-health-condition/finding-a-mental-health-professional"
  }
]
class ResearchAgent:
    def __init__(self):
        load_env()

        self.ARK_API_KEY = os.getenv("ARK_API_KEY")
        self.ARK_API_BASE = os.getenv("ARK_API_BASE")
        self.ARK_MODEL_NAME = os.getenv("ARK_MODEL_NAME")

        # self.client = aisuite.Client({
        #     "openai": {
        #         "api_key": self.ARK_API_KEY,
        #         "base_url": self.ARK_API_BASE,
        #     }
        # })

        self.client = OpenAI(
            api_key=self.ARK_API_KEY,
            base_url=self.ARK_API_BASE,
        )

    def tavily_search_tool(self, query: str, max_results: int = 5, include_images: bool = False) -> list[dict[str, str]]:
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY not found in environment variables.")

        client = TavilyClient(api_key=api_key)

        max_retries = 3
        last_error = None
        print('****************** tavily_search_tool fire',query)
        for attempt in range(max_retries):
            try:
                response = client.search(
                    query=query,
                    max_results=max_results,
                    include_images=include_images
                )

                results = []
                for r in response.get("results", []):
                    results.append({
                        "title": r.get("title", ""),
                        "content": r.get("content", ""),
                        "url": r.get("url", "")
                    })

                if include_images:
                    for img_url in response.get("images", []):
                        results.append({"image_url": img_url})

                return results

            except Exception as e:
                last_error = e
                if attempt < max_retries - 1:
                    time.sleep(1.5 * (attempt + 1))  # backoff: 1.5s, 3s
                    continue
        
        return [{"error": str(last_error)}]
        

    def answer_question(self, question: str):
        system_prompt = f"""You are a healthcare research agent tasked with 
        providing information about health conditions. Use the tavily_search_tool
        tool to find information on the web about options, symptoms, treatments, 
        and procedures. Cite your sources in your responses. Output all of the 
        information you find."""
        messages = [{"role": "system", "content": system_prompt }, {"role": "user", "content": question}]
        tools = [{
            "type": "function",
            "function": {
                "name": "tavily_search_tool",
                "description": "Provides healthcare information about symptoms, health, conditions, treatments, and procedures using up-to-date web resources.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"},
                        "max_results": {"type": "integer", "default": 5},
                        "include_images": {"type": "boolean", "default": False}
                    },
                    "required": ["query"]
                }
            }
        }]

        """
        使用 chat.completions.create 实现：
        用户问题 -> LLM -> Tool Call -> 执行 Tool -> LLM -> 最终回答
        """

        while True:
            response = self.client.chat.completions.create(
                model=self.ARK_MODEL_NAME,
                messages=messages,
                tools=tools,
            )
            message = response.choices[0].message
            print("output:", message)
            # 非常重要：
            # 必须先把 assistant 的这条消息加入 messages
            messages.append(message)
            # 没有 tool_calls
            # => 模型已经给出最终答案
            if not message.tool_calls:
                print("research 整个过程完成")
                return message.content
            # 有 tool call
            for tool_call in message.tool_calls:
                print("tool_call:", tool_call)
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                print("function:", function_name)
                print("arguments:", arguments)
                # -----------------------------
                # 执行你的 Tool
                # -----------------------------
                if function_name == "tavily_search_tool":
                    print('************arguments', arguments)
                    query = arguments["query"]
                    results = self.tavily_search_tool(query)
                else:
                    results = {
                        "error": f"Unknown tool: {function_name}"
                    }
                # -----------------------------
                # 把 Tool 结果返回给模型
                # -----------------------------
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(
                        results,
                        ensure_ascii=False
                    )
                })

class ResearchAgentExecutor(AgentExecutor):
    def __init__(self) -> None:
        self.agent = ResearchAgent()

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        prompt = context.get_user_input()
        print("******************* Received prompt:", prompt)
        if not prompt:
            return
        response = await asyncio.to_thread(self.agent.answer_question, prompt)
        print('****************** response fire', response)
        message = new_text_message(text=response)
        await event_queue.enqueue_event(message)

    async def cancel(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        pass



def main() -> None:
    # Make your agent A2A-compatible
    # a2a_app = to_a2a(research_agent, host=HOST, port=PORT)
    skill = AgentSkill(
            id="health_research",
            name="Health research",
            description="Provides information about health conditions, treatments, and procedures.",
            tags=["health", "research"],
            examples=["What is the health conditions of a patient?"],
        )
    
    agent_card = AgentCard(
        name="HealthResearchAgent",
        description="Provides healthcare information about symptoms, health "
        "conditions, treatments, and procedures using up-to-date web resources.",
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
        agent_executor=ResearchAgentExecutor(),
        task_store=InMemoryTaskStore(),
        agent_card=agent_card,
    )

    routes = [
        *create_agent_card_routes(agent_card),
        *create_jsonrpc_routes(request_handler, rpc_url="/"),
    ]

    app = Starlette(routes=routes)
    print("Running Health Research Agent", HOST, PORT)
    uvicorn.run(app, host=HOST, port=PORT)

    
if __name__ == "__main__":
    main()
        