# Release notes

Newest first. Each entry says *why* the release exists, not just what changed.

## 0.2.0

Agents fail at handoffs, so this release makes every handoff machine-checkable. Grounded in Anthropic's CwC 2026 material (a subagent returning "fairly confident" instead of `0.72` failed an eval; 216k→7.6k tokens by scripting instead of reading) and a full survey of the lane — every steal-worthy idea from GSD, BMAD, gstack, spec-kit, Kiro, Agent OS, superpowers, and Ralph is either in here or documented as rejected.

- **Typed story reports** — `SN.report.md` is now a fixed schema the integrator parses, not reads: status, files touched, acceptance command + verbatim output, deviations, contract-change requests, dead ends. Prose demoted to a `notes:` field.
- **Contracts pin exact shapes** — every cross-story interface needs the exact return shape, one populated example, and the failure shape. Signatures alone are not a contract.
- **Graders + control cases** — acceptance checks declare one of 5 grader types; every epic re-runs a previously-passing control case in Wave 2 so a "fix" that regresses something is caught mechanically; repair-loop fixes mint new control cases (capped).
- **Bounded repair loops** — story self-verify and Wave 2 verify run up to 3 repair rounds against the deterministic check before FAIL; unsatisfiable-check diagnosis (same finding + unchanged files after a redo = the check is wrong) stops the expensive failure spiral.
- **DECISIONS.md ledger + ambiguity protocol** — settled questions are never re-asked across sessions; ~70–80% of ambiguities auto-resolve via encoded principles; security/paid/irreversible always escalate.
- **Readiness dashboard** — a mechanical gate table before Wave 1: contracts frozen, every card typed, every check graded, control case declared.
- **Design layer** (`playbooks/design.md`) — UI stories carry a `data-verify-*` DOM contract with headless `__verify.runAll()`; verifier walks a 10-item falsifiable design audit; every epic's review gate renders a clickable `DEMO.html` from parsed reports; 2–4 HTML design directions pre-Wave-0.
- **The agent tree** (`playbooks/system.md`) — two-level tree, depth by sequencing never nesting; four-part dispatch briefs (inputs by path, never pasted); typed ~1–2K compressed returns; `dead_ends` survive handoffs; one writer per artifact; STATE.md externalized at every wave boundary.
- **Context budget doctrine** — orchestrator operates in the front half of its window (≤~40–50% fill); predictive check at wave boundaries (fill + next-wave estimate ≥~60% → hand off first); workers can return PARTIAL for one orchestrator-dispatched continuation; auto-compact is an emergency brake, never a plan.
- **Steal-list v2** — EARS grammar for acceptance checks/KRs, `discover-standards` step in `/aa-import`, counter-metrics ("do not optimize") per objective, completion-promise gate on autopilot exit, quality/balanced/budget cost profiles, constitution versioning on PROJECT.md, broad-regression cadence at panel-refresh epics.
- **Research fan-out + risk fixtures** — multi-epic roadmaps dispatch two parallel smart-tier researchers (domain edges, ecosystem prior art) after the first roadmap draft, producing a `RESEARCH.md` risk register. Risks ranked `fixture` become fixture stories pinned before feature stories build on the edge; an ignored fixture row is a BLOCK.
- **Panel-pass scaling** — the critic-panel gate scales with roadmap size: 1 epic skips, 2–4 get one full pass, 5+ add a spec+execution panel refresh at every third slicing. Bounded, position-derived, no stored state.
- **QUICKSTART.md** — step-by-step first run, and the README quickstart no longer skips `/aa-new-project`.

12 of these land below the user surface — no new commands, no new flags. The command surface stays at ~11.

## 0.1.2

Stress-test hardening. Why it exists: v0.1.0 was benchmarked head-to-head against two other planning systems on the same project the day it shipped; this release fixes what the test surfaced.

- **Scoped redo** — the expensive path in the whole system was the redo cycle (~275–300k tokens re-running full waves). A patch-sized redo-list (file-specific findings, one story, contracts untouched) now takes a cheap path: one fix worker plus re-verification. One scoped attempt max; the circuit-breaker ladder stays bounded at fail → scoped → fail → full → fail → stop.
- **Contracts own their invariants** — every data-store invariant must name an owner: writer guarantees it, or readers tolerate violations. Closes the gap class where a blind judge found a duplicate-date undercount in stress-test output.
- `--codex --local` installs now work: `./.agents/agent-agile/playbooks` joined the playbook-root resolution rule (project-local resolves before home-level), and the installer warning is gone.
- `/aa-panel` wording now matches the critic agents: each critic gets Panel protocol *plus* its own section.
- npm hygiene: tarball allowlist (no internal plans/tests), repo metadata, `npm test` fixed on Windows.

## 0.1.1

(Tagged mid-stream; superseded by 0.1.2 the same day — the codex-local fix and npm prep landed here.)

## 0.1.0

First public release. Why it exists: every adopted planning system for coding agents starts after someone has already decided the project is worth building — this one makes that decision part of the system. Ships the full v1 surface from `docs/DESIGN.md`:

- The Grill (`/aa-grill`) — idea interrogation that can reject the idea before any planning tokens are spent.
- OKR → Initiative → Epic → Story hierarchy with the worker-readiness test (cheap models execute; if a card needs a smart model, the card is wrong).
- Adversarial critic panel (`/aa-panel`) with BLOCK/FLAG findings and a market critic holding kill authority.
- PREREQS.md human-shopping gate — preflight refuses to launch on unverified prerequisites instead of letting a worker fake a credential mid-run.
- Wave execution (`/aa-execute-epic`) with contract freeze and file-ownership collision refusal, plus `/aa-autopilot` with gate modes and pre-registered circuit breakers.
- One skill tree, three harnesses: Claude Code (native plugin), Codex CLI (generated manifests), OpenCode (native path scan).

Known edge: `--codex --local` installs land outside the playbook-root resolution rule's search paths; the installer warns and suggests alternatives.
