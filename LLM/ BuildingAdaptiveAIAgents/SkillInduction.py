import helper as _lesson_helper
_lesson_helper.ensure_schema()

import importlib
from course_lab import m2_notebook

importlib.reload(m2_notebook)
from course_lab.m2_notebook import connect_stack

mem, conn = connect_stack()

## Before skill induction

# Give the agent a real task using the basic v1 skill, and watch it hit an error. This is the mistake we want it to stop repeating.

from course_lab.m2_notebook import show_recurring_failure

PAYOFF_TASK, episodes = show_recurring_failure()

## Loading the agents' traces

from course_lab.coding_trace_synth import LESSON_SKILLS
from course_lab.m2_notebook import print_trace_seed_summary, trace_seed_summary

seed_summary = trace_seed_summary(mem, episodes, LESSON_SKILLS)
print_trace_seed_summary(seed_summary)

## The skill box

# Index the active skills and explore the Skill Box before induction. See the skills available to the agent and which one it currently retrieves for the task.

from course_lab.m2_notebook import (
    build_skill_explorer_app, show_notebook_app, 
    skill_explorer_preview_html,
)
from course_lab.skill_vectorstore import (index_active_skills, 
    search_skill_box)

skill_box = index_active_skills(connection=conn, mem=mem)
before_hit = search_skill_box(skill_box, PAYOFF_TASK, k=1)[0]
skill_app = build_skill_explorer_app(mem)
show_notebook_app(skill_app, skill_explorer_preview_html(mem), 
                  height=525)

## Skill Induction Engine

# See the exact contract given to the LLM, then run the induction engine on the traces to surface a repeated failure and propose an enhanced v2 skill, checkpointed and awaiting review.
from IPython.display import HTML, display
from course_lab.induction_engine import _SYSTEM, induce_all
from course_lab.m2_notebook import (
    engine_contract_html, induced_skill_preview_html, night_outputs,
)

night = night_outputs() 
display(HTML(engine_contract_html(_SYSTEM)))
run_test_episodes = [e for e in episodes if e["topic"] == "run_test_suite"]
proposals = induce_all(run_test_episodes, complete=night)
run_tests_proposal = proposals[0]
display(HTML(induced_skill_preview_html(run_tests_proposal)))

from course_lab.m2_notebook import run_dream

pending = run_dream(mem, run_test_episodes, complete=night, 
                    connection=conn)
print("OracleSaver checkpointed one candidate update.")
print(f"awaiting review: {pending[0].name} v{pending[0].version}")

## Human in loop

# Review the pending proposal, compare it against the current version and approve or reject it with a reason.

from course_lab.m2_notebook import (
    build_review_app, review_preview_html, show_notebook_app,)

review_app, review_state = build_review_app(pending, mem=mem)
show_notebook_app(
    review_app, 
    review_preview_html(mem, pending, review_state), height=900)


## The skill box with enhanced skill

# Re-index the Skill Box and confirm the enhanced skill is now active, replacing the previous version.

from course_lab.m2_notebook import (
    build_skill_explorer_app, show_notebook_app, 
    skill_explorer_preview_html,
)
from course_lab.skill_vectorstore import (index_active_skills, 
    search_skill_box)

skill_box = index_active_skills(connection=conn, mem=mem)
before_hit = search_skill_box(skill_box, PAYOFF_TASK, k=1)[0]
skill_app = build_skill_explorer_app(mem)
show_notebook_app(skill_app, skill_explorer_preview_html(mem), 
                  height=525)

# Agent with enhanced skill

# Search the Skill Box again with the same task and compare what the agent retrieves now versus before, the enhanced skill in action.

from IPython.display import HTML, display
from course_lab.m2_notebook import retrieval_improvement_html

skill_box = index_active_skills(connection=conn, mem=mem)
after_hit = search_skill_box(skill_box, PAYOFF_TASK, k=1)[0]
display(HTML(retrieval_improvement_html(PAYOFF_TASK, before_hit, 
                                        after_hit)))