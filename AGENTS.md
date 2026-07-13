# Agent-Agile

Agent-Agile is an agile planning + execution system for AI coding agents: it grills an idea into shape, plans it as OKRs and epics, attacks the plan with an adversarial critic panel, then executes epics in parallel waves with review gates. It runs the same way across harnesses — Claude Code, Codex CLI, OpenCode — because the logic lives in `playbooks/`, not in per-harness skill files.

## Commands

| Command | Purpose |
|---|---|
| `/aa-grill` | Idea interrogation → IDEA.md (can reject the idea) |
| `/aa-new-project` | 8-question intake → OKRs → epics → Epic 1 stories |
| `/aa-import` | Existing plan: audit → gaps → panel → proceed/reshape/kill |
| `/aa-panel` | Run the critic panel on the current draft plan |
| `/aa-plan-epic` | Slice next epic: contracts scope + story cards + waves |
| `/aa-execute-epic` | Wave 0 → collision check → Wave 1 → Wave 2 |
| `/aa-review` | Present DEMO.md → approve/redo/replan |
| `/aa-autopilot` | Chain all epics; `--gate full-auto\|checkpoint` |
| `/aa-resume` | Read STATE.md, pick up the baton |
| `/aa-status` | Where are we; roadmap + KR progress |
| `/aa-help` | Command guide + methodology crash course |

## Playbook root resolution

Resolve the Agent-Agile playbook root: use the first of these that exists — (1) `${CLAUDE_PLUGIN_ROOT}/playbooks`, (2) `./.claude/agent-agile/playbooks`, (3) `./.agents/agent-agile/playbooks`, (4) `~/.claude/agent-agile/playbooks`, (5) `~/.agents/agent-agile/playbooks`, (6) `./playbooks`.

## Session state

State lives in `.planning/` — open STATE.md first in any session.

## No timelines

Agent-Agile never estimates durations, dates, or deadlines, and never asks you for them. Progress is tracked by what's done against the plan, not by how long it took or should take.
