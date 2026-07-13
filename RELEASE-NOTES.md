# Release notes

Newest first. Each entry says *why* the release exists, not just what changed.

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
