# Explain core agent memory types and their role in enabling reliable, long-running agentic systems.
# Design a persistent agent memory architecture, mapping memory types to appropriate storage backends (SQL tables and vector stores).
# Implement semantic memory using Oracle Vector Search, including embeddings, OracleVS configuration, HNSW indexing, and metadata filtering.
# Build a memory manager that orchestrates how agents store, retrieve, and update memory during execution.
# Evaluate memory design trade-offs, balancing retrieval accuracy, latency, cost, and agent reliability.

# | Step | Description |
# |------|-------------|
# | **1. Initialize Embeddings** | Load a HuggingFace embedding model to convert text into vectors |
# | **2. Create Vector Store** | Set up an Oracle-backed vector store with distance strategy |
# | **3. Create Index** | Build an HNSW index for fast similarity search |
# | **4. Add Documents** | Store text with metadata in the vector database |
# | **5. Query** | Search for similar documents using natural language |
# | **6. Filter Results** | Use metadata filters to narrow down search results |

# **Key Components**

# - **`OracleVS`**: LangChain's Oracle vector store integration
# - **`HuggingFaceEmbeddings`**: Converts text to 768-dimensional vectors
# - **`DistanceStrategy.EUCLIDEAN_DISTANCE`**: Measures similarity between vectors
# - **HNSW Index**: Speeds up similarity search with graph-based nearest-neighbor traversal


# --------------- Part 1: Setting Up Database, Vector Stores and Embedding Models ------------------

from LLM.MemoryAwareAgent.helper import suppress_warnings

# Warning control
suppress_warnings()

from LLM.MemoryAwareAgent.helper import load_env, setup_oracle_database, connect_to_oracle

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


# -------------- Loading the Embedding Model -------------------

from langchain_huggingface import HuggingFaceEmbeddings

# Initialize the embedding model
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-mpnet-base-v2"
)

# 要实现的数据表
#These tables will be created in Oracle Database to persist agent memory.

### Memory Types We'll Implement

# | Memory Type | Human Analogy | Purpose | Storage | Retrieval Strategies Used |
# |-------------|---------------|---------|---------|---------------------------|
# | **Conversational** | Short-term memory | Chat history per thread | SQL Table | Exact match by thread_id |
# | **Knowledge Base** | Long-term semantic memory | Facts, documents, search results | Vector Store | Semantic similarity search |
# | **Workflow** | Procedural memory | Learned action patterns | Vector Store | Semantic similarity search + metadata filtering |
# | **Toolbox** | Skill memory | Available tools & capabilities | Vector Store | Semantic similarity search |
# | **Entity** | Episodic memory | People, places, systems mentioned | Vector Store | Semantic similarity search |
# | **Summary** | Compressed memory | Condensed context for long conversations | Vector Store | Semantic similarity search (with optional ID filter) |
# | **Tool Log** | Execution audit trail | Raw tool inputs/outputs and execution status | SQL Table | Exact match by thread_id + timestamp ordering |


# Table names for each memory type
CONVERSATIONAL_TABLE   = "CONVERSATIONAL_MEMORY" # Episodic memory
KNOWLEDGE_BASE_TABLE   = "SEMANTIC_MEMORY" # Semantic memory
WORKFLOW_TABLE = "WORKFLOW_MEMORY" # Procedural memory
TOOLBOX_TABLE    = "TOOLBOX_MEMORY" # Procedural memory
ENTITY_TABLE = "ENTITY_MEMORY" # Semantic memory
SUMMARY_TABLE = "SUMMARY_MEMORY" # Semantic memory
TOOL_LOG_TABLE = "TOOL_LOG_MEMORY" # Tool execution logs

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
            cur.execute(f"DROP TABLE {table} PURGE")  # 把已存在的表删除掉
            print(f"  - {table} (dropped)")
    except Exception as e:
        if "ORA-00942" in str(e):
            print(f"  - {table} (not exists)")
        else:
            print(f"  ✗ {table}: {e}")
            
database_connection.commit()


# --------------- Create Conversational Memory Table -------------------

# Creates a table with columns: id, thread_id, role, content, timestamp, metadata
# Adds an index on thread_id for fast conversation lookups
# Adds an index on timestamp for chronological ordering
def create_conversational_history_table(conn, table_name: str = "CONVERSATIONAL_MEMORY"):
    """
    Create a table to store conversational history.

    Args:
        conn: Oracle database connection
        table_name: Name of the table to create
    """
    with conn.cursor() as cur:
        # Drop table if exists
        try:
            cur.execute(f"DROP TABLE {table_name}")
        except:
            pass  # Table doesn't exist
        
        # Create table with proper schema
        cur.execute(f"""
            CREATE TABLE {table_name} (
                id VARCHAR2(100) DEFAULT SYS_GUID() PRIMARY KEY,
                thread_id VARCHAR2(100) NOT NULL,
                role VARCHAR2(50) NOT NULL,
                content CLOB NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata CLOB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                summary_id VARCHAR2(100) DEFAULT NULL
            )
        """)
        
        # Create index on thread_id for faster lookups
        cur.execute(f"""
            CREATE INDEX idx_{table_name.lower()}_thread_id ON {table_name}(thread_id)
        """)
        
        # Create index on timestamp for ordering
        cur.execute(f"""
            CREATE INDEX idx_{table_name.lower()}_timestamp ON {table_name}(timestamp)
        """)
        
    conn.commit()
    print(f"Table {table_name} created successfully with indexes")
    return table_name

# 类似conversational的其他类型的table 定义在helper中
from LLM.MemoryAwareAgent.helper import create_tool_log_table

# Create the SQL memory tables
CONVERSATION_HISTORY_TABLE = create_conversational_history_table(database_connection, CONVERSATIONAL_TABLE)
TOOL_LOG_HISTORY_TABLE = create_tool_log_table(database_connection, TOOL_LOG_TABLE)

# ------------------- Create Vector Stores for Each Memory Type -------------------

# Each vector store is backed by its own Oracle table and uses the same embedding model for consistency.

# | Vector Store | Purpose |
# |--------------|---------|
# | `knowledge_base_vs` | Store documents, facts, and search results |
# | `workflow_vs` | Store learned action patterns and tool sequences |
# | `toolbox_vs` | Store tool definitions for semantic tool discovery |
# | `entity_vs` | Store extracted entities (people, places, systems) |
# | `summary_vs` | Store compressed summaries for long conversations |

from langchain_oracledb.vectorstores import OracleVS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_oracledb.retrievers.hybrid_search import (
    OracleVectorizerPreference
)


class StoreManager:
    """Manages all stores (vector stores and SQL tables) with getter methods for easy access."""
    
    def __init__(self, client, embedding_function, table_names, distance_strategy, conversational_table, tool_log_table: str | None = None):
        """
        Initialize all stores.
        
        Args:
            client: Oracle database connection
            embedding_function: Embedding model to use
            table_names: Dict with keys: knowledge_base, workflow, toolbox, entity, summary
            distance_strategy: Distance strategy for vector search
            conversational_table: Name of the conversational history SQL table
            tool_log_table: Name of the SQL tool log table
        """
        self.client = client
        self.embedding_function = embedding_function
        self.distance_strategy = distance_strategy
        self._conversational_table = conversational_table
        self._tool_log_table = tool_log_table
        
        # Initialize all vector stores
        self._knowledge_base_vs = OracleVS(
            client=client,
            embedding_function=embedding_function,
            table_name=table_names['knowledge_base'],
            distance_strategy=distance_strategy,
        )
        
        self._workflow_vs = OracleVS(
            client=client,
            embedding_function=embedding_function,
            table_name=table_names['workflow'],
            distance_strategy=distance_strategy,
        )
        
        self._toolbox_vs = OracleVS(
            client=client,
            embedding_function=embedding_function,
            table_name=table_names['toolbox'],
            distance_strategy=distance_strategy,
        )
        
        self._entity_vs = OracleVS(
            client=client,
            embedding_function=embedding_function,
            table_name=table_names['entity'],
            distance_strategy=distance_strategy,
        )
        
        self._summary_vs = OracleVS(
            client=client,
            embedding_function=embedding_function,
            table_name=table_names['summary'],
            distance_strategy=distance_strategy,
        )
        
        # Store hybrid search preference for knowledge base (optional)
        self._kb_vectorizer_pref = None
    
    def get_knowledge_base_store(self):
        """Return the knowledge base vector store."""
        return self._knowledge_base_vs
    
    def get_workflow_store(self):
        """Return the workflow vector store."""
        return self._workflow_vs
    
    def get_toolbox_store(self):
        """Return the toolbox vector store."""
        return self._toolbox_vs
    
    def get_entity_store(self):
        """Return the entity vector store."""
        return self._entity_vs
    
    def get_summary_store(self):
        """Return the summary vector store."""
        return self._summary_vs
    
    def get_conversational_table(self):
        """Return the conversational history table name."""
        return self._conversational_table
    

    def get_tool_log_table(self):
        """Return the tool log table name."""
        return self._tool_log_table

    def setup_hybrid_search(self, preference_name="KB_VECTORIZER_PREF"):
        """
        Set up hybrid search for knowledge base.
        Creates vectorizer preference for hybrid indexing.
        """
        self._kb_vectorizer_pref = OracleVectorizerPreference.create_preference(
            vector_store=self._knowledge_base_vs,
            preference_name=preference_name
        )
        return self._kb_vectorizer_pref

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

from LLM.MemoryAwareAgent.helper import safe_create_index

print("Creating vector indexes...")
safe_create_index(database_connection, knowledge_base_vs, "knowledge_base_vs_ivf")
safe_create_index(database_connection, workflow_vs, "workflow_vs_ivf")
safe_create_index(database_connection, toolbox_vs, "toolbox_vs_ivf")
safe_create_index(database_connection, entity_vs, "entity_vs_ivf")
safe_create_index(database_connection, summary_vs, "summary_vs_ivf")
print("All indexes created!")

# --------------------------------- Part 2: Memory Manager Initialization ---------------------------------

# The `MemoryManager` class is the central abstraction that unifies all memory operations. It provides a clean interface for reading and writing to different memory types, hiding the complexity of SQL queries and vector store operations. It is a single class that manages 7 types of memory with consistent read/write patterns:

# | Memory Type | Storage | Write Method | Read Method |
# |-------------|---------|--------------|-------------|
# | **Conversational** | SQL Table | `write_conversational_memory()` | `read_conversational_memory()` |
# | **Knowledge Base** | Vector Store | `write_knowledge_base()` | `read_knowledge_base()` |
# | **Workflow** | Vector Store | `write_workflow()` | `read_workflow()` |
# | **Toolbox** | Vector Store | `write_toolbox()` | `read_toolbox()` |
# | **Entity** | Vector Store | `write_entity()` | `read_entity()` |
# | **Summary** | Vector Store | `write_summary()` | `read_summary_memory()`, `read_summary_context()` |
# | **Tool Log** | SQL Table | `write_tool_log()` | `read_tool_logs()` |


from LLM.MemoryAwareAgent.helper import MemoryManager

# Initialize the MemoryManager instance
# Note: Uses SQL table for conversational memory, vector stores for others
memory_manager = MemoryManager(
    conn=database_connection,
    conversation_table=CONVERSATION_HISTORY_TABLE, 
    knowledge_base_vs=knowledge_base_vs,
    workflow_vs=workflow_vs,
    toolbox_vs=toolbox_vs,
    entity_vs=entity_vs,
    summary_vs=summary_vs,
    tool_log_table=TOOL_LOG_HISTORY_TABLE
)


# --------------------------------- Part 3: Using The Memory Manager ---------------------------------

from datasets import load_dataset
from itertools import islice

ds = load_dataset("nick007x/arxiv-papers", split="train", streaming=True)

for paper in islice(ds, 100):
    # extract the key fields
    title = (paper.get("title") or "").strip()
    abstract = (paper.get("abstract") or "").strip()
    subjects = (paper.get("subjects") or paper.get("primary_subject") or "").strip()
    submission_date = (paper.get("submission_date") or "").strip()

    # skip empty records
    if not (title or abstract or subjects):
        continue

    # concatenate the key fields containing context for semantic search
    text = "\n".join([part for part in (title, subjects, abstract) if part])

    memory_manager.write_knowledge_base(
        text=text,
        metadata={
            "arxiv_id": paper.get("arxiv_id"),
            "title": title,
            "subjects": subjects,
            "abstract": abstract,
            "submission_date": submission_date,
        },
    )

results = memory_manager.read_knowledge_base(query="space exploration")
print(results)