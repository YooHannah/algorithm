"""
Display utilities for creating comparison tables and formatted output.
Optimized for plain terminal display (no colors, no Unicode alignment issues).
"""
import pandas as pd
from src.utils.matching import issues_match, find_best_match


def _truncate(s: str, max_len: int = 50) -> str:
    s = str(s)
    s = s.replace('\n', ' ').replace('\r', ' ')
    if len(s) > max_len:
        return s[:max_len - 3] + "..."
    return s


def _create_simple_table(headers: list, rows: list, column_widths: list = None) -> str:
    if column_widths is None:
        column_widths = []
        for i, h in enumerate(headers):
            max_w = len(str(h))
            for row in rows:
                cell_len = len(str(row[i])) if i < len(row) else 0
                max_w = max(max_w, cell_len)
            column_widths.append(min(max_w, 60))

    def format_row(row_data):
        cells = []
        for i, cell in enumerate(row_data):
            w = column_widths[i] if i < len(column_widths) else 20
            cell_str = _truncate(str(cell), w)
            cells.append(cell_str.ljust(w))
        return "| " + " | ".join(cells) + " |"

    separator = "+" + "+".join(["-" * (w + 2) for w in column_widths]) + "+"

    lines = [separator, format_row(headers), separator]
    for row in rows:
        lines.append(format_row(row))
    lines.append(separator)

    return "\n".join(lines)


def df_to_table(df: pd.DataFrame, max_col_width: int = 40) -> str:
    """Convert a pandas DataFrame to an ASCII table string for terminal display."""
    headers = list(df.columns)
    rows = df.values.tolist()
    widths = []
    for i, h in enumerate(headers):
        max_w = len(str(h))
        for r in rows:
            cell_str = str(r[i]) if i < len(r) else ''
            cell_str = cell_str.replace('\n', ' ').replace('\r', ' ')
            max_w = max(max_w, min(len(cell_str), max_col_width))
        widths.append(min(max_w, max_col_width))
    return _create_simple_table(headers, rows, widths)


def print_df(df: pd.DataFrame, max_col_width: int = 40):
    """Print a pandas DataFrame as an ASCII table."""
    print(df_to_table(df, max_col_width))


def create_comparison_table(diff_only_review: dict, context_aware_review: dict, expected_issues: list) -> str:
    """
    Create a side-by-side comparison table showing which issues were found.

    Uses the same matching logic as evaluation for consistency.

    Args:
        diff_only_review: Results from diff-only reviewer
        context_aware_review: Results from context-aware reviewer
        expected_issues: List of expected issues to find

    Returns:
        Formatted string for terminal display
    """
    diff_only_issues = [f['issue'] for f in diff_only_review.get('findings', [])]
    context_aware_issues = [f['issue'] for f in context_aware_review.get('findings', [])]

    rows = []
    for expected in expected_issues:
        diff_only_found = any(issues_match(expected, found) for found in diff_only_issues)
        context_found = any(issues_match(expected, found) for found in context_aware_issues)

        diff_mark = 'Y' if diff_only_found else 'N'
        context_mark = 'Y' if context_found else 'N'

        rows.append([
            _truncate(expected, 60),
            diff_mark,
            context_mark
        ])

    headers = ['Expected Issue', 'Diff-Only', 'Context-Aware']
    return _create_simple_table(headers, rows, [60, 10, 15])


def create_detailed_matching_table(review_results: dict, expected_issues: list) -> str:
    """
    Create a detailed table showing which expected issues were found.

    Args:
        review_results: Results from reviewer with 'findings' list
        expected_issues: List of expected issues to find

    Returns:
        Formatted string for terminal display
    """
    found_issues = [f['issue'] for f in review_results.get('findings', [])]

    rows = []
    matched_found_indices = set()

    for expected in expected_issues:
        match_idx, match_score = find_best_match(expected, found_issues, threshold=0.3)

        if match_idx is not None and match_idx not in matched_found_indices:
            matched_found_indices.add(match_idx)
            status = 'Y'
            reported = _truncate(found_issues[match_idx], 50)
        else:
            status = 'N'
            reported = ""

        rows.append([
            status,
            _truncate(expected, 50),
            reported
        ])

    headers = ['Found', 'Expected Issue', 'Reported Matching Issue']
    return _create_simple_table(headers, rows, [6, 52, 52])


def format_findings(findings: list) -> str:
    """Format findings as a readable string."""
    if not findings:
        return "No issues found"

    output = []
    for i, finding in enumerate(findings, 1):
        severity = finding.get('severity', 'INFO').upper()
        issue = finding['issue']
        output.append(f"  {i}. [{severity}] {issue}")

    return "\n".join(output)


def display_metrics_table(no_context_metrics: dict, selective_metrics: dict, full_context_metrics: dict):
    """
    Display a comparison table of metrics for three approaches.

    Args:
        no_context_metrics: Metrics for no context approach
        selective_metrics: Metrics for selective context approach
        full_context_metrics: Metrics for full context approach
    """
    rows = [
        [
            'No Context',
            f"{no_context_metrics['precision']:.2%}",
            f"{no_context_metrics['recall']:.2%}",
            f"{no_context_metrics['f1']:.2%}"
        ],
        [
            'Full Context (All Chunks)',
            f"{full_context_metrics['precision']:.2%}",
            f"{full_context_metrics['recall']:.2%}",
            f"{full_context_metrics['f1']:.2%}"
        ],
        [
            'Selective Context (Top 15)',
            f"{selective_metrics['precision']:.2%}",
            f"{selective_metrics['recall']:.2%}",
            f"{selective_metrics['f1']:.2%}"
        ]
    ]

    headers = ['Approach', 'Precision', 'Recall', 'F1 Score']
    table = _create_simple_table(headers, rows, [28, 12, 12, 12])
    print(table)

    selective_vs_full_f1 = selective_metrics['f1'] - full_context_metrics['f1']
    selective_vs_full_recall = selective_metrics['recall'] - full_context_metrics['recall']

    print(f"\nKey Insight:")
    print(f"  F1:     Selective vs Full = {selective_vs_full_f1:+.1%}")
    print(f"  Recall: Selective vs Full = {selective_vs_full_recall:+.1%}")

    if selective_vs_full_f1 > 0.02:
        print("\n[BETTER] Selective context outperforms full context!")
        print("  -> Focused retrieval beats dumping all context")
    elif selective_vs_full_f1 < -0.02:
        print("\n[WORSE] Full context performs slightly better")
    else:
        print("\n[SAME] Both approaches perform similarly")


def build_metrics_dataframe(results: dict) -> pd.DataFrame:
    """
    Build a Diff-Only vs Context-Aware precision/recall/F1 comparison table.

    Args:
        results: Dict with 'diff_only' and 'context_aware' metrics sub-dicts
                 (each with 'precision', 'recall', 'f1' keys)

    Returns:
        DataFrame with one row per approach
    """
    return pd.DataFrame([
        {
            'Approach': 'Diff-Only',
            'Precision': f"{results['diff_only']['precision']:.2%}",
            'Recall': f"{results['diff_only']['recall']:.2%}",
            'F1 Score': f"{results['diff_only']['f1']:.2%}"
        },
        {
            'Approach': 'Context-Aware',
            'Precision': f"{results['context_aware']['precision']:.2%}",
            'Recall': f"{results['context_aware']['recall']:.2%}",
            'F1 Score': f"{results['context_aware']['f1']:.2%}"
        }
    ])


def print_metrics_table(results: dict) -> str:
    """Print a formatted metrics comparison table for terminal."""
    rows = [
        [
            'Diff-Only',
            f"{results['diff_only']['precision']:.2%}",
            f"{results['diff_only']['recall']:.2%}",
            f"{results['diff_only']['f1']:.2%}"
        ],
        [
            'Context-Aware',
            f"{results['context_aware']['precision']:.2%}",
            f"{results['context_aware']['recall']:.2%}",
            f"{results['context_aware']['f1']:.2%}"
        ]
    ]

    headers = ['Approach', 'Precision', 'Recall', 'F1 Score']
    return _create_simple_table(headers, rows, [20, 12, 12, 12])


def print_metrics_summary(results: dict):
    """Print the precision/recall/F1 improvement of context-aware over diff-only."""
    precision_improvement = results['context_aware']['precision'] - results['diff_only']['precision']
    recall_improvement = results['context_aware']['recall'] - results['diff_only']['recall']
    f1_improvement = results['context_aware']['f1'] - results['diff_only']['f1']

    print(
        f"\nContext-Aware Improvements:\n"
        f"  Precision: {precision_improvement:+.1%}\n"
        f"  Recall:    {recall_improvement:+.1%}\n"
        f"  F1 Score:  {f1_improvement:+.1%}"
    )
