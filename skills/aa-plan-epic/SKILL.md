---
name: aa-plan-epic
description: Use when the current epic on the roadmap is done and the next pending epic needs to be sliced into worker-ready story cards, or the user invokes /aa-plan-epic.
license: MIT
metadata:
  system: agent-agile
---

# aa-plan-epic

Resolve the Agent-Agile playbook root: use the first of these that exists — (1) `${CLAUDE_PLUGIN_ROOT}/playbooks`, (2) `./.claude/agent-agile/playbooks`, (3) `~/.claude/agent-agile/playbooks`, (4) `~/.agents/agent-agile/playbooks`, (5) `./playbooks`.

Read `playbooks/planner.md` sections "Slicing epics into stories" and "The worker-readiness test", and `playbooks/system.md` section "The memory spine", and follow them exactly; do not re-derive or improvise the slicing process.

## Wiring

1. Read exactly three files — the three-file epic-to-epic read rule from "The memory spine": `.planning/PROJECT.md`, `.planning/ROADMAP.md`, and the previous epic's `LEARNINGS.md`. Read nothing else from prior epics.
2. Identify the next pending epic on the roadmap.
3. Slice it into story cards per `playbooks/planner.md` "Slicing epics into stories": enumerate every shared artifact, assign each one to Wave 0 or to exactly one story, pairwise-check every story's file list against every other story's in the same wave for overlap, and assign waves — Wave 0 (contracts and shared setup), Wave 1 (parallel stories with no cross-story reads), Wave 2 (integration, with an epic-level acceptance check tied to the demo sentence).
4. Write each story card to `epics/EPIC-NN/stories/S*.md` from `playbooks/templates/STORY.md` — one file per story, exactly the four fields: Goal, Files it owns, Acceptance check, Contracts consumed.
5. Run the worker-readiness test from `playbooks/planner.md` "The worker-readiness test" against every card in the epic — no sampling. A card that fails gets split, sharpened, or has its ambiguity moved into Wave 0's `CONTRACTS.md`. Do not report the epic sliced while any card still fails the test.
6. Update `.planning/STATE.md`: phase set to the new epic's wave, what's in progress, the next action, and pointers to the files the next session must read.
