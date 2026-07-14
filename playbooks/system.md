# System — the methodology core

This is the shared doctrine every other playbook and agent in this project builds on: how work is structured, where memory lives, how cost is spent, and how a sprint closes. Read it once per session if you're doing any planning, execution, or review work — the other playbooks (`playbooks/planner.md`, `playbooks/critics.md`, `playbooks/execution.md`) assume you already know this.

The whole system exists to serve one constraint: **stories must be safely parallelizable by stateless agents, and every session must be resumable from files on disk alone.**

**Judgment lives in files, not in the model.** This playbook, the planner's pushback patterns, the critics' attack lists — all of it ships as text, not as something a particular model happens to know. Swap the model underneath and the doctrine holds, because the doctrine was never in the model to begin with. When a real run surfaces a new failure mode, the fix is an addition to a playbook, not a note-to-self that evaporates at the end of the session.

## The hierarchy

```
OKR          → why the project exists, and how we know it worked
Initiative   → a big bet that moves a Key Result (1–3 per project)
Epic         → one shippable slice = one agent wave = one sprint
Story        → one agent's job: self-contained, own files, own acceptance check
```

There is no level below stories — the story IS the micro-task, sized for one agent in one shot. No story points, no ceremonies, no burndown.

**Objective** — qualitative, one sentence: why this project exists.

**Key Results** — 2–4 per objective. Each Key Result must pass three tests before it's accepted:

1. **Measurable by a command or a count** — a number, not a vibe.
2. **Outcome, not output** — "deploy the backend" is a task; "a stranger completes signup and their first action, unaided" is a Key Result.
3. **Falsifiable at review time** — hit or missed, with no debate.

A Key Result that fails any of these three tests gets pushed back on before planning proceeds. Never lock in a vague Key Result and hope it clarifies later.

**Initiative** — the strategy connecting Key Results to work. Kill-filter applied to every epic: *does this epic serve an initiative? No → cut.*

**Epic** — a demoable slice. Its definition of done is always a demo sentence: *"I can do X and see Y."* If you can't write that sentence, the epic isn't scoped yet.

**Story card** — exactly five fields, no more:

- **Goal** — one sentence.
- **Files it owns** — an explicit list. This is the parallelism key: two stories can run at the same time only if their file lists don't intersect.
- **Acceptance check** — a runnable command or a verifiable assertion, with the expected output.
- **Grader** — how strictly pass/fail is decided, declared at card-writing time so it's never improvised at check time: `exact_match` (output matches verbatim), `numeric_tolerance(±x%)` (a number within a band), `regex_present` (a pattern appears), `efficiency(<budget>)` (the check passes only within a token or wall budget — cost as a pass/fail criterion, for expensive stories), or `llm_judge(<rubric>)` — the weakest grader, used only when no deterministic one exists, with its rubric pinned on the card.
- **Contracts it consumes** — the shared interfaces it reads. A story never invents an interface; it only consumes what Wave 0 froze.

Use `playbooks/templates/STORY.md` for the card format.

A worked example of the chain: the Key Result "a stranger completes checkout unaided" motivates the Initiative "self-serve payment flow," which produces the Epic "guest can buy one item and see a confirmation," which slices into stories like "add the cart-total endpoint" (owns `api/cart.py`, acceptance check: `curl` the endpoint and assert the JSON total) and "wire the checkout button" (owns `ui/checkout.tsx`, acceptance check: click through and assert the confirmation renders). Each level narrows the one above it until a story is small enough that a worker never has to guess what "done" means.

## The memory spine

**If a fact isn't in a file, it doesn't exist.** Agents are stateless between sessions and between subagent dispatches — nothing "remembers" anything that wasn't written down. Every session opens by reading files; none of them carry context forward in their own head.

```
.planning/
  IDEA.md           # grill output, when the project was grilled first. Locked once written.
  PROJECT.md        # OKRs, initiatives, constraints, out-of-scope. Write-once-ish.
  ROADMAP.md        # Epic list + status + demo sentences.
  STATE.md          # THE BATON. Tiny. "You are here" + pointers to what to read next.
  PREREQS.md        # Human shopping list (API keys, accounts, services) + verification status.
  CONFIG.md         # model tiers, gate mode, harness notes.
  DECISIONS.md      # Append-only ledger of decisions settled after plan approval. Asked once, never re-asked.
  CONTROL.md        # Previously-green checks, re-run at every Wave 2 — the regression tripwire.
  epics/EPIC-NN/
    CONTRACTS.md    # Wave 0 output: shared types, schemas, signatures. Frozen during the wave.
    stories/S1.md…  # Story cards (five fields each).
    stories/SN.report.md   # Typed report per completed story (templates/REPORT.md). One file per story — parallel-safe; parsed by Wave 2, never interpreted from prose.
    DEMO.md         # Demo brief: what was built, how to test it, what to look for.
    LEARNINGS.md    # Written at epic close: deviations, gotchas, contract changes.
```

Templates for each of these live at `playbooks/templates/<name>.md`.

**Session protocol:** every session opens by reading `STATE.md`, follows its pointers to whatever else it names, does the work, then closes with exactly one `STATE.md` update. A crashed session, a new session, or a different machine picks up the baton the same way — by reading `STATE.md` first, nothing else.

**In-wave (story to story):** parallel workers don't talk to each other — that's what makes them parallel. Their shared knowledge is `CONTRACTS.md`, written and frozen before any of them start. Their output is code plus one `SN.report.md` each. Knowledge from separate stories only merges at Wave 2.

**Epic to epic (the three-file read rule):** the next epic's planning session reads exactly three things — `PROJECT.md`, `ROADMAP.md`, and the previous epic's `LEARNINGS.md`. Never the whole project history. Learnings are the compressed memory; the codebase itself is the ground truth for everything else. This is what keeps planning context small no matter how many epics have already shipped.

Why this matters in practice: a ten-epic project never needs a session that reads all ten epics' worth of history to plan epic eleven. The three-file rule is the mechanism that makes long projects as cheap to plan late as they were to plan early — without it, planning cost would grow with project size instead of staying flat.

Three deliberate, narrow exceptions, all slicing-time and all planner-side (workers stay sealed to card + contracts):

1. Panel-refresh epics on 5+ epic roadmaps also read `CONFIG.md` — see `critics.md` "Panel refresh".
2. Slicing reads `DECISIONS.md` when it exists — a settled decision is never re-litigated, and re-asking one is the failure the ledger exists to prevent.
3. Slicing runs **one targeted grep** across all prior epics' `LEARNINGS.md` for the current epic's files and topics — a search, never a read-everything. Hits get baked into the story cards, so learnings reach workers through the card, not through workers going looking.

## The agent tree — how context flows down and up

Every run is a tree: one orchestrator, one layer of subagents. The rules below are what keep information intact moving down the tree and cheap moving back up. They exist because every handoff is a lossy compression step — chain enough of them and the last agent is working from a rumor.

**The tree stays two levels deep.** Orchestrator → workers, plus sequential passes (integrator, verifier) at the same level. Depth comes from *sequencing* — waves within an epic, epics chained by autopilot — never from *nesting* agents inside agents. Nesting fragments control, silently loses tool access on real harnesses, and adds a lossy hop per generation. And the orchestrator itself never runs as a forked or isolated subagent — an orchestrator's job is spawning, and forked contexts are exactly where spawning breaks; forking is for leaf workers only.

**Down the tree — the dispatch brief.** Every dispatch contains exactly four things, and a dispatch missing any of them produces drift:
1. **Objective** — one sentence, what done looks like.
2. **Inputs by path** — file paths the agent reads, never pasted file bodies. Pasted content stays resident in the orchestrator's context and is re-read every turn after; a path costs nothing until the one agent that needs it follows it. (For workers this is already the law: card + `CONTRACTS.md`, ~two paths, nothing else.)
3. **Output contract** — the exact typed format the agent returns (which template, which verdict structure).
4. **Boundaries** — what it owns, what it must not touch, and explicitly what sibling agents are covering, so parallel agents can't drift into overlapping work.

**Up the tree — typed compression.** A subagent may burn tens of thousands of tokens doing its work; what comes back is a typed summary — report fields, a verdict structure — plus artifacts written to disk. The work product never travels in the return message; the return is fields the orchestrator parses plus paths to what was produced. The orchestrator never re-reads a subagent's working transcript, and it never holds work products in its own context — pointers and verdicts only.

**Negative space survives the handoff.** The most damaging thing lost between agents is not what was done — it's what was *tried and rejected*, because the next agent repeats the dead end at full price. Worker reports carry a `dead_ends` field; `LEARNINGS.md` carries the epic-level equivalent; redo dispatches must include the prior attempt's dead ends.

**One writer per artifact.** Parallelism is for independent work, never concurrent editing — that's the file-ownership rule generalized: every shared artifact (`STATE.md`, `ROADMAP.md`, `CONTROL.md`, each report file) has exactly one writer at any moment. Agents beyond the writer read or critique; they never co-edit.

**Externalize before full, not after.** The orchestrator writes its state (`STATE.md`, at wave granularity) at every wave boundary as a matter of course — not when context pressure forces it. A plan that lives only in the orchestrator's context dies with the orchestrator's context; a plan on disk lets any fresh session pick up mid-epic.

**The context budget.** A context window degrades long before it fills: measured quality loss begins around 40–50% fill, and the damage tracks *junk density* — stale reports, superseded plans, re-read files — more than raw length. The harness's auto-compaction fires near ~80–90%, which is the model's least capable moment; it is the emergency brake, never the plan. Operating bands:

- **The orchestrator runs in the front half of its window — and the check is predictive, not reactive.** At every wave boundary, don't just read the current fill: estimate the *next* unit of work's footprint (story count × typed-return size, plus integration reads and boundary writes) and ask whether current fill plus that footprint stays under roughly 60%. If it doesn't, hand off *before* launching — even at 35%. A handoff before a wave costs nothing (`STATE.md` is wave-granular; the fresh session resumes losing nothing); a handoff forced mid-wave costs the wave. When the estimate is uncertain, hand off — handoffs are free and being wrong in the other direction isn't. Never plan to compact; plan to hand off.
- **Workers are bounded by construction, not by percentage.** A worker-ready card plus contracts is a few kilobytes in, a typed report out, and the work between should fit comfortably in tens of thousands of tokens — successful focused coding runs stay that small *because they're focused*. A worker that finds itself grinding deep into its window wasn't given a card that's too hard; it was given a card that's too big — that's a slicing defect to report, not a reason to push deeper.
- **Workers rot too — the escape is a relay, never a tree.** A worker nearing its own budget mid-story stops at a clean point and writes its typed report with `status: PARTIAL` — files touched so far, dead ends, and what remains. The **orchestrator** then dispatches one fresh continuation worker whose inputs are the card, the contracts, and that partial report. The worker never spawns its own successor: nesting is where handoffs multiply lossily and harnesses silently break, and the whole point of the two-level tree is that all sequencing runs through the orchestrator. **One relay, maximum.** A story that can't finish in two focused contexts isn't a long story — it's two stories wearing one card, and the second PARTIAL routes it back to slicing as a defect.
- **Junk stays out by the rules already above:** pointers not bodies, typed compressed returns, no transcript re-reads, compute over context. The budget isn't a separate discipline — it's what those rules buy.

## Sprints are scope-boxes

A traditional sprint is a time-box that solves human problems — calendar sync, deadline pressure, stakeholder rhythm. Agents have none of those, so a sprint here is redefined:

- **A sprint IS one epic execution run:** Wave 0 → Wave 1 → Wave 2. It ends when the epic's demo sentence is true — not when a clock runs out.
- The real sprint boundary is the **human review gate** — how much finished work gets reviewed at once is a planning decision (set during intake), not a calendar decision.
- The only other bound is practical: an epic must fit inside one orchestrated run without drowning agent context. That's enforced at slicing time, by keeping epics small enough to plan cleanly.

No durations, no estimates, no deadlines appear anywhere in this system — not in OKRs, not in epics, not in story cards. Scope is the unit of planning; time never is.

## The five dependency rules

Dependencies between stories are **structured out at planning time, not managed at run time**:

1. **Contracts before code (Wave 0).** One serial pass defines shared types, API schemas, database tables, and function signatures before any parallel work starts. Frozen for the wave — parallel agents consume contracts, they never negotiate with each other.
2. **File ownership IS the dependency graph.** Two stories can run in parallel exactly when their file lists don't intersect. If a file is genuinely needed by more than one story, either merge those stories into one, or push the shared part into Wave 0 as a contract.
3. **Vertical slices over horizontal layers.** Split work by feature — each story goes database → API → UI for its own feature — never split one feature into a backend story and a frontend story.
4. **Epics are the sync points.** Wave 0 (contracts, serial) → Wave 1 (all stories, parallel) → Wave 2 (integrate, review, demo, serial). Epics themselves run one at a time; each epic ends fully integrated and demoable before the next epic is planned.
5. **Every story self-verifies.** Each story's own agent runs its acceptance check before reporting done. Wave 2 additionally runs the epic-level check. Nothing merges on "it should work."

The collision check at the start of a wave enforces rule 2 mechanically: any two story cards claiming the same file refuse to launch, and slicing gets revisited before anything runs. This is deliberate — a file collision caught before dispatch costs nothing; the same collision discovered mid-wave, after two agents have both edited the same file, costs a redo.

Notice what these five rules add up to: none of them ask an agent to coordinate with another agent at run time. Coordination is a planning-time cost, paid once by whoever slices the epic — never a run-time cost paid by workers negotiating over a shared file or a half-defined interface.

## Model & cost policy

**Principle: spend at planning time, save at run time.** Planning happens once per epic; execution is many parallel agents plus retries. Every ambiguity resolved once during planning by a capable model is paid for once — instead of paid for repeatedly by confused cheap workers hitting the same wall. So planning has no cost ceiling worth protecting: ask every intake question, push back on every vague Key Result, over-specify every story card. Execution stays cheap, and it stays cheap *because* planning was thorough.

| Phase | Tier | Why |
|---|---|---|
| Intake, OKRs, epic slicing | smart tier | Judgment-heavy, happens once per epic. |
| Research fan-out (multi-epic only) | smart tier | Happens once per project; hunts the edges cheap workers would otherwise hit mid-wave. |
| Wave 0 (contracts) | smart tier | Contract errors cascade into every parallel story that follows. |
| Wave 1 (story workers) | cheap tier | The bulk of tokens spent. Story cards are designed so a cheap-tier agent succeeds without judgment calls. |
| Wave 2 (integrate, verify, demo brief) | smart tier | Cross-story judgment; catches what cheap-tier workers missed. |

Concrete model names per tier are configured once in `playbooks/templates/CONFIG.md` — this playbook only names the tiers, never a specific model.

**The worker-readiness test — the actual cost lever:** a story card is done only if a cheap-tier agent can complete it from the card plus `CONTRACTS.md` alone — exact file paths, exact commands, expected outputs, zero exploring, zero inferring intent. If a card seems to need smart-tier judgment to complete, **the card is wrong, not the model**: sharpen it, split it, or move the decision into the Wave 0 contracts instead. This test is applied at slicing time, before any worker agent is dispatched — never discovered mid-wave.

**Retries are the hidden cost.** Self-verifying stories, plus turning review feedback into new acceptance checks on redo, exist precisely to keep retry loops short: a redo re-runs cheap-tier workers against sharpened checks, never an open-ended smart-tier debugging session.

Put together, the two failure modes this policy guards against are opposite ends of the same mistake: under-specifying a card so a cheap-tier worker flails and burns retries, or routing everything to the smart tier out of caution and paying full price for work that never needed judgment. The worker-readiness test is the single check that catches both — it's applied once, at slicing time, and it's cheaper to apply than either mistake is to recover from.

## The review gate

Every sprint close produces a **demo brief** — a required artifact, not a status update. Use `playbooks/templates/DEMO.md`. It must contain:

- what was built
- **how to test it** — exact steps, URL, or command
- **what to look for** — what "working" looks like, and which edge cases to poke

The gate has exactly three exits:

- **Approve** → learnings get written to `LEARNINGS.md`, the roadmap flips, the epic-level check joins `CONTROL.md`, the next epic gets planned.
- **Redo** → the reviewer's tips become new acceptance checks on the affected story cards, and the same epic re-runs its wave against the sharpened checks. Feedback becomes testable this way — a redo can never miss the same point twice. Once a redo's new check goes green, it also joins `CONTROL.md`: a bug that reached the gate once is re-checked at every Wave 2 after, forever (capped — see the template). A patch-sized redo-list takes the scoped path in `execution.md` instead: one cheap-tier fix worker plus re-verification, no full wave re-run.
- **Replan** → the epic goes back to slicing, and the roadmap after it gets re-examined, since a replan usually invalidates assumptions later epics were built on.

The demo brief exists because "looks about right" is not a review — it's a guess dressed up as a decision. A brief that names the exact command to run and the exact thing to look for turns the gate into a real check, and it's what makes Approve/Redo/Replan a decision instead of a mood.

## Fail-fast structure

**Epic 1 is always the walking skeleton** — the thinnest possible end-to-end slice: one trivial action moving all the way through every layer the project needs (for example, UI through API through storage through deploy). It proves the architecture, the deploy path, and the agent workflow itself, while a full replan is still nearly free.

Epics 1 and 2 are, deliberately, where a project is most likely to die — and that's the point: dying there is cheap. A project that survives its walking skeleton and its first real epic has already retired its biggest unknowns.

The cost asymmetry is the whole argument: a walking skeleton that reveals a broken assumption costs one small epic and a replan. The same broken assumption discovered after ten epics of feature work costs ten epics of rework built on a foundation that never held. Fail-fast structure is what makes the cheap failure the one that actually happens.

## Capability is discovered, never declared

The system carries no list of what it can or can't build — a hardcoded "can't" is a stale patch that turns into a lie the day a new tool closes the gap, and it rots invisibly on machines we never see. Instead, every run discovers its own boundary by probing the actual environment (intake question 4's environment probe), and everything on the far side of that boundary becomes visible work rather than silent absence: a `PREREQS.md` row with a *when*, a line in the intake split statement ("my part / your part"), or an `unverified:` field surfacing at the review gate. The user is never told "the system doesn't do X" — they're told "this run, on this machine, couldn't do or verify X, so X is yours, and here's when it comes due."

## Per-project output format

A project's planning output is a single doc that stays in this shape:

1. **OKRs** — objective plus its Key Results.
2. **Initiatives** — the 1–3 big bets that move those Key Results.
3. **An ordered epic list** — riskiest first, each epic carrying its one-sentence demo definition of done.
4. **A full story breakdown for the current epic only** — waves and file ownership, using `playbooks/templates/STORY.md` per card.

Every future epic beyond the current one stays a single line in the roadmap. It only gets expanded into stories when the project reaches it — because every earlier epic that ships changes what the plan after it should look like. Detailing epics further out than the current one is wasted planning spend: it will be re-planned anyway once assumptions shift.
