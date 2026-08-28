"""
Analysis utilities for understanding reviewer performance patterns.
"""
import pandas as pd
from src.data.sample_prs import load_all_prs


def _create_simple_table(headers: list, rows: list, column_widths: list = None) -> str:
    if column_widths is None:
        column_widths = []
        for i, h in enumerate(headers):
            max_w = len(str(h))
            for row in rows:
                cell_len = len(str(row[i])) if i < len(row) else 0
                max_w = max(max_w, cell_len)
            column_widths.append(min(max_w, 40))

    def format_row(row_data):
        cells = []
        for i, cell in enumerate(row_data):
            w = column_widths[i] if i < len(column_widths) else 15
            cell_str = str(cell)
            cells.append(cell_str.ljust(w))
        return "| " + " | ".join(cells) + " |"

    separator = "+" + "+".join(["-" * (w + 2) for w in column_widths]) + "+"

    lines = [separator, format_row(headers), separator]
    for row in rows:
        lines.append(format_row(row))
    lines.append(separator)

    return "\n".join(lines)


def analyze_findings(results: dict) -> dict:
    """
    Analyze which issues were caught by each approach.

    Args:
        results: Dictionary with evaluation results

    Returns:
        Dictionary with analysis of caught and missed issues
    """
    all_prs = load_all_prs()

    diff_only_results = results['detailed_results']['diff_only']
    context_aware_results = results['detailed_results']['context_aware']

    context_only_issues = []
    missed_by_both = []

    for i, pr in enumerate(all_prs):
        diff_tp = diff_only_results[i]['true_positives']
        context_tp = context_aware_results[i]['true_positives']
        expected = len(pr['expected_issues'])

        if context_tp > diff_tp:
            context_only_issues.extend([
                f"{pr['id']}: {issue}"
                for issue in pr['expected_issues'][:context_tp - diff_tp]
            ])

        if context_tp < expected:
            missed_count = expected - context_tp
            missed_by_both.extend([
                f"{pr['id']}: {issue}"
                for issue in pr['expected_issues'][:missed_count]
            ])

    summary_data = []
    for i, pr in enumerate(all_prs):
        diff_found = diff_only_results[i]['true_positives']
        context_found = context_aware_results[i]['true_positives']

        if context_found > diff_found:
            improvement = '+ Better'
        elif context_found == diff_found:
            improvement = '= Same'
        else:
            improvement = '- Worse'

        summary_data.append({
            'PR ID': pr['id'],
            'Expected': diff_only_results[i]['expected_count'],
            'Diff-Only': diff_found,
            'Context-Aware': context_found,
            'Result': improvement
        })

    summary_table = pd.DataFrame(summary_data)

    return {
        'context_only': context_only_issues[:5],
        'missed_by_both': missed_by_both[:5],
        'table': summary_table
    }


def display_findings_summary(findings_summary: dict):
    """
    Print the context-only / missed-by-both issue lists and show the per-PR table
    produced by analyze_findings().
    """
    context_only_text = "\n".join(f"  - {issue}" for issue in findings_summary['context_only']) or '  (none)'
    missed_by_both_text = "\n".join(f"  - {issue}" for issue in findings_summary['missed_by_both']) or '  (none)'

    print(
        f"Issues caught ONLY with context:\n{context_only_text}\n\n"
        f"Issues missed by BOTH approaches:\n{missed_by_both_text}\n\n"
        "Per-PR Summary:"
    )

    df = findings_summary['table']
    headers = list(df.columns)
    rows = df.values.tolist()

    widths = [max(len(str(h)), max(len(str(r[i])) for r in rows)) for i, h in enumerate(headers)]
    widths = [min(w, 40) for w in widths]

    print(_create_simple_table(headers, rows, widths))
