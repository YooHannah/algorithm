# Section 1: The Repository
from src.data.toy_repository import get_toy_repository

repo = get_toy_repository()

print(f"Repository contains {len(repo)} files:")
for file_path in sorted(repo.keys()):
    lines = len(repo[file_path].splitlines())
    print(f"  • {file_path:30s} ({lines:3d} lines)")

total_lines = sum(len(code.splitlines()) for code in repo.values())
print(f"\nTotal: {total_lines} lines of code")

# Section 2: Chunking the Repository

from src.context_engine import chunk_repository

chunks = chunk_repository(repo)
print(f"✓ Created {len(chunks)} chunks\n")

chunk_types = {}
for chunk in chunks:
    chunk_types[chunk.type] = chunk_types.get(chunk.type, 0) + 1

print("Chunk Distribution:")
for chunk_type, count in sorted(chunk_types.items()):
    print(f"  {chunk_type:12s}: {count:2d} chunks")

print("\nSample Chunks:")
for i, chunk in enumerate(chunks[:3]):
    print(f"\n{i+1}. {chunk.type}: {chunk.name} ({chunk.file_path})")
    preview = chunk.content[:150].replace('\n', ' ')
    print(f"   {preview}...")

# Section 3: Create Embeddings
from src.context_engine import embed_chunks

print("Creating embeddings...")
embedded_chunks = embed_chunks(chunks)

print(f"✓ Created {len(embedded_chunks)} embeddings")
print(f"\nEmbedding dimension: {len(embedded_chunks[0]['embedding'])}")
print(f"Sample embedding (first 5 values): "
      f"{embedded_chunks[0]['embedding'][:5]}")


# Section 4: Build Vector Index
from src.context_engine import ContextRetriever

retriever = ContextRetriever()
retriever.create_index(embedded_chunks)

print(f"✓ Vector index created with {len(embedded_chunks)} chunks")

# Section 5: Test Retrieval
from src.data.sample_prs import load_pr

pr = load_pr('pr_002_sql_injection')
query = f"{pr['title']}\n\n{pr['diff']}"

print(f"Query: {pr['title']}\n")
results = retriever.retrieve(query, n_results=10)

print("Top Retrieved Chunks:")
for i, result in enumerate(results[:10], 1):
    meta = result['metadata']
    similarity = 1 - result['distance']
    print(f"{i:2d}. {meta['type']:8s} {meta['name']:30s} "
          f"(similarity: {similarity:+.3f})")

# Section 6: Context Size Comparison

from src.review_agents.reviewer import review

full_context_chunks = []
for item in embedded_chunks:
    chunk = item['chunk']
    full_context_chunks.append(f"# {chunk.type}: {chunk.name} "
        f"({chunk.file_path})\n{chunk.content}")

full_context = "\n\n".join(full_context_chunks)
selective_context = retriever.retrieve_for_pr(pr, n_results=15)

print(f"Context Sizes:")
print(f"  Full Context:      {len(full_context):,} characters ({len(full_context_chunks)} chunks)") # 全量上下文size
print(f"  Selective Context: {len(selective_context):,} characters (15 chunks)") # 根据pr 修改代码内容 过滤后，只跟修改代码相关的上下文大小
print(f"  Reduction:         {(1 - len(selective_context)/len(full_context))*100:.1f}%")

# Section 7: Full Evaluation
from src.data.sample_prs import load_all_prs

all_prs = load_all_prs()
print(f"Evaluating {len(all_prs)} PRs across three approaches...\n")

results_no_context = []
results_full_context = []
results_selective = []

for i, pr_item in enumerate(all_prs, 1):
    print(f"  {i}/{len(all_prs)}: {pr_item['id']}")
    results_no_context.append({'pr_id': pr_item['id'], 'review': review(pr_item, context=None, task_context=None), 'expected': pr_item['expected_issues']})
    results_full_context.append({'pr_id': pr_item['id'], 'review': review(pr_item, context=full_context, task_context=pr_item.get('task_context', '')), 'expected': pr_item['expected_issues']})
    selective_ctx = retriever.retrieve_for_pr(pr_item, n_results=15)
    results_selective.append({'pr_id': pr_item['id'], 'review': review(pr_item, context=selective_ctx, task_context=pr_item.get('task_context', '')), 'expected': pr_item['expected_issues']})

print(f"\n✓ Evaluation complete")

from src.utils.evaluation import calculate_metrics_from_results
from src.utils.display import display_metrics_table

metrics_no_context = calculate_metrics_from_results(results_no_context)
metrics_full_context = calculate_metrics_from_results(results_full_context)
metrics_selective = calculate_metrics_from_results(results_selective)

display_metrics_table(metrics_no_context, metrics_selective, 
                      metrics_full_context)

# Section 8: Context Size vs Quality
from src.utils.plotting import plot_context_efficiency

context_sizes = {
    'No Context': 0,
    'Selective': len(selective_context),
    'Full': len(full_context)
}
f1_scores = {
    'No Context': metrics_no_context['f1'],
    'Selective': metrics_selective['f1'],
    'Full': metrics_full_context['f1']
}
labels = ['No Context', 'Selective', 'Full']

plot_context_efficiency(context_sizes, f1_scores, labels)