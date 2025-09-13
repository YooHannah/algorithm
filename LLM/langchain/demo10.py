# 先定义一些工具：Tools

# pip install google-search-results
# pip install --upgrade langchainhub
from langchain_community.utilities import SerpAPIWrapper
from langchain.tools import Tool, tool
import calendar
import dateutil.parser as parser
from datetime import date

from langchain import hub
import re

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent


from langchain.agents import create_self_ask_with_search_agent
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

search = SerpAPIWrapper()
tools = [
    Tool.from_function(
        func=search.run,
        name="Search",
        description="useful for when you need to answer questions about current events"
    ),
]

# 自定义工具


@tool("weekday")
def weekday(date_str: str) -> str:
    """Convert date to weekday name"""
    print(f'date_str:{date_str}')
    date_match = re.search(r'\d{4}-\d{1,2}-\d{1,2}', date_string)
    if date_match:
        date_only = date_match.group(0)
        try:
            parsed_date = parser.parse(date_only)
            print(f"Parsed date: {parsed_date}")
            return calendar.day_name[parsed_date.weekday()]
        except Exception as e:
            print(f"Error parsing date: {e}")
            return date_str
    else:
        print("No valid date found in the string.")
        return date_str


tools += [weekday]

# test 1 智能体类型：ReAct

# 下载一个现有的 Prompt 模板
# react_prompt = hub.pull("hwchase17/react")

# print('react_prompt')
# print(react_prompt.template)


llm = ChatOpenAI(model_name='gpt-3.5-turbo', temperature=0, seed=23)

# # 定义一个 agent: 需要大模型、工具集、和 Prompt 模板
# agent = create_react_agent(llm, tools, react_prompt)
# # 定义一个执行器：需要 agent 对象 和 工具集
# agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# # 执行
# agent_executorRes = agent_executor.invoke({"input": "2024年周杰伦的演唱会星期几"})

# print(f'打印结果1：{agent_executorRes}')

# test 2智能体类型：SelfAskWithSearch

# 下载一个模板
self_ask_prompt = hub.pull("hwchase17/self-ask-with-search")

print(self_ask_prompt.template)

tools = [
    Tool(
        name="Intermediate Answer",
        func=search.run,
        description="搜素引擎",
        max_results=1
    )
]

# self_ask_with_search_agent 只能传一个名为 'Intermediate Answer' 的 tool
agent = create_self_ask_with_search_agent(llm, tools, self_ask_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

agent_executorRes = agent_executor.invoke({"input": "西游记的作者是谁"})

print(f'打印结果2：{agent_executorRes}')
