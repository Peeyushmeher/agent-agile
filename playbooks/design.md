# Design playbook — UI epics, verifiable frontends, and the human review surface

This playbook activates when an epic is a **UI epic** — its demo sentence describes something a person sees or clicks ("I can do X *and see Y* in the browser/app"), not a CLI result or an API response. Non-UI epics skip everything here except the demo brief rendering, which applies to every epic.

Three mechanisms, in pipeline order: **design directions** (before Wave 0, optional), the **data-verify contract** (Wave 0 through Wave 2, required for UI epics), and the **design audit** (verification, required for UI epics). Plus one universal rule: the demo brief renders as clickable HTML.

The doctrine behind all four: UI quality here is never a score. A score is a vibe with a number on it. Everything below is either a runnable probe, a falsifiable checklist item that converts into an acceptance check, or a decision recorded in the ledger — and every finding that survives a gate becomes a permanent regression check in `CONTROL.md`, exactly like any other finding.

## Design directions (before Wave 0 — optional, first UI epic only)

When the project's first UI epic is being sliced and no design system exists yet (no component library chosen, no tokens defined), the planner emits **2–4 design directions** before Wave 0: `epics/EPIC-NN/directions/D1.html` through `D4.html`, each a self-contained single HTML file (inline CSS, no external requests, representative fake data) showing the same core screen taken in a genuinely different direction — not four shades of the same layout.

The user clicks through them and picks one, possibly with amendments ("D2, but denser"). The pick is appended to `.planning/DECISIONS.md` — a design direction chosen once is never re-litigated by a later epic. Wave 0's `CONTRACTS.md` then encodes the chosen direction as tokens in its Conventions section: color roles, type scale, spacing scale, radii, and the interaction-state conventions every story must consume. From that point on, design consistency is a contract question, not a taste question.

Skip this step entirely when a design system already exists or the user brings designs — record nothing, just proceed.

## The data-verify contract (required for every UI epic)

A UI acceptance check that depends on a model looking at a screenshot is a vibe. The data-verify contract turns frontend verification into runnable commands:

- **Components declare their probe surface.** Every component a story builds emits `data-verify="<component-id>"` on its root element, and `data-verify-state="<value>"` attributes for any internal state worth asserting (loading, empty, error, item count, active selection).
- **The epic exposes `window.__verify.runAll()`** — a probe registry, owned as a file by one Wave 1 story (or Wave 0 if several stories register probes). Each probe asserts fixtures and invariants against the live DOM and returns structured results; `runAll()` returns `{"passes": N, "failures": [...]}` with each failure naming its probe and what it expected. Probes ship with the code and cost nothing in production (behind a dev flag if the user wants).
- **Story cards use it.** A UI story's acceptance check is a headless run — launch the app, execute `window.__verify.runAll()` via the harness's browser tooling or a driver script, assert on the JSON. Grader: `exact_match` or `regex_present` on the output — deterministic, like every other check in this system.
- **Wave 2's epic-level check runs `runAll()` headless** across the whole epic and requires zero failures, alongside exercising the demo sentence for real.

The planner writes the probe expectations into the story cards at slicing time; the spec auditor treats a UI story card with no data-verify contract — no component id, no probe, no headless check — as a finding, the same class as a card with no grader.

## The design audit (verification step, UI epics only)

When the verifier runs on a UI epic, it additionally walks this checklist against the live, running UI — every item falsifiable, none of them a score. A miss is a finding; like every verifier finding, it must be written concretely enough to become an acceptance check on a specific story, and once fixed and green it joins `CONTROL.md`.

1. **Interaction states:** every interactive element shows visible hover, focus, active, and disabled states. Tab through the whole surface — anything focusable with no visible focus indicator is a finding.
2. **The empty/loading/error triad:** every surface that renders data has all three states, reachable with fixtures (empty dataset, delayed response, failing response). A data surface with only a happy path is a finding.
3. **One spacing scale:** spacing values come from the scale the contracts declare. One-off pixel values are findings.
4. **One type scale:** same rule for font sizes and weights.
5. **Contrast:** body text at 4.5:1 minimum, large text at 3:1 — checked with a script or tooling, not by eye.
6. **Keyboard path:** the epic's demo sentence is completable keyboard-only, end to end.
7. **Responsive floor:** no horizontal scroll at 360px width; layout intact at 768 and 1280. (Adjust widths only if the contracts declare different targets.)
8. **One primary action per view:** a view with two competing primary buttons, or none, is a finding.
9. **Slop tells:** leftover placeholder text, icon-only buttons with no accessible label, emoji standing in for icons, unstyled default-blue links inside a styled UI, border radii that differ for no stated reason. Each tell is a finding.
10. **Motion:** transitions are brief and purposeful, and the UI respects `prefers-reduced-motion`.

The checklist is append-only, like every playbook: a UI failure mode discovered in a real run gets added here, not remembered.

## The demo brief renders as HTML (every epic, not just UI)

`DEMO.md` stays the canonical, machine-read brief — the verifier and the gate logic parse it. But humans demonstrably skim long markdown, so the integrator additionally renders **`DEMO.html`** next to it: a self-contained single file (inline CSS, no external requests) built *from parsed data, not re-written prose*:

- a verdict banner — the readiness dashboard result and the verifier's verdict, green or red, first thing visible;
- the demo sentence, and the how-to-test steps as a numbered list with copyable commands;
- a story table parsed from the typed `SN.report.md` fields: story, status, repair rounds used, deviations — colored by status;
- the control-set results table;
- the what-to-look-for list, including any panel-refresh FLAGs routed here.

Nothing in `DEMO.html` may exist only there — it is a rendering of `DEMO.md` plus the parsed reports, never a third source of truth. The review gate opens the HTML; the machines keep reading the markdown.
