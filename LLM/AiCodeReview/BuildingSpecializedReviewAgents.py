# Section 1: Setup Context Engine
import pandas as pd
from src.context_engine import chunk_repository, embed_chunks, ContextRetriever
from src.data.toy_repository import get_toy_repository

print("Building context engine...")
repo = get_toy_repository()
chunks = chunk_repository(repo)
embedded_chunks = embed_chunks(chunks)

retriever = ContextRetriever()
retriever.create_index(embedded_chunks)

print(f"\n✓ Context engine ready with {len(embedded_chunks)} chunks indexed")

## Section 2: The Ensemble Architecture

### 1. Security Agent
# **Focus**: Security vulnerabilities requiring domain expertise
# - SQL injection, XSS, auth bypass
# - Hardcoded secrets, weak crypto
# - Uses OWASP knowledge and attack patterns

# ### 2. Pattern Compliance Agent
# **Focus**: Violations of established codebase patterns
# - Missing authentication decorators
# - Inconsistent error handling
# - Missing locks, rate limits
# - Deviation from project conventions

# ### 3. Ensemble Strategy
# - Run both specialists in parallel
# - Combine findings they both agree on (high confidence)
# - Add unique high/medium-severity findings from either specialist
# - Deduplicate aggressively

# ```
# PR + Context → [Security Agent] ──┐
#                [Pattern Agent]  ──┼→ Combine → Deduplicate → Final Review
# ```

from src.review_agents.specialized import SECURITY_AGENT_PROMPT, PATTERN_AGENT_PROMPT
from src.review_agents.reviewer import DEFAULT_REVIEW_PROMPT

print("Agent Prompts:")
print(f"  General Agent:  {len(DEFAULT_REVIEW_PROMPT):,} characters")
print(f"  Security Agent: {len(SECURITY_AGENT_PROMPT):,} characters (detailed OWASP guidance)")
print(f"  Pattern Agent:  {len(PATTERN_AGENT_PROMPT):,} characters (pattern enforcement rules)")
print("\nSpecialized agents have 4x longer prompts with domain-specific expertise")

# Section 3: Full Evaluation Across All PRs

from src.data.sample_prs import load_all_prs
from src.helpers.evaluation_helpers import evaluate_general_and_ensemble

all_prs = load_all_prs()
print(f"Loaded {len(all_prs)} PRs for evaluation\n")
print("Evaluating General vs Ensemble across all PRs (this takes a few minutes)...\n")

results_general, results_ensemble = evaluate_general_and_ensemble(all_prs, retriever)

print("\n" + "="*80)
print("EVALUATION COMPLETE")
print("="*80)

# Section 4: Metrics Comparison

from src.helpers.evaluation_helpers import calculate_metrics
from src.utils.display import print_df

# Calculate metrics
metrics_general = calculate_metrics(results_general)
metrics_ensemble = calculate_metrics(results_ensemble)

# Create comparison table
metrics_df = pd.DataFrame([
    {'Approach': 'General (Lab 2)', 'Precision': f"{metrics_general['precision']:.2%}",
     'Recall': f"{metrics_general['recall']:.2%}", 'F1 Score': f"{metrics_general['f1']:.2%}"},
    {'Approach': 'Ensemble (Specialized)', 'Precision': f"{metrics_ensemble['precision']:.2%}",
     'Recall': f"{metrics_ensemble['recall']:.2%}", 'F1 Score': f"{metrics_ensemble['f1']:.2%}"}
])

print_df(metrics_df)

# Calculate improvements
f1_improvement = metrics_ensemble['f1'] - metrics_general['f1']
precision_improvement = metrics_ensemble['precision'] - metrics_general['precision']
recall_improvement = metrics_ensemble['recall'] - metrics_general['recall']

print(f"\n🎯 Ensemble Improvements over General Agent:")
print(f"  Precision: {precision_improvement:+.1%}")
print(f"  Recall:    {recall_improvement:+.1%}")
print(f"  F1 Score:  {f1_improvement:+.1%}")

if f1_improvement > 0.05:
    print("\n✓ Specialized agents working together OUTPERFORM general agent!")
else:
    print("\n≈ Performance is similar")


from src.helpers.plotting_helpers import plot_general_vs_ensemble

metrics_names = ['Precision', 'Recall', 'F1 Score']
general_values = [metrics_general['precision'], metrics_general['recall'], metrics_general['f1']]
ensemble_values = [metrics_ensemble['precision'], metrics_ensemble['recall'], metrics_ensemble['f1']]

plot_general_vs_ensemble(metrics_names, general_values, ensemble_values)

print("\nKey Insight:")
print(f"  Ensemble achieves {metrics_ensemble['f1']:.1%} F1 vs {metrics_general['f1']:.1%} for general agent")
print(f"  Improvement comes from combining security + pattern expertise")


from src.helpers.evaluation_helpers import build_per_pr_table, print_per_pr_summary

per_pr_df, per_pr_summary = build_per_pr_table(all_prs, results_general, results_ensemble)

print("Per-PR Performance (Issues Found / Expected):\n")
print_df(per_pr_df, max_col_width=50)

print_per_pr_summary(per_pr_summary)
