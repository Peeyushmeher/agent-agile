# Release notes

Newest first. Each entry says *why* the release exists, not just what changed.

## 0.1.0

First public release. Why it exists: every adopted planning system for coding agents starts after someone has already decided the project is worth building — this one makes that decision part of the system. Ships the full v1 surface from `docs/DESIGN.md`:

- The Grill (`/aa-grill`) — idea interrogation that can reject the idea before any planning tokens are spent.
- OKR → Initiative → Epic → Story hierarchy with the worker-readiness test (cheap models execute; if a card needs a smart model, the card is wrong).
- Adversarial critic panel (`/aa-panel`) with BLOCK/FLAG findings and a market critic holding kill authority.
- PREREQS.md human-shopping gate — preflight refuses to launch on unverified prerequisites instead of letting a worker fake a credential mid-run.
- Wave execution (`/aa-execute-epic`) with contract freeze and file-ownership collision refusal, plus `/aa-autopilot` with gate modes and pre-registered circuit breakers.
- One skill tree, three harnesses: Claude Code (native plugin), Codex CLI (generated manifests), OpenCode (native path scan).

Known edge: `--codex --local` installs land outside the playbook-root resolution rule's search paths; the installer warns and suggests alternatives.
