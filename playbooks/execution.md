# Execution playbook

How one epic goes from a slice of story cards to a merged, demoable, verified piece of software. An epic execution run is two waves bracketed by a pre-flight check and a review gate: **Wave 0 — contracts, Pre-flight, Wave 1 — stories, Wave 2 — integrate, Verification, The review gate.** Autopilot chains many of these runs back to back; circuit breakers stop it before it builds on top of a broken epic.

The orchestrator running this playbook stays lean: it reads cards, dispatches subagents, and collects their output. It never writes application code itself.

Read this playbook when running `/aa-execute-epic` or `/aa-autopilot`, or when resuming a session mid-epic.

## Wave 0 — contracts

Before any story is built, dispatch one fresh-context smart-tier subagent to write `CONTRACTS.md` for the epic: shared types, API schemas, data schema, function/module signatures, and naming/error-handling conventions. Source it from every story card's `Contracts consumed` field — the contract must cover everything the stories will need to agree on without talking to each other.

Every data-store invariant in the contract must say who owns it: either readers may assume it holds (the writer guarantees it), or readers must tolerate violations of it (defense in depth). An invariant nobody is assigned to is how two stories each assume the other one enforces it — a writer that never dedupes feeding a reader that assumes uniqueness is a bug neither story's acceptance check will catch.

Contract errors cascade into every worker that consumes them, so this step gets the strongest tier available, even though it is the smallest amount of work in the epic.

Once written, `CONTRACTS.md` is **frozen** for the rest of the wave. Story workers consume it; they do not negotiate it, extend it, or file change requests against it mid-wave. If a worker discovers the contract is wrong, that surfaces in its report and gets handled at Wave 2 or in a redo — never by a worker unilaterally editing `CONTRACTS.md`.

Template: `playbooks/templates/CONTRACTS.md`.

## Pre-flight

Two checks gate the start of Wave 1. Both must pass before dispatching a single story worker.

**Collision check.** File ownership is the dependency graph for this system — two stories can run in parallel exactly when their `Files it owns` lists don't intersect. Run the collision check: `node <playbook-root>/../scripts/collision-check.js <epic-dir>` — the script installs next to the playbooks, so resolve `<playbook-root>` with the standard resolution rule first (in a source checkout of this repo that is simply `node scripts/collision-check.js <epic-dir>`). A clean run exits 0 with `{"ok":true}`. A collision exits 1 with a JSON report naming every contested file and the stories that claim it, e.g. `{"ok":false,"collisions":[{"file":"p","stories":["S1.md","S3.md"]}]}`.

Any collision is a full refuse: do not launch Wave 1. Report the exact colliding files and stories back to whoever is slicing the epic, and send the epic back to slicing so the shared file either moves into `CONTRACTS.md` or the stories get merged. Never work around a collision by asking two workers to touch the same file "carefully."

**Prerequisites check.** Read `PREREQS.md`. Every row must be `verified`, or `done` in the specific case where a status of `verified` is not actually checkable (nothing to test-call). For any row that has a stated verification command, run it now — don't trust the checkbox. A `pending` row, or a `done` row that fails its verification command, blocks launch: stop, and treat it exactly like a mid-run missing-prerequisite circuit breaker (see below) rather than pushing forward and hoping.

Only once both checks are clean does Wave 1 start.

## Wave 1 — stories

Dispatch one fresh-context cheap-tier subagent per story card, in parallel. Each worker's input is exactly two things: its own story card and `CONTRACTS.md`. Nothing else — no other story's card, no wider codebase exploration mandate, no epic-level context beyond what the card and contracts already state. This is what makes the card itself the unit of work: if a card can't be completed from just those two inputs, the card was under-specified at slicing time, not the worker under-capable.

Each worker builds against its `Files it owns` list only, then **runs its own acceptance check** — the runnable command or verifiable assertion from its card — before reporting anything as done. A worker never reports success on the strength of "it should work."

Each worker writes `stories/SN.report.md`: 3–5 lines covering what was built, the acceptance check result, and any deviations from the card. One file per story keeps this parallel-safe — nothing is appended to a shared file mid-wave.

If a worker's acceptance check fails, that worker gets exactly one retry within the same dispatch. If it fails again, flag the story and do not merge its output. A flagged story surfaces at Wave 2 and blocks that story's slice of the epic-level check rather than being silently absorbed.

## Wave 2 — integrate

Dispatch one fresh-context smart-tier subagent as integrator. Its job:

- Concatenate every `stories/SN.report.md` into `REPORTS.md`.
- Wire the cross-story seams the individual workers couldn't see — the places where two stories' outputs need to connect.
- Run the epic-level acceptance check: the demo sentence, exercised for real (the actual command or flow it describes, not a re-statement of the story-level checks).
- Write `DEMO.md` (template: `playbooks/templates/DEMO.md`) and `LEARNINGS.md` (template: `playbooks/templates/LEARNINGS.md`). If `STATE.md` records panel-refresh FLAGs for this epic (see `critics.md` "Panel refresh"), copy them into `DEMO.md`'s "what to look for" section so the review gate judges them.
- Flip the epic's row in `ROADMAP.md` to reflect its new status.
- Update `STATE.md` to point at wherever the epic now sits (verification next, or done).

Any flagged story from Wave 1 is the integrator's problem to resolve or escalate — it cannot be quietly left out of the merge without a note in `LEARNINGS.md` explaining what's missing and why.

## Verification

Dispatch one fresh-context smart-tier subagent as verifier — deliberately someone who did not write any of the epic's code, working goal-backward from the demo sentence rather than forward from the story cards.

The verifier:

- Checks whether the demo sentence is actually true, not whether the stories claim to have satisfied it.
- Re-runs the acceptance checks rather than trusting the reports.
- Pokes the edge cases listed in `DEMO.md`'s "what to look for" section.
- Checks whether the epic's key results actually moved, not just whether output was produced.

Output is a plain verdict: pass, or a redo-list of specific findings.

## The review gate

Three layers feed the gate, but only one produces its outcome: story-level acceptance checks are the worker's own responsibility during Wave 1; the verifier's goal-backward pass is the epic-level check; the gate itself is where a human — or, in full-auto autopilot, the verifier standing in for one — reads `DEMO.md` and the verifier's verdict and decides.

The gate has exactly three outcomes:

- **Approve.** The epic is done. Move to the next epic.
- **Redo.** Every tip from the human, and every finding from the verifier, gets converted into a new, concrete acceptance check on the specific story or stories it affects — not a vague "make it better" instruction. Once the affected story cards carry their new checks, re-run Wave 1 for those stories (and Wave 2 to re-integrate), then verify again. This is what stops the same piece of feedback from getting missed twice: it's a check now, not a suggestion.
- **Replan.** The epic goes back to slicing entirely — the story breakdown itself was wrong, not just the implementation. The roadmap gets re-examined in light of whatever was learned.

**Scoped redo — the cheap path.** A full redo re-runs whole story workers and re-integration; it is the most expensive move in the system. When the redo-list is patch-sized, don't pay for it. If every finding names the specific file it lives in, every named file is owned by a single already-built story, and no finding implicates `CONTRACTS.md` or a cross-story seam, then instead of re-running the wave: dispatch one cheap-tier fix worker with that story's card (now carrying its new acceptance checks) and the findings, then re-run Verification only. One scoped attempt, ever — if verification fails again, escalate to the full redo above; never chain scoped patches. A finding that can't name its file, spans stories, or questions the contract goes straight to the full redo: the scoped path is for surgical fixes, not for negotiating down real rework.

## Autopilot

Autopilot chains epic runs back to back until the roadmap is done: plan the next epic, execute it (Wave 0 through the review gate), record learnings, flip its roadmap status, then move to the next pending epic. Nothing here differs from running a single epic by hand except that the loop keeps going without waiting for a human to kick off the next one.

**Gate modes**, set once at the start of the run:

- **Interactive** (default). A human sits at the review gate for every epic.
- **Checkpoint.** Epics run and verify automatically; a human is only pinged between epics, at natural pause points, rather than gated on every single one.
- **Full-auto.** The verifier stands in for the human at every gate. Demo briefs accumulate across epics so a human can review the whole run's worth of `DEMO.md` files at the end instead of gating each one live.

Preflight (collision check + prerequisites) is required before autopilot launches at all, exactly as it is for a single epic run, and runs again before each epic inside the loop — prerequisites can go stale between epics (a key expires, a quota runs out), so re-verifying per epic instead of once at the top of the run is deliberate, not redundant.

## Circuit breakers

These are pre-registered and non-negotiable — they stop the run rather than asking it to push through or work around the problem:

- **An epic fails verification even after its full redo.** Stop the autopilot loop entirely. The longest sequence an epic ever gets is: fail → scoped redo (if eligible) → fail → full redo → fail → stop; the scoped attempt never buys an extra full redo, and an epic that skipped the scoped path stops after fail → full redo → fail. Write a `STATE.md` update recording exactly where the run stopped and why, so a human (or a resumed session) has full context without re-deriving it. This is what prevents building further epics on top of one that's still broken.
- **A prerequisite goes missing mid-run** — a key that was verified stops working, a service that was assumed present isn't there. Stop immediately. Add the item to `PREREQS.md` with its status reset to `pending`, note it in `STATE.md`, and notify whoever needs to resupply it.
- **Never fake a credential and never silently mock a missing paid service.** If a story or the integrator hits a wall because something a human needs to provide isn't there, that is always the missing-prerequisite circuit breaker above — not a reason to substitute a fake key, a stub response, or a "pretend this succeeded" workaround. A silent mock here is worse than a stopped run: it ships a demo that looks true and isn't.

## Resume protocol

Every session — whether picking a run back up after a stop, a crash, a context reset, or just a new day — starts the same way: read `STATE.md`, follow its pointers (at most three files), and continue from exactly where it says the run is. Don't re-derive status by re-reading the whole epic history; `STATE.md` is the baton, and it's kept small on purpose so this step is cheap every single time.

Close every session, without exception, with one `STATE.md` update: what's in progress, what's next, the pointers the next session needs, and any blocker. A session that stops without this update leaves the next session to reconstruct state from scratch — the entire point of the baton is that this never has to happen.
