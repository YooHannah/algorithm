# L4: Building the Code Knowledge Graph
#
# In this notebook, you'll build a Code Knowledge Graph from imports, function
# calls, and co-edits, and compare graph-based retrieval against traditional
# approaches like regex matching and text search, to see when structured memory
# gives AI agents an edge.
#
# You'll:
# - Construct a graph from nodes (files, functions) and edges (imports, calls,
#   co-edits), starting with a small sample and scaling up to a real codebase
#   (~200 files, ~1,200 symbols)
# - Deduplicate and prepare the graph for retrieval
# - Implement two-step retrieval: an anchor node found via similarity search,
#   followed by PageRank traversal to surface the most relevant nodes
# - Test performance on easy (lexically similar) vs. multi-hop (structurally
#   distant) queries
# - See how the graph handles codebase edits, with near-zero append cost for
#   new nodes
# - Review real benchmark results (HTTPie, Django) showing gains in tool calls,
#   tokens, time-to-first-edit, and overall cost when Code Knowledge Graphs are
#   injected into an agent's context

import helper as _lesson_helper
_lesson_helper.ensure_schema()

import sys
from pathlib import Path
sys.path.insert(
    0,
    str(Path.cwd().parent if Path("notebook.ipynb").exists()
        else Path.cwd()),
)
from course_lab.sandbox import ensure_ready
_ = ensure_ready()


# ---------------------------------------------------------------------------
# Connect to Database
#
# Connect to the module and initialize the environment you'll use throughout
# the lesson.
# ---------------------------------------------------------------------------

import sys
from pathlib import Path
sys.path.insert(
    0,
    str(Path.cwd().parent if Path("notebook.ipynb").exists()
        else Path.cwd()),
)

from course_lab.m3_lab import connect_module3

s = connect_module3()
cfg, domain, mem = s.cfg, s.domain, s.mem
print(s.summary())


# ---------------------------------------------------------------------------
# Build a small Code Knowledge Graph
#
# Define a handful of starter nodes (files, functions) and edges (imports,
# calls, containment) by hand, to see the graph's building blocks before
# scaling up.
# ---------------------------------------------------------------------------

starter_nodes = [
    # (id, kind, label)
    ("file:retriever.py",   "file",   "retriever.py"),
    ("file:graph_store.py", "file",   "graph_store.py"),
    ("file:auth.py",        "file",   "auth.py"),
    ("file:api.py",         "file",   "api.py"),
    ("file:test_retriever.py", "file", "test_retriever.py"),
    ("fn:seed_ppr",         "symbol", "seed_ppr()"),
    ("fn:walk_edges",       "symbol", "walk_edges()"),
    ("fn:verify_token",     "symbol", "verify_token()"),
]

starter_edges = [
    ("file:retriever.py",   "fn:seed_ppr",         "contains"),
    ("file:retriever.py",   "fn:walk_edges",       "contains"),
    ("file:retriever.py",   "fn:verify_token",     "contains"),
    # retriever imports graph_store
    ("file:retriever.py",   "file:graph_store.py", "import"),
    # api imports auth
    ("file:api.py",         "file:auth.py",        "import"),
    # api imports retriever
    ("file:api.py",         "file:retriever.py",   "import"),
    # seed_ppr() calls walk_edges()
    ("fn:seed_ppr",         "fn:walk_edges",       "call"),
    # verify_token() calls seed_ppr()
    ("fn:verify_token",     "fn:seed_ppr",         "call"),
    # shipped together
    ("file:retriever.py",   "file:graph_store.py", "co_edit"),
    ("file:retriever.py",   "file:test_retriever.py", "co_edit"),
    ("file:graph_store.py", "file:test_retriever.py", "co_edit"),
    # shipped together
    ("file:api.py",         "file:auth.py",        "co_edit"),
]

from collections import Counter
print(f"{len(starter_nodes)} nodes, {len(starter_edges)} edges")
print("edges by kind:", dict(Counter(k for *_e, k in starter_edges)))


# ---------------------------------------------------------------------------
# Storing as a property graph
#
# Create the node and edge tables in Oracle and load the starter graph as a
# queryable property graph.
# ---------------------------------------------------------------------------

from course_lab.m3_lab import starter_reset, show_starter_tables

with mem._pool.acquire() as conn:
    cur = conn.cursor()
    starter_reset(cur)

    cur.execute("""
        CREATE TABLE STARTER_GRAPH_NODES (
            id    VARCHAR2(100) PRIMARY KEY,   -- e.g. 'file:retriever.py'
            kind  VARCHAR2(20),                -- 'file' or 'symbol'
            label VARCHAR2(100)
        )""")
    cur.execute("""
        CREATE TABLE STARTER_GRAPH_EDGES (
            eid  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            src  VARCHAR2(100),                -- source node id
            dst  VARCHAR2(100),                -- destination node id
            kind VARCHAR2(20),                 -- import | call | co_edit
            CONSTRAINT starter_edge_src
                FOREIGN KEY (src) REFERENCES STARTER_GRAPH_NODES (id),
            CONSTRAINT starter_edge_dst
                FOREIGN KEY (dst) REFERENCES STARTER_GRAPH_NODES (id)
        )""")
    cur.executemany(
        "INSERT INTO STARTER_GRAPH_NODES (id, kind, label) "
        "VALUES (:1, :2, :3)",
        starter_nodes,
    )
    cur.executemany(
        "INSERT INTO STARTER_GRAPH_EDGES (src, dst, kind) "
        "VALUES (:1, :2, :3)",
        starter_edges,
    )
    cur.execute("""
        CREATE PROPERTY GRAPH starter_code_graph
          VERTEX TABLES (
            STARTER_GRAPH_NODES KEY (id)
              PROPERTIES (id, kind, label))
          EDGE TABLES (
            STARTER_GRAPH_EDGES KEY (eid)
              SOURCE      KEY (src) REFERENCES STARTER_GRAPH_NODES (id)
              DESTINATION KEY (dst) REFERENCES STARTER_GRAPH_NODES (id)
              PROPERTIES (kind))""")
    conn.commit()

    show_starter_tables(cur)

print(f"Stored as property graph starter_code_graph: "
      f"{len(starter_nodes)} vertices, {len(starter_edges)} edges "
      f"over two tables.")


# ---------------------------------------------------------------------------
# Draw the starter graph
#
# Visualize the small starter graph to see how files, functions, imports, and
# calls connect.
# ---------------------------------------------------------------------------

from course_lab.m3_lab import render_starter_graph

render_starter_graph(starter_nodes, starter_edges)


# ---------------------------------------------------------------------------
# Querying the small Code Knowledge Graph
#
# Run graph pattern-matching queries (MATCH) to pull typed edges and traverse
# relationships between nodes.
# ---------------------------------------------------------------------------

from course_lab.m3_lab import show_match

with mem._pool.acquire() as conn:
    cur = conn.cursor()
    show_match(cur, """
        SELECT a, kind, b FROM GRAPH_TABLE (starter_code_graph
          MATCH (v) -[e]-> (w)
          COLUMNS (v.label AS a, e.kind AS kind, w.label AS b))
        ORDER BY kind, a""", "every typed edge: MATCH (v)-[e]->(w)")
    show_match(cur, """
        SELECT other FROM GRAPH_TABLE (starter_code_graph
          MATCH (v) -[e]- (w)
          WHERE v.id = :f AND e.kind = 'co_edit'
          COLUMNS (w.label AS other))""",
        "what changed together with retriever.py? (undirected MATCH)",
        binds={"f": "file:retriever.py"})

from course_lab.m3_lab import render_anchor_walk

render_anchor_walk(starter_nodes, starter_edges,
                   query="where do we verify a token?")


# ---------------------------------------------------------------------------
# Adding one node to the Graph
#
# Add a new function node and its call edge to the graph, and see how cheaply
# the structure grows.
# ---------------------------------------------------------------------------

from course_lab.m3_lab import render_growth_step

new_symbol = ("fn:rerank_hits", "symbol", "rerank_hits()")
new_edge   = ("fn:seed_ppr", "fn:rerank_hits", "call")

render_growth_step(starter_nodes, starter_edges, new_symbol, new_edge)


# ---------------------------------------------------------------------------
# Real Codebase Knowledge Graph
#
# Move from the toy example to a real codebase (~200 files, ~1,200 symbols)
# and load its raw import/call/co-edit data plus a set of evaluation tasks.
# ---------------------------------------------------------------------------

from course_lab.code_graph_parse import load_code_graph
from course_lab.m3_lab import show_raw_code_data, load_real_graph

cg = load_code_graph()
show_raw_code_data(cg, n_files=6, n_edges=6)

nodes, edges, eval_tasks = load_real_graph(s)


# ---------------------------------------------------------------------------
# Step 1: Auditing the repo
#
# Score the raw graph before any cleanup, to establish a baseline for how
# noisy or redundant it is.
# ---------------------------------------------------------------------------

from course_lab.memory_audit import audit_scorecard
from course_lab.m3_lab import show_scorecard

before_sc = audit_scorecard(nodes, edges)
show_scorecard(before_sc, label="BEFORE restructure")


# ---------------------------------------------------------------------------
# Step 2: Deduplicate
#
# Restructure the graph: folding in retrieval traces and removing redundancy,
# and compare the before/after scorecards.
# ---------------------------------------------------------------------------

from course_lab.memory_graph import build_graph, restructure
from course_lab.m3_lab import show_restructure

traces = mem.list_traces("retrieval")
graph = build_graph(traces, edges, domain=domain.name)
graph_clean, after_sc = restructure(graph, before_sc)

show_restructure(graph, graph_clean, before_sc, after_sc, len(traces))


# ---------------------------------------------------------------------------
# Visualize the graph
#
# Render the full, cleaned graph in Oracle and see its overall shape: how many
# nodes and edges, and whether it's more dependency-led or co-edit-led.
# ---------------------------------------------------------------------------

from course_lab.m3_lab import render_full_graph

stats = render_full_graph(nodes, edges)
print(f"FULL graph in Oracle : {stats['n_nodes']} nodes, "
      f"{stats['n_edges']} edges (by kind={stats['by_kind']}); "
      f"dependency-led={stats['dep_led']}, co_edit-led={stats['co_led']}. "
      f"PPR walks this whole structure per query.")


# ---------------------------------------------------------------------------
# Zoom: the file layer
#
# Zoom into just the file-level layer of the graph to see file-to-file
# relationships on their own.
# ---------------------------------------------------------------------------

from course_lab.m3_lab import render_files_only_graph, show_files_zoom

fstats = render_files_only_graph(nodes, edges)
show_files_zoom(fstats)


# ---------------------------------------------------------------------------
# Keywords vs PageRank in Knowledge Graph
#
# Run the two-step retrieval pipeline -- anchor via similarity search, then
# PageRank traversal and compare it against keyword-style retrieval on the
# evaluation tasks.
# ---------------------------------------------------------------------------

from course_lab.m3_lab import (peek_hybrid_halves, build_node_embeddings,
                        run_retrieval_eval, narrate_retrieval_comparison)

K, N_ANCHORS = 5, 1

peek_hybrid_halves(eval_tasks, nodes, graph_clean, k=K, n_anchors=N_ANCHORS)
node_emb = build_node_embeddings(nodes)
scored_tasks, results = run_retrieval_eval(eval_tasks, nodes, graph_clean,
                                           k=K,n_anchors=N_ANCHORS,
                                           node_emb=node_emb)

narrate_retrieval_comparison(scored_tasks, results, nodes, k=K)


# ---------------------------------------------------------------------------
# Testing on a real coding workflow
#
# Review benchmark results from a real repo (graphify-verification) showing the
# measured improvement from using the Code Knowledge Graph.
# ---------------------------------------------------------------------------

import matplotlib.pyplot as plt
from course_lab import gv_lab
from IPython.display import Markdown, display

try:
    gv_lab.render_improvement_bars(); plt.show()
    display(Markdown(gv_lab.summarize_text()))
except FileNotFoundError:
    print("graphify-verification results not in this checkout; "
          "run `python lab.py graphify-verify all`.")


# ---------------------------------------------------------------------------
# Bigger repo: django
#
# Scale the comparison up to a larger codebase (Django), including a
# hero-vs-typical case table and a model comparison (Sonnet vs. Haiku).
# ---------------------------------------------------------------------------

import matplotlib.pyplot as plt
from course_lab import gv_lab
from IPython.display import Markdown, display

display(Markdown(gv_lab.hero_vs_typical_table_md("django_cache")))
gv_lab.render_sonnet_vs_haiku(); plt.show()


# ---------------------------------------------------------------------------
# All results
#
# See the full benchmark suite across all task, time-on-task, per-task
# breakdown, and pooled results, with a pointer to the full write-up.
# ---------------------------------------------------------------------------

try:
    gv_lab.render_suite_bars(); plt.show()
    display(Markdown(
        "**Per-task** (sorted by time-on-task; + = graph faster):"))
    display(Markdown(gv_lab.suite_per_task_table_md()))
    display(Markdown("**Pooled across all 10 tasks:**"))
    display(Markdown(gv_lab.suite_pooled_table_md()))
    print("Full write-up incl. reproduce + video guide: "
          "reports/graphify-m3-django-haiku-pilot.md")
except FileNotFoundError:
    print("Suite summary not in this checkout "
          "(lives in the full course repo / L3/reports).")
