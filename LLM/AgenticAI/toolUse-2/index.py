# ================================
# Imports
# ================================

# workflow 中多tool 组合使用
# 这个脚本将一个邮件后端的curd接口 分别封装为不同的tool 注册到llm 中 针对不同操作，llm 可以调用不同的tool 来完成任务。

# --- Third-party ---
import os

from dotenv import load_dotenv
import aisuite as ai
import json

# --- Local / project ---
import utils
import display_functions
import email_tools

# ================================
# Environment & Client
# ================================
load_dotenv()          # Load environment variables from .env
client = ai.Client()   # Initialize AISuite client

# --------------To test the endpoints -----------------
# uncomment the lines you’d like to try out, run the cell, and check the results instantly.
# uncomment the line 'utils.test_*' you want to try
new_email_id = utils.test_send_email()
_ = utils.test_get_email(new_email_id['id'])
#_ = utils.test_list_emails()
#_ = utils.test_filter_emails(recipient="test@example.com")
#_ = utils.test_search_emails("lunch")
#_ = utils.test_unread_emails()
#_ = utils.test_mark_read(new_email_id['id'])
#_ = utils.test_mark_unread(new_email_id['id'])
#_ = utils.test_delete_email(new_email_id['id'])
#_ = utils.reset_database()

# ---------------- Test sending a new email and fetch it by ID ----------------
new_email = email_tools.send_email("test@example.com", "Lunch plans", "Shall we meet at noon?")
content_ = email_tools.get_email(new_email['id'])

# Uncomment the ones you want to try:
#content_ = email_tools.list_all_emails()
#content_ = email_tools.list_unread_emails()
#content_ = email_tools.search_emails("lunch")
#content_ = email_tools.filter_emails(recipient="test@example.com")
#content_ = email_tools.mark_email_as_read(new_email['id'])
#content_ = email_tools.mark_email_as_unread(new_email['id'])
#content_ = email_tools.search_unread_from_sender("test@example.com")
#content_ = email_tools.delete_email(new_email['id'])

utils.print_html(content=json.dumps(content_, indent=2), title="Testing the email_tools")


def build_prompt(request_: str) -> str:
    return f"""
- You are an AI assistant specialized in managing emails.
- You can perform various actions such as listing, searching, filtering, and manipulating emails.
- Use the provided tools to interact with the email system.
- Never ask the user for confirmation before performing an action.
- If needed, my email address is "you@email.com" so you can use it to send emails or perform actions related to my account.

{request_.strip()}
"""
# test
example_prompt = build_prompt("Delete the Happy Hour email")
utils.print_html(content=example_prompt, title="Example example_prompt")

# Reset the database
utils.reset_database()


# Try your own requests
prompt_ = build_prompt("Check for unread emails from boss@email.com, mark them as read, and send a polite follow-up.")

response = client.chat.completions.create(
    model="openai:" + ARK_MODEL_NAME, # LLM
    messages=[{"role": "user", "content": (
        prompt_
    )}],
    tools=[ # list of tools that the LLM can access
        email_tools.search_unread_from_sender,
        email_tools.list_unread_emails,
        email_tools.search_emails,
        email_tools.get_email,
        email_tools.mark_email_as_read,
        email_tools.send_email
    ],
    max_turns=5,
)

display_functions.pretty_print_chat_completion(response)

# the tools you make available directly determine what the agent can do.
# 上面没有delete email tool 所以 不能删除邮件


prompt_ = build_prompt("Delete the happy hour email")

response = client.chat.completions.create(
    model="openai:" + ARK_MODEL_NAME, # LLM
    messages=[{"role": "user", "content": (
        prompt_
    )}],
    tools=[
        email_tools.search_unread_from_sender,
        email_tools.list_unread_emails,
        email_tools.search_emails,
        email_tools.get_email,
        email_tools.mark_email_as_read,
        email_tools.send_email,
        email_tools.delete_email
    ],
    max_turns=5
)

display_functions.pretty_print_chat_completion(response)