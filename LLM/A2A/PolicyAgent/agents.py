# 01 一个直接调用llm 的 agent
import base64
import json
import os
from pathlib import Path
import sys
from openai import OpenAI

from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from helper import load_env


system_prompt = """You are an expert insurance agent designed to assist with 
    coverage queries. Use the provided documents to answer questions 
    about insurance policies. If the information is not available in 
    the documents, respond with 'I don't know'"""

# 封装成一个class PolicyAgent，包含一个方法ask，用于查询保险政策
class PolicyAgent:
    def __init__(self):
        load_env()

        self.ARK_API_KEY = os.getenv("ARK_API_KEY")
        self.ARK_API_BASE = os.getenv("ARK_API_BASE")
        self.ARK_MODEL_NAME = os.getenv("ARK_MODEL_NAME")

        self.client = OpenAI(
            api_key=self.ARK_API_KEY,
            base_url=self.ARK_API_BASE,
        )

        with Path("2026AnthemgHIPSBC.pdf").open("rb") as file:
            self.pdf_data = base64.standard_b64encode(file.read()).decode("utf-8")
    def answer_question(self, question: str) -> str:
        print("Running Health Insurance Policy Agent")
        response = self.client.responses.create(
            model=self.ARK_MODEL_NAME,
            input=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_file",
                            "file_data": f"data:application/pdf;base64,{self.pdf_data}",
                            "filename": "2026AnthemgHIPSBC.pdf",
                        },
                        {
                            "type": "input_text",
                            "text": question,
                        }
                    ]
                }
            ]
        )
        # print(json.dumps(response.model_dump(), indent=2, ensure_ascii=False, default=str))
        print("Health Insurance Policy Agent Finished")
        for item in response.output:
            if item.type == "message":
                return item.content[0].text
        return ""


prompt = "How much would I pay for mental health therapy?"
agent = PolicyAgent()
response = agent.answer_question(prompt)
print(response)
