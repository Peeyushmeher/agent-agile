# Agent-Agile v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public `agent-agile` repo — a planning+execution system for AI coding agents, installable in Claude Code / Codex / OpenCode — per `docs/DESIGN.md` (the spec; read it before any task).

**Architecture:** Thin dispatcher skills (`skills/aa-*/SKILL.md`) + all real logic in `playbooks/` + subagent personas in `agents/` + three small zero-dependency Node scripts (installer, manifest generator, version bumper) + lint tests that enforce portability rules. Canonical Claude-plugin-shaped tree; identical skill files run on all three harnesses.

**Tech Stack:** Markdown; Node.js ≥18 (built-in `node:test`, `node:fs` only — **zero npm dependencies**); git.

**Wave structure for autonomous execution** (tasks within a wave own disjoint files and may run as parallel subagents; waves run in order):

- **Wave 0 (serial):** Task 1 (scaffolding), Task 2 (templates — they are contracts for everything else)
- **Wave 1 (parallel):** Tasks 3, 4, 5, 6 (playbooks), 12, 13, 14, 15, 16 (code + tests)
- **Wave 2 (parallel):** Tasks 7 (agents), 8, 9, 10, 11 (skills), 17 (README)
- **Wave 3 (serial):** Task 18 (integration verify + release prep)

## Global Constraints

Every task implicitly includes these. Verbatim from `docs/DESIGN.md`:

1. **No timelines anywhere** — no durations, estimates, dates-as-deadlines in any shipped content.
2. **SKILL.md frontmatter restricted to:** `name`, `description`, `license`, `metadata`, `allowed-tools` (last one Claude-only, harmless elsewhere). Nothing else.
3. `description` fields state **triggering conditions only** ("Use when…"), never summarize the workflow. Max 1024 chars.
4. Skill/agent/playbook prose speaks in **actions, not tool names**: "dispatch a subagent", "ask the user one question", "run the acceptance command" — never `Task`, `AskUserQuestion`, `Bash`, or any harness-specific tool name.
5. **Never use `@`-include syntax** in any shipped markdown (eager-loads files). Skills say "read `<file>`" instead.
6. **Genericization (banned strings)** in `skills/`, `agents/`, `playbooks/`: `Meher`, `Obsidian`, `vault`, `Yerrslife`, `Opus`, `Sonnet`, `Fable`, `Haiku`. Use "you/the user" and "smart tier"/"cheap tier". (Task 16's lint enforces this.)
7. **Playbook root resolution rule** (must appear verbatim wherever a skill or agent reads a playbook):
   > Resolve the Agent-Agile playbook root: use the first of these that exists — (1) `${CLAUDE_PLUGIN_ROOT}/playbooks`, (2) `./.claude/agent-agile/playbooks`, (3) `~/.claude/agent-agile/playbooks`, (4) `~/.agents/agent-agile/playbooks`, (5) `./playbooks`.
8. **Model tiers:** agent files carry NO model field. Tiers (`smart_tier`, `cheap_tier`) are documented in the CONFIG.md template; orchestrating skills instruct: "spawn this agent with the model configured for its tier in `.planning/CONFIG.md`".
9. Commit after every task with a conventional message; end commit messages with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
10. All shipped content is complete — no TBD/TODO/placeholder text in any file.
11. Line endings: let git handle it; do not add a `.gitattributes` beyond Task 1's.
12. Source material for playbook content (read-only, never linked from shipped files):
    - `C:\Users\meher\agent-agile\docs\DESIGN.md` (primary; authoritative on conflicts)
    - `C:\Users\meher\Desktop\Yerrslife\04_Knowledge\wiki\agent-agile-planning-system.md`
    - `C:\Users\meher\Desktop\Yerrslife\04_Knowledge\wiki\agent-agile-role-playbooks.md`
    - `C:\Users\meher\Desktop\Yerrslife\04_Knowledge\wiki\agent-agile-user-guide.md`
    - `C:\Users\meher\Desktop\Yerrslife\04_Knowledge\wiki\agile-for-agents-research.md`

---

### Task 1: Repo scaffolding + manifests

**Files:**
- Create: `LICENSE`, `.gitignore`, `.gitattributes`, `package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.version-bump.json`, `AGENTS.md`, `CLAUDE.md`

**Interfaces:**
- Produces: plugin name `agent-agile`, version `0.1.0` (all other tasks assume these); directory names `skills/`, `agents/`, `playbooks/`, `scripts/`, `bin/`, `tests/`.

- [ ] **Step 1: Write LICENSE** — standard MIT text, copyright line: `Copyright (c) 2026 Peeyush Yerremsetty`.

- [ ] **Step 2: Write .gitignore and .gitattributes**

`.gitignore`:
```
node_modules/
.planning/
*.log
```
`.gitattributes`:
```
* text=auto eol=lf
```

- [ ] **Step 3: Write package.json**

```json
{
  "name": "agent-agile",
  "version": "0.1.0",
  "description": "Agile planning + execution system for AI coding agents. Grill the idea, plan with OKRs, attack the plan with critics, execute in parallel waves.",
  "type": "module",
  "bin": { "agent-agile": "bin/install.js" },
  "scripts": { "test": "node --test tests/" },
  "keywords": ["claude-code", "codex", "opencode", "skills", "agents", "agile", "okr", "planning"],
  "author": "Peeyush Yerremsetty",
  "license": "MIT"
}
```

- [ ] **Step 4: Write .claude-plugin/plugin.json**

```json
{
  "name": "agent-agile",
  "description": "Agile planning + execution for AI coding agents: grill the idea, plan with OKRs, adversarial critic panel with kill authority, cheap-model story cards, parallel wave execution, demo-brief review gates.",
  "version": "0.1.0",
  "author": { "name": "Peeyush Yerremsetty" },
  "license": "MIT",
  "keywords": ["agile", "okr", "planning", "orchestration", "critics"]
}
```

- [ ] **Step 5: Write .claude-plugin/marketplace.json**

```json
{
  "name": "agent-agile",
  "owner": { "name": "Peeyush Yerremsetty" },
  "plugins": [{ "name": "agent-agile", "source": "./", "description": "Agile planning + execution for AI coding agents." }]
}
```

- [ ] **Step 6: Write .version-bump.json**

```json
{
  "files": [
    { "path": "package.json", "field": "version" },
    { "path": ".claude-plugin/plugin.json", "field": "version" },
    { "path": ".claude-plugin/marketplace.json", "field": "plugins.0.version" }
  ]
}
```

- [ ] **Step 7: Write AGENTS.md** — cross-harness doc, ~40 lines: what Agent-Agile is (2 sentences), the command list from DESIGN §9 as a table, the playbook-root resolution rule (Global Constraint 7 verbatim), "state lives in `.planning/` — open STATE.md first in any session", and the no-timelines rule. Write `CLAUDE.md` containing exactly: `See AGENTS.md.`

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: scaffolding, manifests, cross-harness docs"`

---

### Task 2: Templates (the contracts)

**Files:**
- Create: `playbooks/templates/IDEA.md`, `PROJECT.md`, `ROADMAP.md`, `STATE.md`, `PREREQS.md`, `CONFIG.md`, `STORY.md`, `DEMO.md`, `LEARNINGS.md`, `CONTRACTS.md` (10 files under `playbooks/templates/`)

**Interfaces:**
- Produces: the exact file formats every playbook, skill, and `scripts/collision-check.js` rely on. **The STORY.md "files-owned" fence format below is load-bearing** — collision-check parses it.

- [ ] **Step 1: Write all 10 templates.** Each is a skeleton with `<angle-bracket>` slots and a one-line HTML comment at top saying what fills it and when. Required structures:

`STORY.md` (the 4-field card — collision-check parses the fenced block):
````markdown
# S<N>: <goal in one sentence>

**Goal:** <one sentence>

**Files it owns:**
```files
<one relative path per line — this story may touch ONLY these files>
```

**Acceptance check:** <runnable command or verifiable assertion, with expected output>

**Contracts consumed:** <sections of CONTRACTS.md this story reads, or "none">
````

`STATE.md` (the baton — tiny by design):
```markdown
# STATE — you are here
- **Project:** <name> | **Phase:** <grill|intake|panel|prereqs|epic-NN-waveN|review|done>
- **Now:** <one sentence: what is in progress right now>
- **Next:** <one sentence: the next action>
- **Pointers:** <files the next session must read, max 3>
- **Blockers:** <none | description>
```

`CONFIG.md`:
```markdown
# CONFIG
- **smart_tier:** <model for planner/critics/contracts/integrator/verifier — your harness's strongest>
- **cheap_tier:** <model for story workers — cheapest that passes worker-ready cards>
- **gate:** <interactive | checkpoint | full-auto>
- **commercial:** <yes|no — yes adds the market critic to panels>
```

`PREREQS.md`: table with columns `Item | Why needed | Where to get it | Est. cost | Where to put it (env var/path) | Status (todo/done/verified)`.

`IDEA.md`: sections `Problem`, `Exact user` (a describable person, never "everyone"), `The one action`, `Why now / why switch`, `Non-goals`, `Success signal` (a number). Header comment: "Locked at grill close. The planner may not reinterpret this."

`PROJECT.md`: `Objective` (one sentence), `Key Results` (2–4, each measurable/outcome/falsifiable), `Initiatives` (1–3), `Hard constraints`, `Out of scope`, `Key decisions` table.

`ROADMAP.md`: epic table `# | Epic | Demo sentence | Serves initiative | Status (pending/planned/running/verified/approved)` — riskiest first, Epic 1 = walking skeleton.

`CONTRACTS.md`: sections `Types`, `API endpoints`, `Data schema`, `Interfaces/signatures`, `Conventions`; header comment: "Written in Wave 0. FROZEN during the wave — workers consume, never negotiate."

`DEMO.md`: sections `What was built`, `How to test it` (exact steps/URL/commands), `What to look for` (what working looks like + edge cases to poke).

`LEARNINGS.md`: sections `Deviations from plan`, `Gotchas discovered`, `Contract changes`, `Advice to the next epic's planner`.

- [ ] **Step 2: Verify** — every template contains zero banned strings (Global Constraint 6) and no TODO/TBD: `grep -riE "TODO|TBD|Meher|Obsidian|Opus|Sonnet" playbooks/templates/` → no matches.

- [ ] **Step 3: Commit** — `git commit -m "feat: planning artifact templates (the file-format contracts)"`

---

### Task 3: playbooks/system.md

**Files:**
- Create: `playbooks/system.md`

**Interfaces:**
- Consumes: template formats from Task 2 (reference them by path `playbooks/templates/<name>.md`).
- Produces: sections titled exactly: `The hierarchy`, `The memory spine`, `Sprints are scope-boxes`, `The five dependency rules`, `Model & cost policy`, `The review gate`, `Fail-fast structure`, `Per-project output format` (skills/agents reference these titles).

- [ ] **Step 1: Write the file.** Port DESIGN.md §3.1–3.2, §4, §5 (dependency rules), §6 (gate), plus the source system spec (Global Constraint 12, doc 2) — genericized per Constraint 6. Must include verbatim-in-spirit: the OKR→Initiative→Epic→Story hierarchy with the 3 KR tests; the memory-spine tree with per-file purpose; "if a fact isn't in a file, it doesn't exist"; the session protocol (open with STATE.md, close with one STATE.md update); the epic→epic three-file read rule; the 5 dependency rules; scope-boxes-not-time-boxes; "spend at planning time, save at run time" with the tier table (smart: intake/contracts/integration/verification, cheap: story workers); the worker-readiness test ("the card is wrong, not the model"); walking-skeleton Epic 1; approve/redo/replan with tips-become-acceptance-checks. ~200–300 lines.

- [ ] **Step 2: Verify + commit** — banned-string grep clean; `git commit -m "feat: system playbook (methodology core)"`

---

### Task 4: playbooks/planner.md

**Files:**
- Create: `playbooks/planner.md`

**Interfaces:**
- Produces: sections titled exactly: `The Grill`, `The 8 intake questions`, `Pushback patterns`, `Drafting the plan`, `Slicing epics into stories`, `The worker-readiness test`, `Extracting PREREQS`, `Import path`.

- [ ] **Step 1: Write the file.** Sources: DESIGN §2 (all), §3.2, §3.4; vault role-playbooks §1 (planner playbook — port its pushback patterns and intake scripts verbatim, genericized). Required content:
  - **The Grill:** the attack list from DESIGN §2.1 as an ordered interrogation script; one question at a time; forced-choice narrowing on vague answers; explicit rejection rules ("everyone" is not a user; "it'd be cool" is not a why); output = `.planning/IDEA.md` per template; the griller may end with "don't build this" + reasons; grill answers pre-fill intake (map each grill question → which intake question it answers).
  - **The 8 intake questions** verbatim from DESIGN §2.2, each with: why it's asked, what a thin answer looks like, the pushback move.
  - **Drafting:** per-project output format (OKRs → initiatives → ordered epics with demo sentences → full stories for current epic only).
  - **Slicing:** vertical slices, file-ownership assignment, wave assignment, worker-readiness test applied per card with the split/sharpen/move-to-contracts remedies.
  - **Extracting PREREQS:** the checklist of prereq categories (API keys, paid services, accounts, domains, OAuth apps, hardware) and the rule: write what/where/cost/env-var per PREREQS.md template.
  - **Import path:** DESIGN §2.3 as a step-by-step procedure.

- [ ] **Step 2: Verify + commit** — banned-string grep clean; `git commit -m "feat: planner playbook (grill, intake, slicing, prereqs, import)"`

---

### Task 5: playbooks/critics.md

**Files:**
- Create: `playbooks/critics.md`

**Interfaces:**
- Produces: sections titled exactly: `Panel protocol`, `Product critic`, `Spec auditor`, `Execution auditor`, `Market critic`, `Verdict format`.

- [ ] **Step 1: Write the file.** Sources: DESIGN §3.3; vault role-playbooks critic sections (port attack lists, weasel-word hunts, hidden-shared-files checklist verbatim, genericized); vault research doc for the market-critic method. Required content:
  - **Panel protocol:** critics run as parallel fresh-context subagents on the smart tier; each gets its playbook section verbatim + the full draft plan; they attack, never rewrite; findings = BLOCK (planner must fix) or FLAG (surface to user); panel runs for multi-epic projects only.
  - **Product critic:** attacks OKRs/epics/out-of-scope; catches output-KRs (each KR tested against the 3 tests), scope creep, epics serving no initiative.
  - **Spec auditor:** runs the worker-readiness test on EVERY story card; hunts ambiguity and weasel words; **prereq hunt** — scan every story for external services/keys/accounts not in PREREQS.md (misses are BLOCKs).
  - **Execution auditor:** intersects all file-ownership lists; hunts hidden shared files (configs, routers, schema files, lockfiles); flags oversized epics (won't fit one orchestrated run) and Wave 0 contracts that leave decisions to workers.
  - **Market critic:** commercial products only; the only critic with web access (degrade rule per DESIGN §3.3); method: validation checklist, competitor buckets, 7-Powers indie filter, pricing corridor, pre-registered kill criteria; verdicts PROCEED/RESHAPE/KILL with evidence.
  - **Verdict format:** exact markdown block each critic returns (critic name, verdict, BLOCKs list with location+why+suggested fix, FLAGs list).

- [ ] **Step 2: Verify + commit** — `git commit -m "feat: critics playbook (panel protocol + four attack lenses)"`

---

### Task 6: playbooks/execution.md

**Files:**
- Create: `playbooks/execution.md`

**Interfaces:**
- Consumes: STORY.md `files` fence format (Task 2), `scripts/collision-check.js` CLI contract (Task 12): `node scripts/collision-check.js <epic-dir>` → exit 0 clean / exit 1 with JSON collision report on stdout.
- Produces: sections titled exactly: `Wave 0 — contracts`, `Pre-flight`, `Wave 1 — stories`, `Wave 2 — integrate`, `Verification`, `The review gate`, `Autopilot`, `Circuit breakers`, `Resume protocol`.

- [ ] **Step 1: Write the file.** Sources: DESIGN §5, §6, §7. Required content:
  - **Wave 0:** one smart-tier agent writes CONTRACTS.md from the epic's stories' `Contracts consumed` needs; frozen after.
  - **Pre-flight:** run the collision check (command above); any collision → refuse, name the colliding stories/files, send back to slicing. Verify PREREQS.md: every row `verified` (or `done` where verification impossible); run stated verification commands where present.
  - **Wave 1:** one fresh-context cheap-tier subagent per story; input = its card + CONTRACTS.md only; worker must run its acceptance check before reporting; write `stories/SN.report.md` (3–5 lines: what was built, check result, deviations); fail → one retry → still failing → flag, don't merge.
  - **Wave 2:** smart-tier integrator: concatenate reports into REPORTS.md, wire cross-story seams, run epic-level check (the demo sentence, exercised for real), write DEMO.md + LEARNINGS.md per templates, flip ROADMAP.md status, update STATE.md.
  - **Verification:** smart-tier verifier, fresh context, goal-backward: is the demo sentence TRUE; re-run acceptance checks; poke DEMO.md edge cases; check KR movement. Output: pass / redo-list.
  - **Review gate:** approve/redo/replan mechanics; redo converts tips into new acceptance checks on affected stories, then re-run the wave.
  - **Autopilot:** the epic loop; gate modes (interactive/checkpoint/full-auto — verifier stands in, demo briefs accumulate); preflight required before launch.
  - **Circuit breakers:** epic fails verification twice after a redo → STOP + STATE.md writeout; missing prereq mid-run → STOP, add to PREREQS.md, notify; NEVER fake credentials or mock a missing paid service silently.
  - **Resume protocol:** read STATE.md → read its ≤3 pointers → continue; close every session with one STATE.md update.

- [ ] **Step 2: Verify + commit** — `git commit -m "feat: execution playbook (waves, gates, autopilot, circuit breakers)"`

---

### Task 7: Agent personas (9 files)

**Files:**
- Create: `agents/aa-planner.md`, `agents/aa-critic-product.md`, `agents/aa-critic-spec.md`, `agents/aa-critic-execution.md`, `agents/aa-critic-market.md`, `agents/aa-contractor.md`, `agents/aa-worker.md`, `agents/aa-integrator.md`, `agents/aa-verifier.md`

**Interfaces:**
- Consumes: playbook section titles from Tasks 3–6 (reference sections by exact title); playbook-root resolution rule (Global Constraint 7).
- Produces: agent names as listed (skills spawn them by these names).

- [ ] **Step 1: Write all 9 agents.** Uniform format — frontmatter:
```yaml
---
name: aa-worker
description: <one sentence: role + when it is spawned. No workflow summary.>
---
```
No `model` field (Global Constraint 8). Body per agent (~30–60 lines each): identity (one paragraph), "resolve the playbook root (rule verbatim), read `<playbook>.md` section(s) `<titles>` and follow exactly", inputs it receives, output it must produce (exact artifact/format), and 3–5 hard rules. Specifics:
  - `aa-planner`: reads planner.md + system.md entire; used by intake/import/plan-epic skills.
  - Four critics: each reads critics.md `Panel protocol` + own section ONLY; returns the Verdict format block; told "you attack, you never rewrite; find what is wrong, assume something is."
  - `aa-contractor`: reads execution.md `Wave 0 — contracts`; writes CONTRACTS.md; told contract errors cascade into every worker.
  - `aa-worker`: reads NOTHING but its story card + CONTRACTS.md (explicitly forbidden from exploring the repo beyond its owned files + contracts); builds; runs its acceptance check; writes its report file; hard rule: "if you cannot complete from the card alone, STOP and report the card as not worker-ready — do not improvise."
  - `aa-integrator`: reads execution.md `Wave 2 — integrate`.
  - `aa-verifier`: reads execution.md `Verification`; fresh-eyes rule: "you did not write this code; assume the demo sentence is false until you prove it true."

- [ ] **Step 2: Verify + commit** — banned strings clean; every referenced playbook section title exists (`grep` each); `git commit -m "feat: nine agent personas"`

---

### Task 8: Front-door skills (aa-grill, aa-new-project, aa-import)

**Files:**
- Create: `skills/aa-grill/SKILL.md`, `skills/aa-new-project/SKILL.md`, `skills/aa-import/SKILL.md`

**Interfaces:**
- Consumes: playbook root rule; planner.md section titles (Task 4); agent names (Task 7); templates paths (Task 2).

- [ ] **Step 1: Write the three skills.** Dispatcher format, ≤60 lines each. Frontmatter (all skills in Tasks 8–11):
```yaml
---
name: aa-grill
description: Use when the user has a rough or vague product idea that needs interrogation before any planning — or invokes /aa-grill. Locks the idea into .planning/IDEA.md or recommends against building it.
license: MIT
metadata:
  system: agent-agile
---
```
Body pattern: (1) playbook-root rule verbatim; (2) which playbook sections to read and follow exactly ("do NOT re-derive or improvise the system"); (3) skill-specific wiring. Wiring specifics:
  - `aa-grill`: runs in the main loop (no subagent — it's a conversation); one question at a time; ends by writing `.planning/IDEA.md` from the template + updating STATE.md; offers `/aa-new-project` as next step and states which intake questions are already pre-filled.
  - `aa-new-project`: if `.planning/IDEA.md` exists, confirm pre-filled answers instead of re-asking; run the 8 questions per planner.md; then draft the plan (planner behavior inline in main loop OR spawn `aa-planner` — inline is default); write PROJECT.md/ROADMAP.md/PREREQS.md/CONFIG.md/STATE.md + Epic 1 stories from templates; then instruct: multi-epic → run `/aa-panel` before anything else.
  - `aa-import`: takes a path/description of an existing plan doc as argument; follow planner.md `Import path`; then run the panel; three exits (proceed/reshape/kill) per playbook.

- [ ] **Step 2: Verify + commit** — frontmatter keys ⊆ allowed set; descriptions start "Use when"; `git commit -m "feat: front-door skills (grill, new-project, import)"`

---

### Task 9: Planning skills (aa-panel, aa-plan-epic)

**Files:**
- Create: `skills/aa-panel/SKILL.md`, `skills/aa-plan-epic/SKILL.md`

**Interfaces:**
- Consumes: critics.md sections + Verdict format (Task 5); agent names (Task 7); CONFIG.md tier/commercial fields (Task 2).

- [ ] **Step 1: Write both skills.** Same dispatcher format as Task 8.
  - `aa-panel`: read `.planning/` plan artifacts; spawn `aa-critic-product`, `aa-critic-spec`, `aa-critic-execution` as **parallel fresh subagents on the smart tier** (per CONFIG.md), plus `aa-critic-market` if CONFIG says commercial; give each its critics.md section verbatim + the full draft; collect Verdict blocks; fix every BLOCK (re-draft via planner behavior); present remaining FLAGs + fixed plan to the user for the gate; on market-critic KILL → present evidence, recommend stopping, write LEARNINGS.md if user agrees.
  - `aa-plan-epic`: read PROJECT.md + ROADMAP.md + previous epic's LEARNINGS.md (**exactly these three** — the context-budget rule); slice the next pending epic per planner.md `Slicing epics into stories`; write `epics/EPIC-NN/stories/S*.md` from the STORY template; every card must pass the worker-readiness test before the skill reports done; update STATE.md.

- [ ] **Step 2: Verify + commit** — `git commit -m "feat: planning skills (panel, plan-epic)"`

---

### Task 10: Execution skills (aa-execute-epic, aa-autopilot)

**Files:**
- Create: `skills/aa-execute-epic/SKILL.md`, `skills/aa-autopilot/SKILL.md`

**Interfaces:**
- Consumes: execution.md sections (Task 6); agent names (Task 7); `node scripts/collision-check.js <epic-dir>` contract (Task 12).

- [ ] **Step 1: Write both skills.**
  - `aa-execute-epic`: orchestrator stays lean (dispatch + collect, never writes code). Sequence per execution.md: spawn `aa-contractor` (smart tier) → run collision check via the script (a collision or missing/unverified PREREQS row → refuse + explain) → spawn one `aa-worker` per story (cheap tier, parallel, each given only its card + CONTRACTS.md) → spawn `aa-integrator` (smart tier) → spawn `aa-verifier` (smart tier) → present DEMO.md at the gate per CONFIG gate mode.
  - `aa-autopilot`: parse `--gate full-auto|checkpoint` argument (else CONFIG.md value); preflight PREREQS; loop: `/aa-plan-epic` behavior → `/aa-execute-epic` behavior → gate (full-auto: verifier verdict decides; checkpoint: notify user between epics; interactive: stop at each gate) → LEARNINGS + ROADMAP flip → next epic; circuit breakers verbatim from execution.md (`Circuit breakers` section); on any stop, STATE.md must say exactly where and why.

- [ ] **Step 2: Verify + commit** — `git commit -m "feat: execution skills (execute-epic, autopilot)"`

---

### Task 11: Utility skills (aa-review, aa-resume, aa-status, aa-help)

**Files:**
- Create: `skills/aa-review/SKILL.md`, `skills/aa-resume/SKILL.md`, `skills/aa-status/SKILL.md`, `skills/aa-help/SKILL.md`

**Interfaces:**
- Consumes: execution.md `The review gate`, `Resume protocol`; DESIGN §9 command table (for aa-help).

- [ ] **Step 1: Write the four skills.**
  - `aa-review`: read current epic's DEMO.md; walk the user through it; take approve/redo/replan; redo → convert user tips into new acceptance-check lines on the named story cards, then instruct re-running `/aa-execute-epic`; replan → mark epic pending + flag downstream epics for re-examination; update STATE/ROADMAP.
  - `aa-resume`: resume protocol verbatim; if no `.planning/` exists, say so and point at the three front doors.
  - `aa-status`: render ROADMAP table + STATE summary + KR progress (from PROJECT.md) + outstanding PREREQS rows; read-only.
  - `aa-help`: the DESIGN §9 command table + the funnel one-liner (`rough idea → grill → intake → plan → panel → prereqs → waves → demo`) + 5-line methodology crash course; read-only, no playbook load.

- [ ] **Step 2: Verify + commit** — `git commit -m "feat: utility skills (review, resume, status, help)"`

---

### Task 12: scripts/collision-check.js (TDD)

**Files:**
- Create: `scripts/collision-check.js`, `tests/collision-check.test.js`

**Interfaces:**
- Consumes: STORY.md `files` fence (Task 2).
- Produces: CLI `node scripts/collision-check.js <epic-dir>` — scans `<epic-dir>/stories/S*.md` (excluding `*.report.md`), exit 0 + `{"ok":true}` if all `files` fences are pairwise disjoint; exit 1 + `{"ok":false,"collisions":[{"file":"p","stories":["S1.md","S3.md"]}]}` otherwise.

- [ ] **Step 1: Write the failing test** (`tests/collision-check.test.js`):

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function makeEpic(stories) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-epic-'));
  mkdirSync(join(dir, 'stories'));
  for (const [name, files] of Object.entries(stories)) {
    writeFileSync(join(dir, 'stories', name),
      `# ${name}\n**Files it owns:**\n\`\`\`files\n${files.join('\n')}\n\`\`\`\n`);
  }
  return dir;
}

test('disjoint stories pass', () => {
  const dir = makeEpic({ 'S1.md': ['src/a.js'], 'S2.md': ['src/b.js'] });
  const out = execFileSync('node', ['scripts/collision-check.js', dir], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(out), { ok: true });
});

test('colliding stories fail with the file named', () => {
  const dir = makeEpic({ 'S1.md': ['src/a.js', 'src/shared.js'], 'S2.md': ['src/shared.js'] });
  let failed = false;
  try {
    execFileSync('node', ['scripts/collision-check.js', dir], { encoding: 'utf8' });
  } catch (e) {
    failed = true;
    const report = JSON.parse(e.stdout);
    assert.equal(report.ok, false);
    assert.deepEqual(report.collisions, [{ file: 'src/shared.js', stories: ['S1.md', 'S2.md'] }]);
  }
  assert.ok(failed, 'expected exit code 1');
});

test('report files are ignored', () => {
  const dir = makeEpic({ 'S1.md': ['src/a.js'], 'S1.report.md': ['src/a.js'] });
  const out = execFileSync('node', ['scripts/collision-check.js', dir], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(out), { ok: true });
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test tests/collision-check.test.js` → FAIL (script missing).

- [ ] **Step 3: Implement** (`scripts/collision-check.js`):

```js
#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const epicDir = process.argv[2];
if (!epicDir) { console.error('usage: collision-check.js <epic-dir>'); process.exit(2); }

const storiesDir = join(epicDir, 'stories');
const cards = readdirSync(storiesDir)
  .filter(f => /^S\d+.*\.md$/.test(f) && !f.endsWith('.report.md'));

const owners = new Map(); // file path -> [story names]
for (const card of cards) {
  const body = readFileSync(join(storiesDir, card), 'utf8');
  const m = body.match(/```files\n([\s\S]*?)```/);
  if (!m) continue;
  for (const line of m[1].split('\n').map(s => s.trim()).filter(Boolean)) {
    if (!owners.has(line)) owners.set(line, []);
    owners.get(line).push(card);
  }
}

const collisions = [...owners.entries()]
  .filter(([, s]) => s.length > 1)
  .map(([file, stories]) => ({ file, stories: stories.sort() }));

if (collisions.length) { console.log(JSON.stringify({ ok: false, collisions })); process.exit(1); }
console.log(JSON.stringify({ ok: true }));
```

- [ ] **Step 4: Run tests to verify pass** — `node --test tests/collision-check.test.js` → 3 pass.

- [ ] **Step 5: Commit** — `git commit -m "feat: collision-check script (file-ownership pre-flight)"`

---

### Task 13: scripts/gen-codex-manifests.js (TDD)

**Files:**
- Create: `scripts/gen-codex-manifests.js`, `tests/gen-manifests.test.js`

**Interfaces:**
- Consumes: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (Task 1).
- Produces: `.codex-plugin/plugin.json` (same fields + `"skills": "./skills/"`), `.agents/plugins/marketplace.json` (name/owner/plugins mirror). Run via `node scripts/gen-codex-manifests.js` from repo root.

- [ ] **Step 1: Write the failing test** (`tests/gen-manifests.test.js`):

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

test('generates codex manifests mirroring claude manifests', () => {
  execFileSync('node', ['scripts/gen-codex-manifests.js']);
  const claude = JSON.parse(readFileSync('.claude-plugin/plugin.json', 'utf8'));
  const codex = JSON.parse(readFileSync('.codex-plugin/plugin.json', 'utf8'));
  assert.equal(codex.name, claude.name);
  assert.equal(codex.version, claude.version);
  assert.equal(codex.skills, './skills/');
  const mkt = JSON.parse(readFileSync('.agents/plugins/marketplace.json', 'utf8'));
  assert.equal(mkt.plugins[0].name, claude.name);
});
```

- [ ] **Step 2: Run to verify FAIL**, then **Step 3: Implement**:

```js
#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const plugin = JSON.parse(readFileSync('.claude-plugin/plugin.json', 'utf8'));
const marketplace = JSON.parse(readFileSync('.claude-plugin/marketplace.json', 'utf8'));

mkdirSync('.codex-plugin', { recursive: true });
writeFileSync('.codex-plugin/plugin.json',
  JSON.stringify({ ...plugin, skills: './skills/' }, null, 2) + '\n');

mkdirSync('.agents/plugins', { recursive: true });
writeFileSync('.agents/plugins/marketplace.json',
  JSON.stringify({
    name: marketplace.name,
    owner: marketplace.owner,
    plugins: marketplace.plugins.map(p => ({ name: p.name, source: { source: 'url', url: './' }, description: p.description }))
  }, null, 2) + '\n');

console.log('generated .codex-plugin/plugin.json and .agents/plugins/marketplace.json');
```

- [ ] **Step 4: Run tests → PASS. Run the script once so the generated manifests are committed.**

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: codex manifest generator + generated manifests"`

---

### Task 14: bin/install.js (TDD)

**Files:**
- Create: `bin/install.js`, `tests/install.test.js`

**Interfaces:**
- Produces: CLI `node bin/install.js [--claude|--codex|--opencode] [--global|--local] [--dry-run] [--dest <dir>]`. Copies: `skills/*` → `<root>/skills/`, `agents/*` → `<root>/agents/`, `playbooks/` → `<root>/agent-agile/playbooks/`. Roots: claude global `~/.claude`, claude local `./.claude`, codex global `~/.agents`, codex local `./.agents`. `--opencode` prints "OpenCode reads Claude skill paths natively — installing to Claude paths." and behaves as `--claude`. `--dest` overrides the root (used by tests). `--dry-run` prints the copy list, writes nothing.

- [ ] **Step 1: Write the failing test** (`tests/install.test.js`):

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('installs skills, agents, playbooks into dest', () => {
  const dest = mkdtempSync(join(tmpdir(), 'aa-install-'));
  execFileSync('node', ['bin/install.js', '--claude', '--dest', dest]);
  assert.ok(existsSync(join(dest, 'skills', 'aa-grill', 'SKILL.md')));
  assert.ok(existsSync(join(dest, 'agents', 'aa-worker.md')));
  assert.ok(existsSync(join(dest, 'agent-agile', 'playbooks', 'system.md')));
});

test('dry-run writes nothing', () => {
  const dest = mkdtempSync(join(tmpdir(), 'aa-dry-'));
  const out = execFileSync('node', ['bin/install.js', '--claude', '--dest', dest, '--dry-run'], { encoding: 'utf8' });
  assert.match(out, /skills[\\/]aa-grill/);
  assert.ok(!existsSync(join(dest, 'skills')));
});
```

- [ ] **Step 2: Run → FAIL. Step 3: Implement** (`bin/install.js`):

```js
#!/usr/bin/env node
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const has = f => args.includes(f);
const destFlag = args.indexOf('--dest');

let harness = has('--codex') ? 'codex' : 'claude';
if (has('--opencode')) {
  console.log('OpenCode reads Claude skill paths natively - installing to Claude paths.');
  harness = 'claude';
}
const local = has('--local');
const root = destFlag !== -1 ? args[destFlag + 1]
  : harness === 'codex'
    ? (local ? join(process.cwd(), '.agents') : join(homedir(), '.agents'))
    : (local ? join(process.cwd(), '.claude') : join(homedir(), '.claude'));

const jobs = [];
for (const skill of readdirSync(join(src, 'skills')))
  jobs.push([join(src, 'skills', skill), join(root, 'skills', skill)]);
for (const agent of readdirSync(join(src, 'agents')))
  jobs.push([join(src, 'agents', agent), join(root, 'agents', agent)]);
jobs.push([join(src, 'playbooks'), join(root, 'agent-agile', 'playbooks')]);

for (const [from, to] of jobs) {
  console.log(`${has('--dry-run') ? '[dry-run] ' : ''}${from} -> ${to}`);
  if (!has('--dry-run')) { mkdirSync(dirname(to), { recursive: true }); cpSync(from, to, { recursive: true }); }
}
console.log(has('--dry-run') ? 'Dry run - nothing written.' : `Installed agent-agile to ${root}. Run /aa-help to start.`);
```

- [ ] **Step 4: Run tests → PASS.** (Note: tests depend on Tasks 3–11 outputs existing; in wave execution this test may be authored before skills exist — write it, and Task 18 runs the full suite green.)

- [ ] **Step 5: Commit** — `git commit -m "feat: npx installer"`

---

### Task 15: scripts/bump-version.js (TDD)

**Files:**
- Create: `scripts/bump-version.js`, `tests/bump-version.test.js`

**Interfaces:**
- Consumes: `.version-bump.json` registry (Task 1).
- Produces: CLI `node scripts/bump-version.js <new-version>` — sets the field (dot-path) in every registered file.

- [ ] **Step 1: Failing test** (`tests/bump-version.test.js`):

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

test('bumps every registered manifest in lockstep', () => {
  const registry = JSON.parse(readFileSync('.version-bump.json', 'utf8'));
  const before = registry.files.map(f => readFileSync(f.path, 'utf8'));
  try {
    execFileSync('node', ['scripts/bump-version.js', '9.9.9-test']);
    for (const f of registry.files) {
      const doc = JSON.parse(readFileSync(f.path, 'utf8'));
      const val = f.field.split('.').reduce((o, k) => o[k], doc);
      assert.equal(val, '9.9.9-test', `${f.path} ${f.field}`);
    }
  } finally {
    registry.files.forEach((f, i) => writeFileSync(f.path, before[i]));
  }
});
```

- [ ] **Step 2: Run → FAIL. Step 3: Implement:**

```js
#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+/.test(version ?? '')) { console.error('usage: bump-version.js <semver>'); process.exit(2); }

const registry = JSON.parse(readFileSync('.version-bump.json', 'utf8'));
for (const { path, field } of registry.files) {
  const doc = JSON.parse(readFileSync(path, 'utf8'));
  const keys = field.split('.');
  let node = doc;
  for (const k of keys.slice(0, -1)) node = node[k];
  node[keys.at(-1)] = version;
  writeFileSync(path, JSON.stringify(doc, null, 2) + '\n');
  console.log(`${path} ${field} -> ${version}`);
}
```

- [ ] **Step 4: Run → PASS. Step 5: Commit** — `git commit -m "feat: lockstep version bumper"`

---

### Task 16: tests/lint.test.js (portability enforcement)

**Files:**
- Create: `tests/lint.test.js`

**Interfaces:**
- Consumes: everything in `skills/`, `agents/`, `playbooks/`.

- [ ] **Step 1: Write the test file** (it will fail until Tasks 2–11 are complete — that's its job in Wave-3 verification):

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED_KEYS = new Set(['name', 'description', 'license', 'metadata', 'allowed-tools']);
const BANNED = /Meher|Obsidian|vault|Yerrslife|\bOpus\b|\bSonnet\b|\bFable\b|\bHaiku\b/;

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.md')) yield p;
  }
}

function frontmatter(body) {
  const m = body.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const keys = m[1].split('\n').filter(l => /^[a-z-]+:/.test(l)).map(l => l.split(':')[0]);
  const desc = m[1].match(/^description:\s*(.*)$/m);
  const name = m[1].match(/^name:\s*(.*)$/m);
  return { keys, description: desc?.[1] ?? '', name: name?.[1]?.trim() ?? '' };
}

test('skill frontmatter: allowed keys, dir-matching name, trigger-only description', () => {
  for (const dir of readdirSync('skills')) {
    const body = readFileSync(join('skills', dir, 'SKILL.md'), 'utf8');
    const fm = frontmatter(body);
    assert.ok(fm, `${dir}: missing frontmatter`);
    for (const k of fm.keys) assert.ok(ALLOWED_KEYS.has(k), `${dir}: illegal frontmatter key '${k}'`);
    assert.equal(fm.name, dir, `${dir}: name must match directory`);
    assert.ok(fm.description.startsWith('Use when'), `${dir}: description must start with 'Use when'`);
    assert.ok(fm.description.length <= 1024, `${dir}: description too long`);
  }
});

test('no banned strings, no @-includes, in shipped content', () => {
  for (const root of ['skills', 'agents', 'playbooks']) {
    for (const file of walk(root)) {
      const body = readFileSync(file, 'utf8');
      assert.ok(!BANNED.test(body), `${file}: contains banned string`);
      assert.ok(!/^@\.?\//m.test(body), `${file}: uses @-include`);
      assert.ok(!/\b(TODO|TBD)\b/.test(body), `${file}: placeholder text`);
    }
  }
});

test('every referenced playbook file exists', () => {
  for (const root of ['skills', 'agents']) {
    for (const file of walk(root)) {
      const body = readFileSync(file, 'utf8');
      for (const [, ref] of body.matchAll(/playbooks\/([\w./-]+\.md)/g))
        assert.ok(existsSync(join('playbooks', ref)), `${file}: references missing playbooks/${ref}`);
    }
  }
});
```

- [ ] **Step 2: Run** — `node --test tests/lint.test.js`. In wave execution this may fail until all content tasks land; record status. **Step 3: Commit** — `git commit -m "test: portability lint (frontmatter subset, banned strings, reference integrity)"`

---

### Task 17: README.md

**Files:**
- Create: `README.md`
- Modify: none

**Interfaces:**
- Consumes: DESIGN §1 (positioning), §9 (commands), §10 (install table).

- [ ] **Step 1: Write README.** Sections, in order:
  1. **Hero:** name + one-liner: *"Every other system helps agents build the thing right. Agent-Agile decides if it's the right thing — then builds it right, cheaper."* Then the funnel line: `rough idea → grill → OKRs → critic panel (can KILL) → prereqs → parallel waves → demo brief`.
  2. **Why this exists** — 3 short paragraphs: (a) every incumbent starts after someone decided the project is worth building; (b) the three capabilities nobody else ships: OKR layer, adversarial kill-gate panel, per-story cost tiering; (c) token-burn honesty: planning is deliberately expensive ONCE so execution runs on cheap models; contrast with per-story costs cited for other tools **without naming-and-shaming inaccurately** — phrase as "popular systems are widely reported to burn 80–100k tokens per story on planning re-reads; our epic→epic memory reads exactly three files."
  3. **Install** — per-harness table from DESIGN §10 (marketplace add / codex / opencode / npx). Use `PLACEHOLDER_GITHUB_HANDLE` where the handle goes (Task 18 note).
  4. **Quickstart** — 6 lines: install → `/aa-grill "my rough idea"` → answer questions → `/aa-panel` → do PREREQS.md shopping → `/aa-autopilot --gate full-auto`.
  5. **The methodology in 60 seconds** — hierarchy diagram + the 5 dependency rules as one-liners + review gate.
  6. **Command reference** — DESIGN §9 table verbatim.
  7. **Comparison** — honest table vs GSD / BMAD / spec-kit rows: idea shaping, why-layer, plan review, prereqs gate, cost model, parallel execution, autonomy safety. Include "where they're ahead: maturity, install base." Plays-well-with note: superpowers/skill packs run fine inside workers.
  8. **FAQ:** "Do I need a PRD?" (no — bring a sentence; `/aa-import` if you have one) · "Can it run unattended?" (yes — gate modes + circuit breakers) · "No timelines?" (doctrine: scope-boxes) · "License/token?" (MIT, no token, ever).

- [ ] **Step 2: Commit** — `git commit -m "docs: README"`

---

### Task 18: Integration verification + release prep (Wave 3, serial)

**Files:**
- Modify: anything failing; `README.md` (handle), `.planning/` state files for this build

**Interfaces:**
- Consumes: everything.

- [ ] **Step 1: Full test suite** — `node --test tests/` → ALL pass. Fix any failure at root cause (a lint failure in a skill = fix the skill, not the lint).
- [ ] **Step 2: Cross-reference audit** — for each skill: every playbook section title it names exists verbatim in the playbook (`grep -F "## <title>"`); every agent name it spawns exists in `agents/`. Fix mismatches.
- [ ] **Step 3: Installer end-to-end** — `node bin/install.js --claude --dest <temp>` then verify a copied skill's playbook-resolution rule finds `<temp>/agent-agile/playbooks` (manual path check).
- [ ] **Step 4: Dogfood smoke test** — dispatch ONE fresh subagent with: "You have agent-agile installed at <temp>. Read skills/aa-grill/SKILL.md and simulate the grill on the idea 'an app that reminds me to water plants' — do you have everything you need to run it without improvising? List anything missing." Fix real gaps it finds (missing instructions, dangling references). Judgment calls ("could be nicer") → log to `.planning/LEARNINGS.md`, don't gold-plate.
- [ ] **Step 5: Manifest regen + version** — `node scripts/gen-codex-manifests.js`; confirm `git status` clean of unexpected diffs; leave version at 0.1.0.
- [ ] **Step 6: Note the human TODOs in `.planning/STATE.md`** (NOT in shipped files): replace `PLACEHOLDER_GITHUB_HANDLE` in README once the GitHub repo is created; check npm name `agent-agile` availability before any `npm publish`; create GitHub repo + push; test `/plugin marketplace add` against the real repo.
- [ ] **Step 7: Final commit** — `git add -A && git commit -m "chore: v0.1.0 integration pass"`

---

## Self-review notes

- **Spec coverage:** DESIGN §2 → Tasks 4, 8; §3 → Tasks 3, 4, 5; §3.4 → Tasks 4 (extract), 5 (audit), 6 (preflight); §4 → Tasks 2, 3; §5 → Tasks 6, 10, 12; §6 → Tasks 6, 7 (verifier), 11; §7 → Tasks 6, 10; §8 → Task 7; §9 → Tasks 8–11 (all 11 commands); §10 → Tasks 1, 13, 14, 15, 17; §13 → Task 18. No gaps found.
- **Known sequencing caveat:** Tasks 14 and 16's tests reference content from Tasks 2–11; they are authored in Wave 1 but only required green in Task 18. This is intentional (tests-as-contracts).
- **The one deliberate deferral:** real-marketplace install test and npm publish are human-gated (Task 18 Step 6) — they require the public GitHub repo to exist.
