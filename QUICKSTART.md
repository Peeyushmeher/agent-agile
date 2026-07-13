# Quickstart

From a rough idea to a working, demoed first slice — no PRD, no config, one sentence to start.

## What you need

- One of: [Claude Code](https://claude.com/claude-code), Codex CLI, or OpenCode
- A rough idea ("an app that tracks my climbing progress") — a sentence is enough

## 1 · Install

**Claude Code** (recommended):

```
/plugin marketplace add Peeyushmeher/agent-agile
/plugin install agent-agile
```

**Codex CLI:** drop into `~/.agents/skills`, or `codex plugin marketplace add`.
**OpenCode / anything else:** `npx agent-agile` and follow the prompts.

## 2 · Your first project, start to demo

Run these in your project directory (empty is fine).

### Step 1 — Get grilled

```
/aa-grill "an app that tracks my climbing progress"
```

Agent-Agile interrogates the idea before planning anything: who's it for, what's the one action that must work, what's deliberately *not* in v1. Vague answers get pushed back on, not accepted. It can tell you the idea isn't worth building — that's a feature.

**You get:** `.planning/IDEA.md` — the locked result of the conversation.

### Step 2 — Turn it into a plan

```
/aa-new-project
```

The 8-question intake (most answers pre-filled from the grill), then the planner produces OKRs — *how you'll know it worked*, not a feature list — an epic roadmap where every epic has a one-sentence demo ("I can do X and see Y"), and story cards for Epic 1 sized so a cheap model can execute each one without guessing.

**You get:** `.planning/PROJECT.md`, `ROADMAP.md`, and Epic 1's story cards.

### Step 3 — Let the critics attack it

```
/aa-panel
```

Four fresh-context critics try to break the plan: wrong thing being built, ambiguous story cards, hidden file collisions, and — for commercial products — whether the market wants it at all. The panel can **kill** the project here, with evidence. A plan killed for the cost of one review is a win.

**You get:** a fixed plan, or an honest reason to stop.

### Step 4 — Do the shopping

Open `.planning/PREREQS.md`. It lists everything only a human can provide — API keys, accounts, payment details. Execution refuses to launch until these are verified, so nothing dies mid-run on a missing key.

### Step 5 — Execute

```
/aa-execute-epic
```

One epic runs as three waves: contracts are frozen first (Wave 0), then parallel cheap workers each build one story against those contracts (Wave 1), then an integrator wires the seams and a fresh-eyes verifier confirms the demo sentence is actually true (Wave 2). Two stories touching the same file is a launch-blocking error, not a merge conflict for later.

Prefer hands-off? `/aa-autopilot --gate checkpoint` chains every epic and pings you between them (`--gate full-auto` doesn't even do that — circuit breakers stop it if things go wrong).

### Step 6 — Review the demo

```
/aa-review
```

You get `DEMO.md`: what was built, the exact steps to try it, and what "working" looks like. Three choices:

| Verdict | What happens |
|---|---|
| **Approve** | Learnings saved, next epic planned |
| **Redo** | Your feedback becomes *new acceptance checks* — the redo can't miss the same point twice |
| **Replan** | Epic goes back to slicing |

Then repeat steps 5–6 per epic (or let autopilot run the loop) until the roadmap is done.

## Coming back later

Everything lives in files — close the terminal whenever.

```
/aa-resume     # picks up exactly where you left off
/aa-status     # roadmap, KR progress, where you are
```

## Which front door?

| You have | Start with |
|---|---|
| A vague spark | `/aa-grill "the idea"` |
| A clear idea, ready to answer questions | `/aa-new-project` |
| An existing plan / PRD / spec | `/aa-import path/to/plan.md` |

## The files, in one line each

Everything the system knows lives in `.planning/` — agents are stateless, files are the memory.

| File | What it is |
|---|---|
| `IDEA.md` | Locked grill output |
| `PROJECT.md` | OKRs, constraints, out-of-scope |
| `ROADMAP.md` | Epic list + demo sentences + status |
| `STATE.md` | The baton — "you are here" |
| `PREREQS.md` | Human shopping list, verified before launch |
| `epics/EPIC-NN/` | Contracts, story cards, reports, `DEMO.md`, learnings |

## Two things worth knowing

- **Cost:** planning runs on the smart model tier and execution on the cheap tier — deliberate. Every ambiguity resolved once at planning time is one a cheap worker doesn't resolve badly, N times, at run time.
- **No timelines:** sprints are scope-boxes, not time-boxes. An epic ends when its demo sentence is true, not on a date. Nothing here will ever estimate a duration.

Stuck? `/aa-help` explains every command and the methodology in five lines.
