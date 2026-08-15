# - Integrate all memory types (conversational, semantic, workflow, entity, summary, tool logs) into a unified agent
# - Implement context window management with automatic summarization
# - Build an agent loop that retrieves relevant context before each response
# - Use Just-In-Time (JIT) retrieval to expand summaries on demand

# **Key Concepts**

# | Concept | Description |
# |---------|-------------|
# | **Memory Aware Agent** | An agent that reads from and writes to persistent memory stores during execution |
# | **Context Engineering** | Dynamically building the optimal context window for each query |
# | **Just-In-Time Retrieval** | Fetching detailed information only when the agent needs it |
# | **Automatic Summarization** | Compressing context when usage exceeds thresholds |


rom helper import suppress_warnings

# Warning control
suppress_warnings()

from helper import load_env, setup_oracle_database, connect_to_oracle

load_env()

# One-time admin setup: configures tablespace, vector memory, and VECTOR user
setup_oracle_database()

# Connect as the VECTOR user for all subsequent operations
database_connection = connect_to_oracle(
    user="VECTOR",
    password="VectorPwd_2025",
    dsn="127.0.0.1:1521/FREEPDB1",
    program="devrel.deeplearning.course_1",
)

print("Using user:", database_connection.username)

from openai import OpenAI
from langchain_community.embeddings import HuggingFaceEmbeddings

client = OpenAI()

# Initialize the embedding model
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-mpnet-base-v2"
)

# Table names for each memory type
CONVERSATIONAL_TABLE = "CONVERSATIONAL_MEMORY"
KNOWLEDGE_BASE_TABLE = "SEMANTIC_MEMORY"
WORKFLOW_TABLE = "WORKFLOW_MEMORY"
TOOLBOX_TABLE = "TOOLBOX_MEMORY"
ENTITY_TABLE = "ENTITY_MEMORY"
SUMMARY_TABLE = "SUMMARY_MEMORY"
TOOL_LOG_TABLE = "TOOL_LOG_MEMORY"


ALL_TABLES = [
    CONVERSATIONAL_TABLE,
    KNOWLEDGE_BASE_TABLE,
    WORKFLOW_TABLE,
    TOOLBOX_TABLE,
    ENTITY_TABLE,
    SUMMARY_TABLE,
    TOOL_LOG_TABLE]

# Drop existing tables to start fresh
for table in ALL_TABLES:
    try:
        with database_connection.cursor() as cur:
            cur.execute(f"DROP TABLE {table} PURGE")
            print(f"  - {table} (dropped)")
    except Exception as e:
        if "ORA-00942" in str(e):
            print(f"  - {table} (not exists)")
        else:
            print(f"  ✗ {table}: {e}")

database_connection.commit()

# Create or retrieve the conversational history table
from helper import create_conversational_history_table, create_tool_log_table

CONVERSATION_HISTORY_TABLE = create_conversational_history_table(database_connection, CONVERSATIONAL_TABLE)
TOOL_LOG_HISTORY_TABLE = create_tool_log_table(database_connection, TOOL_LOG_TABLE)

from langchain_oracledb.vectorstores import OracleVS
from langchain_community.vectorstores.utils import DistanceStrategy
from helper import StoreManager

# Create StoreManager instance
store_manager = StoreManager(
    client=database_connection,
    embedding_function=embedding_model,
    table_names={
        'knowledge_base': KNOWLEDGE_BASE_TABLE,
        'workflow': WORKFLOW_TABLE,
        'toolbox': TOOLBOX_TABLE,
        'entity': ENTITY_TABLE,
        'summary': SUMMARY_TABLE,
    },
    distance_strategy=DistanceStrategy.COSINE,
    conversational_table=CONVERSATION_HISTORY_TABLE,
    tool_log_table=TOOL_LOG_HISTORY_TABLE,
)

# Get all stores via the manager
conversation_table = store_manager.get_conversational_table()
knowledge_base_vs = store_manager.get_knowledge_base_store()
workflow_vs = store_manager.get_workflow_store()
toolbox_vs = store_manager.get_toolbox_store()
entity_vs = store_manager.get_entity_store()
summary_vs = store_manager.get_summary_store()
tool_log_table = store_manager.get_tool_log_table()

print("✅ All stores loaded via StoreManager")

from helper import MemoryManager, Toolbox, register_common_tools

# Initialize the MemoryManager instance
memory_manager = MemoryManager(
    conn=database_connection,
    conversation_table=conversation_table,
    knowledge_base_vs=knowledge_base_vs,
    workflow_vs=workflow_vs,
    toolbox_vs=toolbox_vs,
    entity_vs=entity_vs,
    summary_vs=summary_vs,
    tool_log_table=TOOL_LOG_HISTORY_TABLE
)

# Initialize Toolbox with embedding function
toolbox = Toolbox(memory_manager, client, embedding_model)

# Register common tools (arxiv search, paper fetch, etc.)
common_tools = register_common_tools(toolbox, memory_manager, KNOWLEDGE_BASE_TABLE)

print("✅ MemoryManager and Toolbox initialized")

# ----------------------- Context Engineering Techniques ------------------------

# | Step | Function | Purpose |
# |------|----------|---------|
# | **1. Calculate Usage** | `calculate_context_usage()` | Monitor what % of the context window is used |
# | **2. Summarize** | `summarise_context_window()` | Compress long content into summaries using LLM |
# | **3. Offload** | `offload_to_summary()` | Auto-trigger summarization when usage exceeds threshold |
# | **4. Just-in-Time Retrieval** | `expand_summary()` tool | Let agent expand summaries on demand |

# **`Just-In-Time (JIT)`** retrieval is the process of fetching only the information needed at the exact moment the agent requires it, based on the current task, query, or reasoning step. Instead of loading pre-computed or pre-cached context upfront, the system dynamically retrieves the minimal, most relevant data on demand, ensuring efficiency and reducing context overload. In the context of agent memory JIT is a retrieval-control strategy where memory access is triggered by the agent’s current goal, query, or reasoning step. Rather than preloading large histories or the full knowledge base, the system dynamically filters, ranks, and injects only the information that materially influences the next token. This reduces context saturation, improves attention allocation, and increases reasoning fidelity.

# Import context window management functions from helper
# Summary tools are now loaded through register_common_tools in Part 1.
from helper import (
    calculate_context_usage,
    monitor_context_window,
    summarise_context_window,
    offload_to_summary,
    summarize_conversation,
)

print("✅ Context management functions loaded from helper.py")

# ---------------------------------------- Part 3: The Memory-Aware Agent Loop ------------------------------

# This is where everything comes together. The agent loop orchestrates memory operations at each step:

# ```
# User Query
#     ↓
# 1. BUILD CONTEXT — Read from all memory stores
#     ↓
# 2. CHECK USAGE — Monitor token count, summarize if >80%
#     ↓
# 3. SELECT TOOLS — Semantic search for relevant tools
#     ↓
# 4. EXECUTE — LLM reasoning + tool calls
#     ↓
# 5. PERSIST — Save conversation, workflow, entities
#     ↓
# Final Answer
# ```


import json as json_lib

AGENT_SYSTEM_PROMPT = """
# Role
You are a memory-aware agentic research assistant with access to tools.

# Context Window Structure (Partitioned Segments)
The user input is a partitioned context window. It contains a `# Question` section followed by memory segments.
Treat each segment as a distinct memory store with a specific purpose:
- `## Conversation Memory`
- `## Knowledge Base Memory`
- `## Workflow Memory`
- `## Entity Memory`
- `## Summary Memory`

# Memory Store Semantics
- Conversation Memory: Recent thread-level dialogue and instructions. Use it for continuity, user preferences, and unresolved requests.
- Knowledge Base Memory: Retrieved documents/passages. Use it to ground factual and technical claims.
- Workflow Memory: Prior execution patterns and step sequences. Use it to plan tool usage; adapt patterns, do not copy blindly.
- Entity Memory: Named people/orgs/systems and descriptors. Use it to disambiguate references and keep naming consistent.
- Summary Memory: Compressed older context represented by summary IDs. When thread-scoped summaries exist, prefer summaries for the active thread_id.

# Summary Expansion Policy
If critical detail is only present in Summary Memory or appears ambiguous, call `expand_summary(summary_id)` before relying on it.

# Operating Rules
1. Start with the provided memory segments before using tools.
2. If segments conflict, prioritize: current `# Question` > latest Conversation Memory > Knowledge Base evidence > older summaries/workflows.
3. Use only the tools provided in this turn and choose the minimum necessary tool calls.
4. If memory is insufficient, state what is missing and then use an appropriate tool.
5. For conversation compaction, use `summarize_and_store` with `thread_id` so source conversation units are marked as summarized.
"""


def execute_tool(tool_name: str, tool_args: dict, current_thread_id: str | None = None) -> str:
    """Execute a tool by looking it up in the toolbox."""

    if tool_name not in toolbox._tools_by_name:
        return f"Error: Tool '{tool_name}' not found"

    args = dict(tool_args or {})

    # Ensure conversation summarization marks source rows in the active thread.
    if tool_name == "summarize_and_store" and "thread_id" not in args and current_thread_id is not None:
        args["thread_id"] = str(current_thread_id)

    return str(toolbox._tools_by_name[tool_name](**args) or "Done")

# ==================== OPENAI CHAT FUNCTION ====================
def call_openai_chat(messages: list, tools: list = None, model: str = "gpt-5-mini"):
    """Call OpenAI Chat Completions API with tools."""
    kwargs = {"model": model, "messages": messages}
    if tools:
        kwargs["tools"] = tools
        kwargs["tool_choice"] = "auto"
    return client.chat.completions.create(**kwargs)


## Agent Loop: End-to-End Execution Flow

# `call_agent()` is the orchestration layer that turns memory + tools into a reliable multi-step agent run.

# 1. **Build a partitioned context window**  
#    The function pulls memory segments in order: Conversation, Knowledge Base, Workflow, Entity, and Summary.  
#    This gives the model a structured, role-specific context instead of one mixed block.

# 2. **Protect context budget before reasoning**  
#    Token usage is measured with `calculate_context_usage()`.  
#    If usage is above 80%, `offload_to_summary()` compresses conversation-heavy content into Summary Memory and keeps summary references.

# 3. **Retrieve only relevant tools**  
#    Toolbox memory is searched semantically (`read_toolbox(query, k=5)`), so the model sees a focused toolset for this query.

# 4. **Run iterative LLM-tool execution**  
#    The model can issue tool calls, each tool runs, and the result is returned to the model through `role="tool"` messages.  
#    Full raw tool outputs are persisted to `TOOL_LOG_MEMORY` for audit and later retrieval.

# 5. **Control tool-output bloat in prompt context**  
#    The next LLM turn receives only the immediate tool result (truncated when very large), while the complete payload remains in the database.

# 6. **Persist learning artifacts**  
#    At the end, the loop writes conversational turns, workflow steps, and extracted entities so future runs can reuse this execution history.

# ==================== MAIN AGENT LOOP ====================
def call_agent(query: str, thread_id: str = "1", max_iterations: int = 10) -> str:
    """Agent loop with context window monitoring and summarization."""
    thread_id = str(thread_id)
    steps = []
    summaries = []  # Track created summaries
    
    # 1. Build context from memory
    print("\n" + "="*50)
    print("🧠 BUILDING CONTEXT...")
    
    # Build memory context (excluding query for now)
    memory_context = ""
    memory_context += memory_manager.read_conversational_memory(thread_id) + "\n\n"
    memory_context += memory_manager.read_knowledge_base(query) + "\n\n"
    memory_context += memory_manager.read_workflow(query) + "\n\n"
    memory_context += memory_manager.read_entity(query) + "\n\n"
    memory_context += memory_manager.read_summary_context(query, thread_id=thread_id) + "\n\n"  # Shows IDs + descriptions (thread-scoped when available)
    
    # 2. Check context usage - summarize if >80%
    usage = calculate_context_usage(memory_context)
    print(f"📊 Context: {usage['percent']}% ({usage['tokens']}/{usage['max']} tokens)")
    
    if usage['percent'] > 80:
        print("⚠️ Context >80% - offloading conversation context to summary memory...")
        memory_context, summaries = offload_to_summary(
            memory_context,
            memory_manager,
            client,
            thread_id=thread_id,
        )
        if summaries:
            print(f"🧾 Created {len(summaries)} summary reference(s): {[s['id'] for s in summaries]}")
        usage = calculate_context_usage(memory_context)
        print(f"📊 After offload: {usage['percent']}% ({usage['tokens']}/{usage['max']} tokens)")
    
    # Now prepend the query (always preserved, never summarized)
    context = f"# Question\n{query}\n\n{memory_context}"

    print("====CONTEXT WINDOW=====\n")
    print(context)
    
    # 3. Get tools
    dynamic_tools = memory_manager.read_toolbox(query, k=5)
    print(f"🔧 Tools: {[t['function']['name'] for t in dynamic_tools]}")
    
    # 4. Store user message & extract entities
    memory_manager.write_conversational_memory(query, "user", thread_id)
    try:
        memory_manager.write_entity("", "", "", llm_client=client, text=query)
    except Exception:
        pass
    
    # 5. Agent loop
    messages = [{"role": "system", "content": AGENT_SYSTEM_PROMPT}, {"role": "user", "content": context}]
    final_answer = ""
    
    print("\n🤖 AGENT LOOP")
    for iteration in range(max_iterations):
        print(f"\n--- Iteration {iteration + 1} ---")
        
        response = call_openai_chat(messages, tools=dynamic_tools)
        msg = response.choices[0].message
        
        if msg.tool_calls:
            messages.append({"role": "assistant", "content": msg.content or "", "tool_calls": [
                {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in msg.tool_calls
            ]})
            
            for tc in msg.tool_calls:
                tool_name = tc.function.name
                tool_args = json_lib.loads(tc.function.arguments)
                # Format args for display (truncate long values)
                args_display = {k: (v[:50] + '...' if isinstance(v, str) and len(v) > 50 else v) 
                               for k, v in tool_args.items()}
                print(f"🛠️ {tool_name}({args_display})")
                
                try:
                    result = execute_tool(tool_name, tool_args, current_thread_id=thread_id)
                    status = "success"
                    error_message = None
                    steps.append(f"{tool_name}({args_display}) → success")
                except Exception as e:
                    result = f"Error: {e}"
                    status = "failed"
                    error_message = str(e)
                    steps.append(f"{tool_name}({args_display}) → failed")

                # Persist full tool output to TOOL_LOG_MEMORY
                log_id = memory_manager.write_tool_log(
                    thread_id=thread_id,
                    tool_call_id=tc.id,
                    tool_name=tool_name,
                    tool_args=tool_args,
                    result=result,
                    status=status,
                    error_message=error_message,
                    metadata={"iteration": iteration + 1},
                )

                # Next call gets only the immediate tool result (bounded for context control)
                if len(result) > 3000:
                    result_for_llm = result[:3000] + f"\n\n[Truncated for context. Full output saved in TOOL_LOG_MEMORY as log_id: {log_id}]"
                else:
                    result_for_llm = result

                result_display = result_for_llm[:200] + "..." if len(result_for_llm) > 200 else result_for_llm
                print(f"   → {result_display}")
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": result_for_llm})
        else:
            final_answer = msg.content or ""
            print(f"\n✅ DONE ({len(steps)} tool calls)")
            break
    else:
        # Max iterations reached without final answer
        print(f"\n⚠️ WARNING: Max iterations ({max_iterations}) reached without final answer")
        final_answer = "I was unable to complete the request within the allowed iterations."
    
    # 6. Save workflow & entities
    if steps:
        memory_manager.write_workflow(query, steps, final_answer)
    try:
        memory_manager.write_entity("", "", "", llm_client=client, text=final_answer)
    except Exception:
        pass
    memory_manager.write_conversational_memory(final_answer, "assistant", thread_id)
    
    print("\n" + "="*50 + f"\n💬 ANSWER:\n{final_answer}\n" + "="*50)
    return final_answer



# test

call_agent("Can you get me the paper MemGPT", thread_id="50000")

call_agent("Can you save the content of the paper", thread_id="50000")

call_agent("What are the main key takeaways from the paper", thread_id="50000")

call_agent("Summarize the converstation so far using your tool", thread_id="50000")

call_agent("What was my first question?", thread_id="50000")