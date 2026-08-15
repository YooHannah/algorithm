from helper import suppress_warnings

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

from langchain_community.embeddings import HuggingFaceEmbeddings
# Initialize the embedding model
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-mpnet-base-v2"
)

from openai import OpenAI

client = OpenAI()

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

# ------------------------------- Initialize Memory Orchestration + Toolbox Instance --------------------------------

from helper import MemoryManager, Toolbox

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

# Initialize Toolbox
toolbox = Toolbox(memory_manager, client, embedding_model)

print("✅ MemoryManager and Toolbox initialized")


### Tools Overview

# The following tools are created and registered with the Toolbox in this lesson:

# | Tool | Purpose |
# |------|---------|
# | `search_tavily` | Searches the web using Tavily API and persists results to the knowledge base for future retrieval |
# | `get_current_time` | Returns the current date and time (with optional detailed format including microseconds) |
# | `arxiv_search_candidates` | Searches arXiv for papers matching a query and returns metadata (IDs, titles, authors, abstracts) |
# | `fetch_and_save_paper_to_kb_db` | Downloads an arXiv paper PDF, extracts text, chunks it, and stores in the knowledge base |

# Each tool is registered using `@toolbox.register_tool()` which stores its embedding for semantic retrieval. When the agent receives a query, only the most relevant tools are retrieved and passed to the LLM.


# 将工具箱检索功能同时作为程序化操作和代理可调用的技能公开。这使得代理能够在执行过程中，当需要超出初始提供的功能时，自主查询工具。

@toolbox.register_tool(augment=True)
def read_toolbox(query: str, k: int = 3) -> list[str]:
    """
    Search the toolbox for functions that can help solve a problem or complete a task.
    
    Use this tool when:
    - You encounter an error or unexpected output and need a different approach
    - The currently available tools don't seem sufficient for the task
    - You need to discover what capabilities are available for a specific problem
    - You want to find alternative functions that might handle edge cases better
    
    Args:
        query: A natural language description of what you're trying to accomplish
               or the problem you're trying to solve. Be specific about the task
               or error you're encountering for better results.
        k: Number of relevant tools to return (default: 5)
    
    Returns:
        A list of tool definitions that semantically match your query,
        including their names, descriptions, and parameter schemas.
    
    Example queries:
        - "search for academic papers on machine learning"
        - "fetch and store document content"
        - "get the current date and time"
        - "summarize long text and save to memory"
    """
    return memory_manager.read_toolbox(query, k=k)

# Web Access with Tavily
# tavily 进行网络搜索
# this section demonstrates how to create an **agentic tool** that the LLM can call to search the web. 

# We use [Tavily](https://tavily.com/), an AI-optimized search API designed for LLM applications.

# What This Section Does

# 1. **Initialize the Tavily client** — Set up the search API with an API key
# 2. **Register `search_tavily` as a tool** — Use `@toolbox.register_tool(augment=True)` to make it discoverable
# 3. **Implement the search-and-store pattern** — Results are automatically written to knowledge base memory
# 4. **Test tool retrieval** — Verify the tool can be found via semantic search


# ### The Search-and-Store Pattern

# One thing to note is that not only do we get external context that is not available to the Agent at execution, but we persists this to the knowledge base memory and the Agent can reuse this information in subsequent iteration.
# When the agent calls `search_tavily()`, it doesn't just return results—it **persists them to the knowledge base**:

# ```
# Agent calls search_tavily("latest AI news")
#        ↓
# Tavily API returns results
#        ↓
# Each result is written to knowledge_base_vs with metadata (title, URL, timestamp)
#        ↓
# Future queries can retrieve this information without searching again
# ```

# This pattern means the agent **learns** from its searches. Information discovered once becomes part of the agent's long-term memory, 
# available for future conversations without additional API calls.



from tavily import TavilyClient
from datetime import datetime

tavily_client = TavilyClient()

# When `augment=True`, the `Toolbox` sends both the **original docstring** and the **function's source code** to an LLM, 
# which produces a richer, more detailed description. 
# This enriched text is what gets embedded and stored — improving semantic separability and retrieval recall.
@toolbox.register_tool(augment=True)
def search_tavily(query: str, max_results: int = 5):
    """
    Use this function to search the web and store the results in the knowledge base.
    """
    response = tavily_client.search(query=query, max_results=max_results)
    results = response.get("results", [])

    # Write each result to the knowledge base
    for result in results:
        # Create the text content to embed
        text = f"Title: {result.get('title', '')}\nContent: {result.get('content', '')}\nURL: {result.get('url', '')}"
        
        # Create metadata
        metadata = {
            "title": result.get("title", ""),
            "url": result.get("url", ""),
            "score": result.get("score", 0),
            "source_type": "tavily_search",
            "query": query,
            "timestamp": datetime.now().isoformat()
        }
        
        # Write to knowledge base
        memory_manager.write_knowledge_base(text, metadata)

    return results

import inspect

# Original docstring (what the developer wrote - just one line)
original = ("Use this function to search the web"
            " and store the results in the"
            " knowledge base.")

# Get the actual source code of the function
fn = toolbox._tools_by_name["search_tavily"]
source = inspect.getsource(fn)

print("ORIGINAL DOCSTRING:")
print(f'  "{original}"')
print()

# The LLM reads both the docstring AND the source code
augmented = toolbox._augment_docstring(original, source)

print("AUGMENTED DOCSTRING (LLM-enhanced):")
print(f"  {augmented}")


# Add a Simple Utility Tool First
#
# Before advanced retrieval tools, 
# we register a deterministic utility (get_current_time). 
# This is a good pedagogical pattern: validate tool registration on a low-risk function first.

from datetime import datetime

@toolbox.register_tool(augment=True)
def get_current_time(detailed: bool = False) -> str:
    """
    Returns the current time.
    
    Args:
        detailed: If True, returns detailed format with microseconds
    
    Returns:
        str: Current time as formatted string
    """
    if detailed:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
    else:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


# Register an arXiv Discovery Tool

# Configure Candidate Retrieval from arXiv
# sets up a lightweight retriever for paper candidates (title, abstract, metadata) rather than full PDFs. This supports fast discovery before expensive ingestion.

from langchain_community.retrievers import ArxivRetriever

arxiv_retriever = ArxivRetriever(
    load_max_docs=8,
    get_full_documents=False,
    doc_content_chars_max=4000
)

import json
from urllib.parse import urlparse

def _arxiv_id_from_entry_id(entry_id: str) -> str:
    """
    Convert 'http://arxiv.org/abs/2310.08560v2' -> '2310.08560v2'
    """
    if not entry_id:
        return ""
    path = urlparse(entry_id).path  # e.g. '/abs/2310.08560v2'
    return path.split("/abs/")[-1].strip("/")

@toolbox.register_tool(augment=False)
def arxiv_search_candidates(query: str, k: int = 5) -> str:
    """
    Search arXiv and return a JSON list of candidate papers with IDs + metadata.

    Output schema (JSON string):
    [
      {
        "arxiv_id": "2310.08560v2",
        "entry_id": "http://arxiv.org/abs/2310.08560v2",
        "title": "...",
        "authors": "...",
        "published": "2024-02-12",
        "abstract": "..."
      },
      ...
    ]
    """
    docs = arxiv_retriever.invoke(query)
    candidates = []
    for d in (docs or [])[:k]:
        meta = d.metadata or {}
        entry_id = meta.get("Entry ID", "")
        candidates.append({
            "arxiv_id": _arxiv_id_from_entry_id(entry_id),
            "entry_id": entry_id,
            "title": meta.get("Title", ""),
            "authors": meta.get("Authors", ""),
            "published": str(meta.get("Published", "")),
            "abstract": (d.page_content or "")[:2500],
        })
    return json.dumps(candidates, ensure_ascii=False, indent=2)

# Register Deep Ingestion: Fetch, Chunk, and Persist
# define a heavier tool that downloads full paper text, 
# chunks it for embedding limits, and stores it in knowledge-base memory. 
# This demonstrates a production-grade pattern: move large payload handling out of the model context and into memory infrastructure.

from datetime import timezone
from langchain_community.document_loaders import ArxivLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter


@toolbox.register_tool(augment=True)
def fetch_and_save_paper_to_kb_db(
    arxiv_id: str,
    chunk_size: int = 1500,
    chunk_overlap: int = 200,
) -> str:
    """
    Fetch full arXiv paper text (PDF -> text) and store it into the OracleVS
    knowledge base table as chunked records (avoids routing full content via the LLM).

    """

    # 1) Load full paper text from arXiv (PDF -> text)
    loader = ArxivLoader(
        query=arxiv_id,
        load_max_docs=1,
        doc_content_chars_max=None,  # "no truncation" in current LangChain docs :contentReference[oaicite:1]{index=1}
    )
    docs = loader.load()
    if not docs:
        return f"No documents found for arXiv id: {arxiv_id}"

    doc = docs[0]

    title = (
        doc.metadata.get("Title")
        or doc.metadata.get("title")
        or f"arXiv {arxiv_id}"
    )

    # Normalize common arxiv metadata keys
    entry_id = doc.metadata.get("Entry ID") or doc.metadata.get("entry_id") or ""
    published = doc.metadata.get("Published") or doc.metadata.get("published") or ""
    authors = doc.metadata.get("Authors") or doc.metadata.get("authors") or ""

    full_text = doc.page_content or ""
    if not full_text.strip():
        return f"Loaded arXiv {arxiv_id} but extracted empty text (PDF parsing issue)."

    # 2) Chunk (important: embeddings have input limits; chunking prevents failures/truncation)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    
    chunks = splitter.split_text(full_text)

    # 3) Store chunks into OracleVS (vector store table)
    ts_utc = datetime.now(timezone.utc).isoformat()
    metadatas = []
    for i in range(len(chunks)):
        metadatas.append(
            {
                "source": "arxiv",
                "arxiv_id": arxiv_id,
                "title": title,
                "entry_id": entry_id,
                "published": str(published),
                "authors": str(authors),
                "chunk_id": i,
                "num_chunks": len(chunks),
                "ingested_ts_utc": ts_utc,
            }
        )

    memory_manager.write_knowledge_base(chunks, metadatas)

    return (
        f"Saved arXiv {arxiv_id} to {KNOWLEDGE_BASE_TABLE}: "
        f"{len(chunks)} chunks (title: {title})."
    )



# Validate Semantic Tool Retrieval
import pprint
retrieved_tools = memory_manager.read_toolbox("Get more details on a paper on AI", k=1)
pprint.pprint(retrieved_tools)

