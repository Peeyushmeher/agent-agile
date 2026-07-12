# Agent-Agile

*Every other system helps agents build the thing right. Agent-Agile decides if it's the right thing — then builds it right, cheaper.*

An open-source planning + execution system for AI coding agents, installable in Claude Code, Codex CLI, and OpenCode. Bring **a rough idea in one sentence** — no PRD required.

```
rough idea → grill → OKRs → critic panel (can KILL) → prereqs → parallel waves → demo brief
```

---

## Why this exists

Every incumbent planning system — GSD, BMAD, spec-kit, claude-flow, Task Master, and the rest of the 14-system survey behind this project — starts *after* someone has already decided the project is worth building. They're excellent at turning a decision into a plan. None of them help you make the decision, and none of them can tell you to stop.

Agent-Agile ships three capabilities nobody else does: an **OKR/outcome layer** so plans start from "how do we know it worked" instead of a feature list; an **adversarial critic panel with kill authority** — four fresh-context critics attack every plan before a single story runs, and the market critic can kill a project on evidence, not vibes; and **cost-tiered model routing per story**, enforced by a worker-readiness test at slicing time, not left to a global setting nobody revisits.

That expense is deliberate and one-time. Planning gets the smart model because every ambiguity resolved once there saves it being resolved badly, N times, by confused cheap workers later. Popular systems are widely reported to burn 80–100k tokens per story on planning re-reads; our epic→epic memory reads exactly three files — `PROJECT.md`, `ROADMAP.md`, and the previous epic's `LEARNINGS.md`. Never the whole history. Spend once at planning time, save at every run after.

---

## Install

| Harness | Mechanism | Install |
|---|---|---|
| Claude Code | native plugin | `/plugin marketplace add PLACEHOLDER_GITHUB_HANDLE/agent-agile` → `/plugin install agent-agile` |
| Codex CLI | native skills + generated `.codex-plugin/plugin.json` (also falls back to reading `.claude-plugin/`) | drop into `~/.agents/skills` or `codex plugin marketplace add` |
| OpenCode | scans `.claude/skills/` and `.agents/skills/` natively; frontmatter is already the common subset | `npx agent-agile` or manual copy |
| Anyone else | copier script | `npx agent-agile --claude --codex --opencode --global/--local` |

Harness support is deliberately 3, not 15 — see [`docs/DESIGN.md`](docs/DESIGN.md) §10 for why chasing every harness is a trap.

---

## Quickstart

1. Install for your harness (above).
2. `/aa-grill "my rough idea"`
3. Answer the questions — vague answers get pushed back on, not accepted.
4. `/aa-panel` — the critic panel attacks the plan; it can kill it here.
5. Do the shopping in `PREREQS.md` — API keys, accounts, anything only a human can provide.
6. `/aa-autopilot --gate full-auto`

---

## The methodology in 60 seconds

```
OKR          → why the project exists + how we know it worked
Initiative   → a big bet that moves a KR (1–3 per project)
Epic         → one shippable slice = one wave run = one sprint (scope-box)
Story        → one agent's job: self-contained, own files, own acceptance check
```

No level below stories. No story points, no ceremonies, no burndown.

The five dependency rules that structure out parallelism instead of managing it:

- Contracts before code — Wave 0 freezes shared types/schemas/signatures before any worker starts.
- File ownership is the dependency graph — two stories claiming the same file is a launch-blocking collision, not a merge conflict to sort out later.
- Vertical slices over horizontal layers — each story goes its own DB → API → UI, not "everyone touches the API layer."
- Epics are the sync points — run one epic at a time; each ends integrated and demoable.
- Every story self-verifies — its own acceptance check, a real command, before it reports done.

**Review gate:** the worker verifies its own acceptance check → a fresh-context Verifier re-runs checks and confirms the epic's demo sentence is actually true, goal-backward → a human (or the Verifier standing in, in full-auto) reads `DEMO.md` and calls Approve / Redo / Replan. A redo becomes a new acceptance check on the affected stories, so feedback can't be missed twice.

---

## Command reference

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

---

## Comparison

| | Agent-Agile | GSD | BMAD | spec-kit |
|---|---|---|---|---|
| Idea shaping (pre-plan) | Grill can reject the idea | No | No | No |
| Why-layer (OKRs, not features) | Yes | No | No | No |
| Plan review before execution | Adversarial panel, kill authority | Light | Light | No |
| Prereqs gate (human shopping list, verified) | Yes, preflight-blocking | No | No | No |
| Cost model | Per-story tiering, worker-readiness test | Manual/global at best | Manual/global at best | Manual/global at best |
| Parallel execution | Wave-based, file-ownership collision refusal | Wave-based (parity) | No | No |
| Autonomy safety | Circuit breakers, pre-registered kill criteria | Partial | No | No |
| **Where they're ahead** | — | Maturity, install base | Maturity, install base | Maturity, install base |

Agent-Agile plays well with skill packs already installed in your harness — superpowers-style skills run fine inside the parallel workers; nothing here replaces them.

---

## FAQ

**Do I need a PRD?** No. Bring a sentence and run `/aa-grill`. If you already have a PRD, plan, or spec, `/aa-import` reads it, asks only the gaps, and runs the panel with no leniency.

**Can it run unattended?** Yes. `/aa-autopilot --gate full-auto` chains every epic with the Verifier standing in for the human gate, and pre-registered circuit breakers stop it before it builds ten epics on top of a broken one.

**No timelines?** By doctrine. Sprints are scope-boxes, not time-boxes — a sprint ends when the demo sentence is true, not on a date. No durations or estimates appear anywhere in this system.

**License? Token?** MIT. No token, ever.
