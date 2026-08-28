# 观察直接根据diff 进行review 和添加context 后发现问题的区别
# 添加context 后，问题数量和准确度都improve

from src.data.sample_prs import load_pr

from src.review_agents.reviewer import review, DEFAULT_REVIEW_PROMPT

# Section 1: The Problem
pr = load_pr('pr_001_auth_bypass')

expected_issues_text = "\n".join(
    f"  • {issue}" for issue in pr['expected_issues'])
print(f"PR Title: {pr['title']}\n\nDiff:\n{pr['diff']}"
    f"\n\nExpected Issues:\n{expected_issues_text}")


# Section 2: The Review System
separator = "=" * 80
print(f"{separator}\nREVIEW PROMPT (for BOTH diff-only & context-aware)\n"
      f"{separator}\n{DEFAULT_REVIEW_PROMPT}\n{separator}")

#____________________________ Single Example: Diff-Only Review ____________________________
diff_only_review = review(pr, context=None, task_context=None)

findings_text = "\n\n".join(
    f"{i}. {finding['issue']}\n   Severity: {finding['severity']}"
    for i, finding in enumerate(diff_only_review['findings'], 1)
)
print(f"Diff-Only Review Findings:\n\n{findings_text}\n\n"
      f"Total: {len(diff_only_review['findings'])} issue(s) found")

from src.utils.display import create_detailed_matching_table

diff_only_matching = create_detailed_matching_table(diff_only_review, 
                                                    pr['expected_issues'])
print(diff_only_matching)


#_____________________________ Single Example: Context-Aware Review ____________________________

context_aware_review = review(pr, context=pr.get('context', ''), 
                              task_context=pr.get('task_context', ''))

findings_text = "\n\n".join(
    f"{i}. {finding['issue']}\n   Severity: {finding['severity']}"
    for i, finding in enumerate(context_aware_review['findings'], 1))
print(
    f"Context-Aware Review Findings:\n\n{findings_text}\n\n"
    f"Total: {len(context_aware_review['findings'])} issue(s) found\n\n"
    "💡 The ONLY difference: we passed context + task_context")

context_aware_matching = create_detailed_matching_table(
    context_aware_review, pr['expected_issues'])
print(context_aware_matching)


from src.utils.display import create_comparison_table

comparison = create_comparison_table(diff_only_review, context_aware_review, 
    pr['expected_issues'])

print(comparison)

#_______________________________ Full Evaluation ____________________________

from src.data.sample_prs import load_all_prs

all_prs = load_all_prs()
print(f'Loaded {len(all_prs)} PRs for evaluation')

from src.utils.evaluation import evaluate_reviewers

print("Evaluating both approaches across all PRs...\n"
      "This may take a few minutes...\n")

results = evaluate_reviewers(all_prs)

print(f"\n{'=' * 80}\nEVALUATION COMPLETE\n{'=' * 80}")

from src.utils.display import build_metrics_dataframe, print_metrics_summary

metrics_df = build_metrics_dataframe(results)
print(metrics_df)

print_metrics_summary(results)

from src.utils.analysis import analyze_findings, display_findings_summary

findings_summary = analyze_findings(results)
display_findings_summary(findings_summary)