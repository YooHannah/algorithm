# 本脚本 主要用来练习 CopilotKit + A2UI 功能
# 通过启动A2UI可以将声明好的一系列组件打包 成一个组件库 供agent 使用
# agent 可以根据prompt 和问题响应自行利用组件进行组装，生成对应的UI界面
# 这里同样涉及启动agent 服务，增加获取数据的 tool 函数
# 涉及前端改动
# 1. frontend/server CopilotRuntime 需要开启 A2UI 功能 ===> a2ui: { injectA2UITool: true },
# 2. 前端需要引入组件库 frontend/src/catalog 组件声明 + 组件实现 + 导出
# 3. 注册组件库 frontend/src/main.tsx 中 引入 并 指定 a2ui={{ catalog: demonstrationCatalog }}


from __future__ import annotations

import json
import sys
import warnings
import logging; logging.getLogger("langgraph.checkpoint.serde.jsonplus").setLevel(logging.ERROR)

warnings.filterwarnings("ignore")

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from copilotkit import a2ui
from fastapi import FastAPI
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict


CATALOG_ID = "copilotkit://app-dashboard-catalog"
SURFACE_ID = "flight-search-results"

from helper import get_ark_api_key, load_api_keys
from helper import get_ark_api_base
from helper import get_ark_model_name

load_api_keys()


ARK_API_KEY = get_ark_api_key()
ARK_API_BASE = get_ark_api_base()
ARK_MODEL_NAME = get_ark_model_name()

# ── Data-fetching tool (placeholder for a real database/API call) ────
@tool
def get_sales_data() -> str:
    """Fetch current sales metrics and revenue data.

    Returns sales data including revenue, customers, conversion rates,
    and breakdowns by category and month.
    """
    # Placeholder: in production, this would query your actual database or API.
    return json.dumps({
        "totalRevenue": "$1.2M",
        "newCustomers": 3842,
        "conversionRate": "3.6%",
        "revenueByCategory": [
            {"label": "Electronics", "value": 420000},
            {"label": "Clothing", "value": 310000},
            {"label": "Home & Garden", "value": 185000},
            {"label": "Sports", "value": 160000},
            {"label": "Books", "value": 125000},
        ],
        "monthlySales": [
            {"label": "Jan", "value": 85000},
            {"label": "Feb", "value": 92000},
            {"label": "Mar", "value": 108000},
            {"label": "Apr", "value": 95000},
            {"label": "May", "value": 115000},
            {"label": "Jun", "value": 125000},
        ],
    })

FLIGHT_SCHEMA = [
    {"id": "root", "component": "List", "children": {"componentId": "flight-card", "path": "/flights"}, "direction": "horizontal", "gap": 16},
    {"id": "flight-card", "component": "Card", "child": "main-col"},
    {"id": "main-col", "component": "Column", "children": ["airline-img", "header-row", "meta-row", "divider-1", "times-row", "route-row", "divider-2", "status-row", "divider-3", "book-btn"], "align": "stretch", "gap": 8},
    {"id": "airline-img", "component": "Image", "src": {"path": "airlineLogo"}, "alt": {"path": "airline"}, "height": 32},
    {"id": "header-row", "component": "Row", "children": ["airline-name", "price-text"], "justify": "spaceBetween", "align": "center"},
    {"id": "airline-name", "component": "Text", "text": {"path": "airline"}, "variant": "h3"},
    {"id": "price-text", "component": "Text", "text": {"path": "price"}, "variant": "h2"},
    {"id": "meta-row", "component": "Row", "children": ["flight-number", "date-text"], "justify": "spaceBetween", "align": "center"},
    {"id": "flight-number", "component": "Text", "text": {"path": "flightNumber"}, "variant": "caption"},
    {"id": "date-text", "component": "Text", "text": {"path": "date"}, "variant": "caption"},
    {"id": "divider-1", "component": "Divider"},
    {"id": "times-row", "component": "Row", "children": ["depart-time", "duration-text", "arrive-time"], "justify": "spaceBetween", "align": "center"},
    {"id": "depart-time", "component": "Text", "text": {"path": "departureTime"}, "variant": "h2"},
    {"id": "duration-text", "component": "Text", "text": {"path": "duration"}, "variant": "caption"},
    {"id": "arrive-time", "component": "Text", "text": {"path": "arrivalTime"}, "variant": "h2"},
    {"id": "route-row", "component": "Row", "children": ["origin-code", "arrow-text", "dest-code"], "justify": "spaceBetween", "align": "center"},
    {"id": "origin-code", "component": "Text", "text": {"path": "origin"}, "variant": "h3"},
    {"id": "arrow-text", "component": "Text", "text": "\u2192", "variant": "h3"},
    {"id": "dest-code", "component": "Text", "text": {"path": "destination"}, "variant": "h3"},
    {"id": "divider-2", "component": "Divider"},
    {"id": "status-row", "component": "Row", "children": ["status-text"], "align": "center"},
    {"id": "status-text", "component": "Text", "text": {"path": "status"}, "variant": "caption"},
    {"id": "divider-3", "component": "Divider"},
    {"id": "book-btn", "component": "Button", "label": "Book Flight", "variant": "primary", "action": {"event": {"name": "bookFlight"}}},
]
class Flight(TypedDict):
    id: str
    airline: str
    airlineLogo: str
    flightNumber: str
    origin: str
    destination: str
    date: str
    departureTime: str
    arrivalTime: str
    duration: str
    status: str
    price: str
    
# ── Data-fetching tool (placeholder for a real flight search API) ────
@tool
def search_flights(origin: str, destination: str) -> list[Flight]:
    """Search for available flights between two airports.

    Args:
        origin: Origin airport IATA code (e.g. "SFO").
        destination: Destination airport IATA code (e.g. "JFK").
    """
    # Placeholder: in production, this would call a real flight search API.
    return [
        {"id": "1", "airline": "Delta Air Lines", "airlineLogo": f"https://www.gstatic.com/flights/airline_logos/70px/DL.png", "flightNumber": "DL 520", "origin": origin, "destination": destination, "date": "2026-04-11", "departureTime": "08:00", "arrivalTime": "16:35", "duration": "5h 35m", "status": "On Time", "price": "$389"},
        {"id": "2", "airline": "United Airlines", "airlineLogo": f"https://www.gstatic.com/flights/airline_logos/70px/UA.png", "flightNumber": "UA 1583", "origin": origin, "destination": destination, "date": "2026-04-11", "departureTime": "10:15", "arrivalTime": "18:42", "duration": "5h 27m", "status": "On Time", "price": "$412"},
        {"id": "3", "airline": "JetBlue", "airlineLogo": f"https://www.gstatic.com/flights/airline_logos/70px/B6.png", "flightNumber": "B6 416", "origin": origin, "destination": destination, "date": "2026-04-11", "departureTime": "14:30", "arrivalTime": "23:05", "duration": "5h 35m", "status": "On Time", "price": "$345"},
        {"id": "4", "airline": "American Airlines", "airlineLogo": f"https://www.gstatic.com/flights/airline_logos/70px/AA.png", "flightNumber": "AA 178", "origin": origin, "destination": destination, "date": "2026-04-11", "departureTime": "17:00", "arrivalTime": "01:20+1", "duration": "5h 20m", "status": "On Time", "price": "$398"},
    ]

@tool
def display_flights(flights: list[Flight]) -> str:
    """Display flights as rich cards in a horizontal row.

    Each flight must have: id, airline, airlineLogo (URL), flightNumber,
    origin, destination, date, departureTime, arrivalTime, duration,
    status, and price.
    """
    return a2ui.render(
        operations=[
            a2ui.create_surface(SURFACE_ID, catalog_id=CATALOG_ID),
            a2ui.update_components(SURFACE_ID, FLIGHT_SCHEMA),
            a2ui.update_data_model(SURFACE_ID, {"flights": flights}),
        ],
    )
def _build_graph():
    return create_agent(
        model=ChatOpenAI(
            # model="gpt-4.1"
            openai_api_key=ARK_API_KEY,
                openai_api_base=ARK_API_BASE,
                model_name=ARK_MODEL_NAME, # 从环境变量读取模型
            ),
        tools=[get_sales_data, search_flights, display_flights], # 添加数据获取工具
        middleware=[CopilotKitMiddleware()],
        checkpointer=MemorySaver(),
        # system_prompt=("You are a helpful assistant"),
        system_prompt=(
            # "You are a helpful assistant that creates rich visual UI.\n\n"
            # "Tool guidance:\n"
            # "- For sales/business data requests: first call get_sales_data to fetch "
            # "the latest metrics, then call generate_a2ui to visualize the results "
            # "as a dashboard with charts, metrics, and cards.\n"
            # "- For other rich UI: call generate_a2ui directly.\n\n"
            # "IMPORTANT: After calling a tool, do NOT repeat or summarize the data "
            # "in your text response. The tool renders UI automatically. "
            # "Just confirm what was rendered."
            "You are a helpful assistant that creates rich visual UI.\n\n"
            "Tool guidance:\n"
            "- ALL flight-related queries: first call search_flights to fetch flight "
            "data, then call display_flights with the results. NEVER use generate_a2ui "
            "for flights.\n"
            "- For sales/business data requests: first call get_sales_data to fetch "
            "the latest metrics, then call generate_a2ui to visualize the results.\n"
            "- For other rich UI: call generate_a2ui directly.\n\n"
            "Airline logos: use https://www.gstatic.com/flights/airline_logos/70px/<IATA>.png\n"
            "Common codes: DL=Delta, UA=United, AA=American, WN=Southwest, B6=JetBlue, "
            "NK=Spirit, AS=Alaska, F9=Frontier, BA=British Airways, LH=Lufthansa, "
            "AF=Air France, EK=Emirates, QF=Qantas, SQ=Singapore Airlines, NH=ANA.\n\n"
            "IMPORTANT: After calling a tool, do NOT repeat or summarize the data "
            "in your text response. The tool renders UI automatically. "
            "Just confirm what was rendered."
        ),
    )


def start_backend(port: int = 8004) -> None:
    from helper import start_server
    # 启动agent 服务
    app = FastAPI()
    graph = _build_graph()
    agent = LangGraphAGUIAgent(
        name="lesson4_agent",
        description="Lesson 4 A2UI agent",
        graph= graph,
    )
    add_langgraph_fastapi_endpoint(app=app, agent=agent, path="/")
    start_server(app, port=port)

# 执行python ark_server.py 启动 Ark 服务
start_backend(port=8004)

import time
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    print("\n\n🛑 服务已停止")
    import sys
    sys.exit(0)

