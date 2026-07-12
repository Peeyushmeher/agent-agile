---
name: aa-new-project
description: Use when the user wants to plan a new project from a clear idea, has already run aa-grill, or invokes /aa-new-project. Runs the 8-question intake, drafts PROJECT.md and ROADMAP.md, and slices Epic 1 into worker-ready stories.
license: MIT
metadata:
  system: agent-agile
---

# aa-new-project

Resolve the Agent-Agile playbook root: use the first of these that exists — (1) `${CLAUDE_PLUGIN_ROOT}/playbooks`, (2) `./.claude/agent-agile/playbooks`, (3) `~/.claude/agent-agile/playbooks`, (4) `~/.agents/agent-agile/playbooks`, (5) `./playbooks`.

Read `playbooks/planner.md` sections **The 8 intake questions**, **Pushback patterns**, **Drafting the plan**, **Slicing epics into stories**, **The worker-readiness test**, and **Extracting PREREQS**, in full, and follow them exactly — do NOT re-derive or improvise the system.

## Intake

If `.planning/IDEA.md` exists, read it and, per planner.md's Grill → intake mapping, confirm the pre-filled answers back to the user instead of re-asking them. Ask only the questions the grill didn't answer, plus the three it never answers (hard constraints, riskiest unknown, review-batch appetite) — always fresh. If IDEA.md does not exist, ask all 8 questions from scratch, one at a time, applying the pushback patterns to every thin answer before moving on.

## Drafting

Draft the plan inline in this conversation, following **Drafting the plan** — this is the default; do not spawn a separate agent for this step unless the user asks for it. Produce, in order:

1. `.planning/PROJECT.md` from `playbooks/templates/PROJECT.md`.
2. `.planning/ROADMAP.md` from `playbooks/templates/ROADMAP.md` — every epic, riskiest first, one-line demo sentences; only the current epic (Epic 1) gets full detail.
3. Slice Epic 1 into story cards per **Slicing epics into stories**, writing each from `playbooks/templates/STORY.md`. Apply **The worker-readiness test** to every card before calling it done.
4. `.planning/PREREQS.md` from `playbooks/templates/PREREQS.md` per **Extracting PREREQS**, status `pending` for every row.
5. `.planning/CONFIG.md` from `playbooks/templates/CONFIG.md` — ask the user for smart_tier, cheap_tier, gate, and commercial if not already set.
6. `.planning/STATE.md` from `playbooks/templates/STATE.md`, Phase `intake`, pointing at PROJECT.md, ROADMAP.md, and Epic 1's stories.

## Handoff

If the roadmap has more than one epic, tell the user the plan must go through the panel before anything runs, and instruct them to run `/aa-panel` next — do not start execution first. If the roadmap is a single throwaway epic, the panel is skippable per the playbook's anti-ceremony fast path; say so and name the next command instead.
