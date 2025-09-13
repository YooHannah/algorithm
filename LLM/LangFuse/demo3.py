# <!-- 用 Session 记录一个用户的多轮对话 -->

# SESSION (id: session_id)
# |
# |-- TRACE
# |-- TRACE
# |-- TRACE
# |-- ...

from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    AIMessage,  # 等价于OpenAI接口中的assistant role
    HumanMessage,  # 等价于OpenAI接口中的user role
    SystemMessage  # 等价于OpenAI接口中的system role
)
from datetime import datetime
from langfuse.decorators import langfuse_context, observe


from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

now = datetime.now()

llm = ChatOpenAI(model="gpt-3.5-turbo")

messages = [
    SystemMessage(content="你是LLM专家。"),
]

@observe()
def chat_one_turn(user_input, user_id, turn_id):
    langfuse_context.update_current_trace(
        name=f"ChatTurn{turn_id}",
        user_id=user_id,
        session_id="chat-"+now.strftime("%d/%m/%Y %H:%M:%S") # 这个session_id是用来区分同一个用户的多轮对话的
    )
    langfuse_handler = langfuse_context.get_current_langchain_handler()
    messages.append(HumanMessage(content=user_input))
    response = llm.invoke(messages, config={"callbacks": [langfuse_handler]})
    messages.append(response)
    return response.content   

user_id="lyh"
turn_id = 0
while True:
    user_input = input("User: ")
    if user_input.strip() == "":
        break
    reply = chat_one_turn(user_input, user_id, turn_id)
    print("AI reply: "+reply)
    turn_id += 1