# Agent-Agile — Design Specification v1.0

**Date:** 2026-07-12
**Status:** Approved design, pre-build
**License target:** MIT. No token, ever.
**Repo:** `agent-agile` (personal GitHub, public)

---

## 1. What it is

An open-source planning + execution system for AI coding agents, installable in Claude Code, Codex CLI, and OpenCode. Users bring **a rough idea in one sentence** — no PRD required. The system interrogates the idea, decides whether it's worth building (it can say no), plans it as OKRs → epics → story cards sized for cheap models, and executes it in parallel waves with built-in review — optionally end-to-end in one autonomous run.

**Positioning (one line):** *Every other system helps agents build the thing right. Agent-Agile decides if it's the right thing — then builds it right, cheaper.*

**The three capabilities no adopted competitor has** (verified by 14-system survey, July 2026):

1. **OKR/outcome layer** — plans start from "how do we know it worked," not from a feature list. No surveyed system (BMAD 50k★, spec-kit 119k★, GSD 64k★, OpenSpec 59k★, claude-flow 64k★, Task Master 28k★…) has this.
2. **Adversarial critic panel with KILL authority** — 3–4 fresh-context critics attack every plan before execution; the market critic can kill a project with evidence before a story runs. Only two micro-projects (3.6k★, 365★) gesture at this.
3. **Cost-tiered model routing per story** — expensive models plan, cheap models execute, enforced by the worker-readiness test at slicing time. Only Task Master has any routing, and it's manual/global.

File-ownership wave parallelism (capability #4) is competitive parity with GSD/spec-kit/CCPM, not a differentiator — but ours adds contract freeze + collision refusal.

**Core doctrine (inherited from the source methodology, kept verbatim):**

- Sprints are **scope-boxes, not time-boxes**. No timelines, no estimates, anywhere, ever.
- **Spend at planning time, save at run time.** Every ambiguity resolved once by a smart model instead of N times by confused cheap workers.
- **If a fact isn't in a file, it doesn't exist.** Agents are stateless; the repo is the memory.
- **Judgment lives in files, not in the model.** All planner/critic doctrine ships as playbook files; new failure modes discovered in real runs get appended to the playbooks.

---

## 2. What users bring — three front doors

| User has | Entry command | What happens |
|---|---|---|
| A vague spark | `/aa-grill` | Idea interrogation → locked `IDEA.md` → flows into intake |
| A clear idea | `/aa-new-project` | Straight to the 8 intake questions |
| An existing PRD/plan/spec | `/aa-import` | Answer intake questions from the doc, ask only gaps, panel with no leniency |

### 2.1 The Grill (`/aa-grill`)

Grill-me-style relentless interrogation aimed at the **idea** stage, upstream of planning. Runs in the main loop (interactive, one question at a time).

- Attack list: Who exactly has this problem (name a real person)? What do they do today? Why switch? The ONE action that must succeed? What already exists — why not use that? Smallest version still worth using? If it works, what number changes?
- Vague answer → narrowed into a forced choice, never re-asked open-ended. "Everyone" rejected as a user. "It'd be cool" rejected as a why.
- **Output:** `.planning/IDEA.md` — problem, exact user, the one action, why-now, non-goals, success signal. Locked: the planner may not reinterpret it later.
- **The grill can reject the idea** — if it can't survive its own questions, say so before any planning tokens are spent.
- Grill answers **pre-fill the 8 intake questions** — intake collapses to confirmation. Never double-ask. (This is the anti-ceremony guarantee; ceremony is the #1 user complaint against BMAD/spec-kit/GSD.)

### 2.2 The 8 intake questions (`/aa-new-project`)

Asked one at a time, with pushback patterns from the planner playbook. Never proceed on a vague KR.

1. **The demo** — when done, what do you show someone in 60 seconds?
2. **The user + the one action** — who uses it, what single action must succeed?
3. **What exists** — repo? designs? infra? decisions not to re-litigate?
4. **Hard constraints** — stack, platform, budget, services already paid for.
5. **Out of scope for v1** — explicitly NOT building (kills epics before they're born).
6. **Riskiest unknown** — most likely to sink this → becomes Epic 1.
7. **Success number** — measurement that means it worked → feeds KRs directly.
8. **Review-batch appetite** — how much finished work reviewed at once (sets epic size; default: small, frequent demos, fail-fast).

### 2.3 Import path (`/aa-import`)

For pre-existing plans: read the doc, answer the 8 questions *from the document alone*, ask the user only the gaps, map onto the format (OKRs derivable? epics demoable? stories worker-ready?), produce a gap list not a rewrite. Then full panel — old plans get NO leniency. Three exits: **Proceed** (translate + run Epic 1) / **Reshape** (back to intake with findings) / **Kill** (write LEARNINGS.md, stop).

---

## 3. The methodology

### 3.1 Hierarchy

```
OKR          → why the project exists + how we know it worked
Initiative   → a big bet that moves a KR (1–3 per project)
Epic         → one shippable slice = one wave run = one sprint (scope-box)
Story        → one agent's job: self-contained, own files, own acceptance check
```

No level below stories. No story points, no ceremonies, no burndown.

- **KRs** must pass 3 tests: measurable by command/count; outcome not output; falsifiable at review with no debate. Every objective also carries a **counter-metric** — the number that must NOT get worse — closing the path where a KR goes green by making the product worse.
- **EARS shape for behavioral requirements:** "WHEN <trigger>, THE SYSTEM SHALL <observable response>" — a grammar that cannot express "handles X properly." Applies to KRs, card goals, and acceptance-check expectations; procedural commands exempt.
- **Initiative kill-filter:** "does this epic serve an initiative? No → cut."
- **Epic DoD** is always a demo sentence: *"I can do X and see Y."*
- **Story card = exactly five fields:** Goal (one sentence) · Files it owns (explicit list — the parallelism key) · Acceptance check (runnable command / verifiable assertion) · Grader (how pass/fail is decided: `exact_match` / `numeric_tolerance(±x%)` / `regex_present` / `efficiency(<budget>)` / `llm_judge(<rubric>)` — the last only when nothing deterministic exists, rubric pinned on the card) · Contracts it consumes.
- **Slicing bias — split only for width or fresh eyes:** a story split must buy genuine parallel width (disjoint files, independent work) or fresh-mind isolation (verification); "separate concerns" alone is not a split reason. Fewer, larger stories beat more, smaller handoffs.
- **Epic 1 is always the walking skeleton** — thinnest end-to-end slice; combined with Q6, Epics 1–2 are deliberately where the project is most likely to die (cheaply).
- **Per-project output:** OKRs → initiatives → ordered epic list (riskiest first, each with demo sentence) → full story breakdown for the **current epic only**. Future epics stay one-line.

### 3.2 The worker-readiness test (the cost lever)

A story card is *done* only if a cheap-tier agent can complete it from the card + `CONTRACTS.md` alone — exact file paths, exact commands, expected outputs, zero exploring, zero inferring intent. If a card seems to need smart-model judgment, **the card is wrong, not the model**: sharpen it, split it, or move the decision into Wave 0 contracts. Applied at slicing time, before any agent launches.

### 3.3 The critic panel (`/aa-panel`)

3–4 critics spawned as **parallel subagents, fresh context, smart tier, told to find what's wrong**. Each receives its full playbook section verbatim + the draft plan. Findings are BLOCK (must fix) or FLAG (present to user). Planner fixes every BLOCK; user gates on FLAGs.

| Critic | Attacks | Catches |
|---|---|---|
| **Product critic** (PO lens) | OKRs, epic list, out-of-scope | Wrong thing built; output-KRs; scope creep |
| **Spec auditor** (BA lens) | Story cards + contracts + **prereqs** | Ambiguity — runs worker-readiness test on every card; hunts hidden human prerequisites the planner missed |
| **Execution auditor** (SM lens) | Waves + file ownership | Hidden dependencies, file collisions, oversized epics |
| **Market critic** (commercial products only) | The market | PROCEED / RESHAPE / KILL with evidence. Uses web search where the harness has it; degrades to answer-from-plan + flag-unverified where it doesn't. Method: validation checklist, competitor buckets, 7-Powers indie filter, pricing corridor, **pre-registered kill criteria**. |

Gate: multi-epic projects only; single-epic throwaways skip the panel (anti-ceremony fast path).

### 3.4 PREREQS.md — the human-shopping-list gate

The #1 silent killer of autonomous runs: a worker hits a missing API key at 2am and stalls or fakes around it. So:

- At planning time, the planner extracts **every external thing only a human can provide**: API keys, paid subscriptions, accounts, domains, OAuth registrations, hardware. Writes `.planning/PREREQS.md`: what to get, where, cost, and exactly where to put it (env var name / file path).
- The spec auditor hunts for missed prereqs — misses are BLOCKs.
- **Preflight:** `/aa-autopilot` and `/aa-execute-epic` refuse to launch until every item checks out — verified where possible (key present, test call succeeds), not just checkbox-trusted.
- **Mid-run discovery:** circuit-break — pause, write the missing item into PREREQS.md + STATE.md, notify. Never fake a credential; never silently mock a missing paid service.

---

## 4. Memory spine

```
.planning/
  IDEA.md           # grill output (when grilled). Locked.
  PROJECT.md        # OKRs, initiatives, constraints, out-of-scope. Write-once-ish.
  ROADMAP.md        # Epic list + status + demo sentences.
  STATE.md          # THE BATON. Tiny. "You are here" + pointers.
  PREREQS.md        # Human shopping list + verification status.
  CONFIG.md         # model tiers, gate mode, harness notes.
  DECISIONS.md      # Append-only decisions ledger — settled after plan approval, never re-asked.
  CONTROL.md        # Previously-green checks re-run at every Wave 2 — the regression tripwire (capped).
  epics/EPIC-NN/
    CONTRACTS.md    # Wave 0 output. Frozen during the wave. Every interface: exact shape + populated example + failure shape.
    stories/S1.md…  # Story cards (5 fields)
    stories/SN.report.md   # Typed report per completed story (templates/REPORT.md) — parsed by Wave 2, never inferred from prose
    directions/D1..4.html  # UI epics, optional: clickable design directions; the pick lands in DECISIONS.md
    DEMO.md         # Demo brief (what was built / how to test / what to look for) — canonical, machine-read
    DEMO.html       # The same brief rendered as a self-contained clickable page for the human gate
    LEARNINGS.md    # Written at epic close: deviations, gotchas, contract changes
```

- **Session protocol:** every session opens with STATE.md → follow pointers → work → close with one STATE.md update. Crash/new session/new machine: `/aa-resume` picks up the baton.
- **In-wave:** parallel workers don't talk. Shared knowledge = CONTRACTS.md (written before they start); output = code + SN.report.md.
- **Epic→epic:** next epic's planning reads exactly three things — PROJECT.md, ROADMAP.md, previous epic's LEARNINGS.md. Never the whole history. Learnings = compressed memory; codebase = ground truth. (This is the structural fix for the context-rot/token-burn complaints that dog BMAD.)

---

## 5. Execution engine (`/aa-execute-epic`)

Orchestrator stays lean — reads cards, dispatches, collects; never writes code. Context flow follows the **agent-tree doctrine** (`playbooks/system.md` "The agent tree"): a flat two-level tree (depth by sequencing, never nesting; the orchestrator is never itself forked); down-tree = a four-part dispatch brief (objective · inputs by path, never pasted bodies · typed output contract · non-overlap boundaries); up-tree = typed fields + artifacts on disk, never transcripts; `dead_ends` preserved at every handoff so no agent repeats a rejected approach; one writer per shared artifact; `STATE.md` externalized at every wave boundary as routine. (Grounded in Anthropic's multi-agent research system + context-engineering posts, Cognition's single-writer argument, and the GSD context-fork nesting failure.)

**The context budget** (same doctrine section): quality degrades from ~40–50% window fill, driven by junk density, and auto-compaction fires at the model's weakest moment — so the orchestrator operates in the front half of its window and hands off at a wave boundary past ~40–50% (STATE.md is wave-granular; a resumed session loses nothing), workers are bounded by construction (card+contracts in, typed report out — a worker grinding deep into its window is a slicing defect), and compaction is the emergency brake, never the plan. (Grounded in Chroma's context-rot study, NoLiMa/RULER effective-length data, SWE-bench long-context ablations, Anthropic's harness-design post on context anxiety and reset-over-compaction, and converging practitioner thresholds.)

```
Wave 0 — CONTRACTS (serial, smart tier)
  One agent writes CONTRACTS.md: shared types, API schemas, DB tables, signatures. Frozen.
  Contract errors cascade into every worker → this gets the expensive brain.
      ↓
Pre-flight — COLLISION CHECK (pure file logic, no AI)
  Any two story cards claiming the same file → REFUSE to launch, back to slicing.
  File ownership IS the dependency graph. Also: PREREQS verified.
      ↓
Wave 1 — STORIES (parallel, cheap tier)
  One fresh-context subagent per story. Input: ONLY its 5-field card + CONTRACTS.md.
  Build → run own acceptance check (per its grader) → bounded repair loop on failure
  (≤3 rounds, same dispatch) → typed SN.report.md. Exhausted loop → FAIL, flagged, not merged.
      ↓
Wave 2 — INTEGRATE (serial, smart tier)
  Integrator PARSES the typed reports (flags mechanically: FAIL / out-of-ownership
  files / deviations / contract change requests), wires cross-story seams, runs
  epic-level check (≤3 seam-repair rounds), re-runs the CONTROL.md regression set,
  writes DEMO.md + LEARNINGS.md, flips ROADMAP.md, updates STATE.md.
      ↓
Verifier gate → Approve / Redo / Replan
```

The pre-flight prints a **readiness dashboard** before Wave 1 — contracts pinned, collisions, prerequisites, graders on every card, control-set size, with a CLEARED/BLOCKED verdict — so the rigor is visible before tokens are spent, not asserted after.

**Dependency rules (how parallelism is structured out, not managed):** contracts before code (Wave 0) · file ownership is the graph · vertical slices over horizontal layers (each story goes DB→API→UI for its own feature) · epics are the sync points (run one at a time, each ends integrated + demoable) · every story self-verifies.

## 6. Review system — three layers

| Layer | Reviewer | Checks |
|---|---|---|
| Story | The worker itself | Its card's acceptance check (real command, real pass/fail) before reporting done |
| Epic | **Verifier agent** (smart tier, fresh context, didn't write the code) | Goal-backward: is the demo sentence actually TRUE? Re-runs acceptance checks, pokes edge cases, checks KR progress |
| Gate | Human (or Verifier standing in, in autopilot) | Reads DEMO.md → **Approve / Redo / Replan** |

- **Redo:** user tips (or Verifier findings) become **new acceptance checks** on the affected stories; the wave re-runs. Feedback becomes testable — a redo can't miss the same point twice. Once green, the new check joins `CONTROL.md`, so a bug that reached the gate once is re-checked mechanically at every Wave 2 after.
- **Replan:** epic back to slicing; roadmap after it re-examined.
- **Approve:** the epic-level check joins `CONTROL.md` — every approved epic leaves a permanent regression tripwire behind it (set capped; oldest non-demo rows retire).
- **Demo brief (DEMO.md) is a required artifact, not vibes:** what was built · exact steps/URL/command to test · what "working" looks like + edge cases to poke. Rendered alongside it: **DEMO.html**, a self-contained clickable page built from the parsed typed reports (verdict banner, story table, control-set results, copyable commands) — the human surface; the markdown stays canonical for machines.
- **UI epics get the design layer** (`playbooks/design.md`): optional pre-Wave-0 **design directions** (2–4 self-contained HTML mockups; pick → DECISIONS.md, tokens → contracts) · a required **data-verify contract** per UI story (`data-verify-*` attributes + headless `window.__verify.runAll()` with a deterministic grader — "look at it and see" is never an acceptance check) · a **design audit** in verification (10 falsifiable checklist items — interaction states, empty/loading/error triad, spacing/type scales, contrast, keyboard path, responsive floor, one primary action, slop tells, motion — never a score; findings become acceptance checks and, once green, CONTROL.md rows).

## 7. Autopilot (`/aa-autopilot`)

Runs every epic back-to-back until the roadmap is done: plan epic → execute → verify → learnings → flip roadmap → next.

- **Gate modes, set at start:** `--gate full-auto` (Verifier takes the human's seat at every epic gate; demo briefs accumulate for end review) · `--gate checkpoint` (auto within an epic, ping the human between epics) · default = interactive gate every epic.
- **Circuit breakers (pre-registered, non-negotiable):** epic fails verification twice after redo → STOP, write STATE.md with where/why. Missing prereq discovered → STOP per §3.4. Never build ten epics on top of a broken one ("death train" prevention).
- **Ambiguity protocol:** any question the plan doesn't answer checks `DECISIONS.md` first (settled = applied, never re-asked). Auto-resolve only what is reversible, pattern-matching, free, and security-clean — recorded in the ledger. Anything else routes to the user by gate mode; in full-auto, irreversible/paid/security ambiguity is a circuit breaker, never a guess. Every gate ruling, panel BLOCK resolution, and replan rationale is appended to the ledger the moment it's made.
- **Completion promise:** the run may not declare the roadmap done without the evidence on disk — every epic row flipped + the final verifier verdict written and passing. No evidence = the run reports itself stopped, not done.
- **Unsatisfiable-check diagnosis:** identical finding + unchanged files after a redo = the check is wrong, not the work — verifier-only recheck, then breaker. Never a second paid wave to prove the same impossibility.
- Preflight requires PREREQS.md fully verified before launch.

## 8. Agents roster

| Agent | Tier | Role |
|---|---|---|
| `aa-planner` | smart | Intake, OKRs, epic slicing, story cards, import audits |
| `aa-critic-product` | smart | Panel: product lens |
| `aa-critic-spec` | smart | Panel: spec/BA lens + prereq hunt |
| `aa-critic-execution` | smart | Panel: SM/waves lens |
| `aa-critic-market` | smart | Panel: market lens, web-enabled, kill authority |
| `aa-contractor` | smart | Wave 0 contracts |
| `aa-worker` | cheap | Wave 1 story execution |
| `aa-integrator` | smart | Wave 2 integration + demo brief |
| `aa-verifier` | smart | Epic verification + autopilot gate stand-in |

The Grill runs in the main loop (interactive), not as a subagent.

**Model tier abstraction:** `CONFIG.md` maps `smart_tier` / `cheap_tier` to concrete models per harness (defaults: harness's strongest ↔ cheapest-capable). Ship the principle, not hardcoded model names. Agent definitions reference tiers; harness adapters resolve them.

## 9. Command surface (v1 — everything above ships)

| Command | Purpose |
|---|---|
| `/aa-grill` | Idea interrogation → IDEA.md (can reject the idea) |
| `/aa-new-project` | 8-question intake → OKRs → epics → Epic 1 stories |
| `/aa-import` | Existing plan: audit → gaps → panel → proceed/reshape/kill |
| `/aa-panel` | Run the critic panel on the current draft plan |
| `/aa-plan-epic` | Slice next epic: contracts scope + story cards + waves |
| `/aa-execute-epic` | Wave 0 → collision check → Wave 1 → Wave 2 |
| `/aa-review` | Present DEMO.md → approve/redo/replan |
| `/aa-autopilot` | Chain all epics; `--gate full-auto|checkpoint` |
| `/aa-resume` | Read STATE.md, pick up the baton |
| `/aa-status` | Where are we; roadmap + KR progress |
| `/aa-help` | Command guide + methodology crash course |

## 10. Repo layout & distribution

Canonical Claude-plugin-shaped tree; skill bodies are **never duplicated per harness**.

```
agent-agile/
├── .claude-plugin/
│   ├── plugin.json           # name, description, version, author, license, keywords
│   └── marketplace.json      # plugins[0].source: "./"
├── skills/                   # thin dispatchers (~50 lines each): frontmatter + "read playbook X, execute workflow Y"
│   └── aa-<name>/SKILL.md    # frontmatter restricted to agentskills.io common subset:
│                             #   name, description, license, metadata (+ allowed-tools where Claude-specific, harmless elsewhere)
├── agents/                   # aa-planner.md, aa-critic-*.md, aa-worker.md, aa-integrator.md, aa-verifier.md, aa-contractor.md
├── playbooks/                # THE PAYLOAD — all real logic lives here, referenced by skills
│   ├── system.md             # the methodology (this doc's §3–§7, operationalized)
│   ├── planner.md            # intake scripts, pushback patterns, slicing rules, worker-readiness test
│   ├── critics.md            # per-critic attack lists, weasel-word hunts, kill criteria, market method
│   ├── execution.md          # wave protocol, collision check, report formats, circuit breakers
│   └── templates/            # IDEA.md, PROJECT.md, ROADMAP.md, STATE.md, PREREQS.md, story card, DEMO.md, LEARNINGS.md, CONFIG.md
├── scripts/
│   ├── gen-codex-manifests.js  # ~20 lines: .codex-plugin/plugin.json + .agents/plugins/marketplace.json from the Claude manifests
│   └── bump-version.js         # reads .version-bump.json, bumps every manifest in lockstep
├── bin/install.js            # npx agent-agile → copies skills/agents/playbooks into ~/.claude (or --codex/--opencode dirs)
├── .version-bump.json        # registry of every version-bearing file (superpowers pattern)
├── AGENTS.md                 # root cross-harness doc (Codex/OpenCode read natively)
├── CLAUDE.md                 # thin pointer → AGENTS.md
├── README.md                 # positioning, comparison table, token-cost honesty, install per harness
├── docs/DESIGN.md            # this file
├── tests/                    # smoke: frontmatter lint, playbook-reference integrity, collision-check unit test, installer dry-run
└── LICENSE                   # MIT
```

**Architecture pattern (GSD's dispatcher + superpowers' discipline):**
- Skills are thin dispatchers; playbooks hold the logic once. Skills instruct "read `playbooks/X.md`" (lazy read), NEVER `@`-include (eager loading blows context).
- Skill prose speaks in **actions, not tool names** ("dispatch a subagent," "ask the user one question") — the superpowers rule that makes one file run everywhere.
- Frontmatter `description` states **triggering conditions only, never the workflow** (documented superpowers regression when violated).

**Harness support (v1 = 3, deliberately not 15 — GSD's parity trap):**

| Harness | Mechanism | Install UX |
|---|---|---|
| Claude Code | native plugin | `/plugin marketplace add <you>/agent-agile` → `/plugin install agent-agile` |
| Codex CLI | native skills + generated `.codex-plugin/plugin.json` (Codex also falls back to reading `.claude-plugin/`) | drop into `~/.agents/skills` or `codex plugin marketplace add` |
| OpenCode | scans `.claude/skills/` & `.agents/skills/` natively; frontmatter subset = zero conversion | npx installer or manual copy |
| Anyone else | `npx agent-agile` copier | flags: `--claude --codex --opencode --global/--local` |

Cursor/Gemini: deferred (Gemini CLI EOL'd 2026-06-18 anyway).

**Version/release:** `.version-bump.json` lockstep bumps; hand-written reverse-chron RELEASE-NOTES.md explaining *why*, not just what. When retiring a harness, delete manifest + context file + references together (superpowers shipped a dangling Gemini `@`-include — don't).

## 11. Non-goals (v1)

- No hooks / SessionStart bootstrap (we're command-driven like GSD, not habit-triggered like superpowers). Revisit only if discovery is a real problem.
- No MCP server, no compiled runtime, no daemon. Markdown + two tiny node scripts.
- No web dashboard, no analytics, no telemetry.
- No Cursor/Gemini/Windsurf/15-harness matrix.
- No timeline features of any kind (doctrine, not a gap).
- **No built-in cross-model second opinion.** For high-stakes projects there's a worthwhile optional recipe — run an independent second-vendor CLI (e.g. OpenAI Codex) as an adversarial reviewer over the one highest-cascade artifact, Wave 0's `CONTRACTS.md`, and diff its findings against the panel's — but it stays a recipe, not a feature: it adds a paid second-vendor dependency to every user's PREREQS for a benefit concentrated on one artifact, and the fresh-context critic panel already buys most of the de-correlation for free.

## 12. Sourcing & provenance

Playbook content is genericized from the author's private methodology docs (v1.3.1, first real run 2026-07-11): personal names → "you"; Obsidian-vault reads → in-repo `playbooks/`; hardcoded Opus/Sonnet → smart/cheap tiers; personal hooks dropped (tier policy moves into agent definitions). The methodology itself — hierarchy, 8 questions, dependency rules, panel, memory spine, review gate, fail-fast structure — ships intact.

## 13. Success criteria for the build itself

- A stranger on a clean machine can: install via marketplace command, run `/aa-grill` with a one-line idea, and reach an approved Epic 1 plan without reading anything but command output.
- The same skills files work unmodified in Claude Code, Codex, and OpenCode (frontmatter subset verified by lint test).
- `/aa-execute-epic` on a toy project: collision check refuses an intentionally-colliding pair; a green run produces DEMO.md + LEARNINGS.md + updated STATE.md/ROADMAP.md.
- `/aa-autopilot --gate full-auto` on a 2-epic toy project completes both epics unattended and stops correctly when an epic is sabotaged to fail twice.
- README comparison table is accurate and honest (claims traceable to the July 2026 research).
