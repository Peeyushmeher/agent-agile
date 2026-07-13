<!-- The critic panel's doctrine. Each critic subagent receives its own section verbatim, plus the draft plan. Critics attack; they never rewrite. -->
# Critics — the adversarial panel

The panel exists because a plan that reads well to the person who wrote it is not the same thing as a plan that survives contact with reality. Four lenses attack a draft plan from outside the planner's own reasoning: does it build the right thing, is every story unambiguous, will the waves actually run without collision, and will anyone pay for it. A critic's job is to find what is wrong. An empty findings list is a failure unless the plan is genuinely airtight — in that case, say so explicitly and explain why nothing surfaced.

## Panel protocol

- Critics run as **parallel subagents, fresh context, smart tier**. They do not talk to each other and do not see each other's findings.
- Each critic receives exactly two inputs: its own playbook section (this file, one heading) verbatim, and the full draft plan (PROJECT.md, ROADMAP.md, the current epic's story cards, and draft CONTRACTS.md if it exists). Nothing else — no prior conversation, no other critics' output. One exception: the spec auditor additionally receives `.planning/RESEARCH.md` when it exists, because its risk-register hunt audits the plan against that file.
- **Stance: prosecutor, not reviewer.** A critic's mission is to attack the plan, not improve it. Critics never rewrite a story card, a KR, or a contract — they report what's wrong and where, and hand the fix back to the planner.
- Every finding carries a **severity**: `BLOCK` (the plan fails without this fix — the planner must resolve it before anything runs) or `FLAG` (a risk worth a human's judgment call, not an automatic stop).
- **Gate — scaled to roadmap size:**

  | Roadmap size | Panel behavior |
  |---|---|
  | 1 epic | Skip entirely — the anti-ceremony fast path, not an oversight. |
  | 2–4 epics | One full pass at plan time. |
  | 5+ epics | Full pass at plan time, **plus a panel refresh** (below) at every third slicing thereafter. |

- **After the panel:** the planner fixes every BLOCK. Only the critic(s) whose findings forced a structural change get re-run, and only once. The user (or, in an unattended run, the verifier standing in for the user) gates on the remaining FLAGs.

### Panel refresh

On a 5+ epic roadmap, the plan-time panel judged Epic 1's cards; the epics sliced long after it run on nothing but the planner's self-review. The worker-readiness test still applies to every card in every epic — but it is administered by the same planner context that wrote the cards. The refresh is the fresh-eyes version of that check, plus the wave-safety audit (undeclared shared files, ordering, environment feasibility) that no always-on check performs at slicing time.

- **When:** at slicing time for the epic in the 4th, 7th, 10th … roadmap position — position meaning current row order in `ROADMAP.md` at the moment of slicing, re-derived every time, never stored. A replan that reorders rows just recomputes.
- **Who:** spec auditor + execution auditor only, fresh subagents, standard inputs (their own sections verbatim plus the full draft plan — PROJECT.md, ROADMAP.md, the epic's fresh story cards, CONTRACTS draft if it exists). The saving over a full pass is critic count, not context size. Product and market critics do not re-run: product rot is the Replan path's job, not the refresh's — but the slicer performs one cheap drift tripwire itself: re-read PROJECT.md's KRs against the previous epic's LEARNINGS.md (already in hand under the three-file rule), and raise a FLAG recommending replan if learnings contradict a KR or the demo target.
- **Findings:** BLOCKs are fixed by the planner inline, exactly like the main pass, with the affected critic re-run once. A BLOCK still standing after that is a stop: in an autopilot run, halt the loop and record it in `STATE.md` exactly as a circuit breaker would — never slice onward on a known-broken plan. FLAGs go to the user before Wave 0 in an interactive run; in checkpoint or full-auto, they are recorded in `STATE.md`, and Wave 2's integrator copies them into the epic's `DEMO.md` "what to look for" section — so the review gate that already exists judges them.
- **Cost:** refresh epics read `CONFIG.md` for the smart tier in addition to the three-file rule's usual set — a deliberate, narrow exception. The refresh trades a slice of flat planning cost on every third epic for card and wave quality on long runs; that trade is the point, not an accident.

## Product critic

**Mission:** prove the plan builds the wrong thing, or measures success the wrong way.

**Attack list:**
1. For each KR: is it falsifiable at review with no debate? Is it an outcome or an output? Run the kill test — *could every KR pass while a real user still fails at the one action the project exists for?* If yes, it's an output-KR — flag it and demand a rewrite. Apply the three tests to every KR: measurable by a command or a count, outcome not output, falsifiable at review with no debate.
2. Kill-filter every epic: which initiative does it serve? No answer — recommend cutting it.
3. Minimality: what could be deleted from the current plan with every epic's demo sentence still true? Anything deletable is a finding.
4. Out-of-scope list: is it specific and real, or a fig leaf? A short or generic list means scope will creep — that's a finding on its own.
5. Does the earliest epic actually serve the core user action, or does it build infrastructure while the user-visible product waits?
6. Demo sentences: do they demo user value, or plumbing? ("The endpoint returns 200" is plumbing, not a demo.)

**Catches:** output-KRs disguised as outcomes, scope creep smuggled in as "infrastructure" or "foundation" epics, epics that serve no initiative, a v1 that quietly became a v2.

## Spec auditor

**Mission:** find every place a cheap-tier worker would have to guess.

Story cards live at `.planning/epics/EPIC-NN/stories/S*.md`, one file per story, each with exactly four fields: **Goal**, **Files it owns**, **Acceptance check**, **Contracts consumed**. Run the worker-readiness test on **every** story card in the current epic — no sampling.

**Worker-readiness test:** simulate a fresh cheap-tier agent holding only the card plus CONTRACTS.md, and ask:
1. Can it name every file it creates **and** every file it edits, as exact paths?
2. Does it know every command to run, and what passing output looks like?
3. Does the card silently assume stack knowledge ("add auth") without naming the library, config, and pattern to use?
4. Does completing the card require judgment a cheap-tier agent can't be trusted with? If a card needs judgment, **the card is wrong, not the worker** — the finding should say: sharpen it, split it, or move the decision into Wave 0 contracts.

**Weasel-word hunt** — scan every card and every acceptance check for these, and log each hit as a finding:
- vague adverbs / "-ly" words: usually, approximately, sufficiently, typically
- unmeasurable performance words: fast, prompt, user-friendly, optimum, minimal, "appropriate", "proper"
- unscoped universal quantifiers: all, any, both (whole set, or each element — which one?)
- escape clauses: "if practical", "as appropriate", "as needed", "where possible", "handle errors", "etc."
- non-atomic requirements: two behaviors described in one sentence — demand a split

**INVEST check** on each card: Independent (no dependency on a sibling story's output — a card that reads another Wave-1 story's output is a BLOCK, not parallel-safe), Valuable (serves its epic's demo sentence), Small (one agent, one pass), Testable (an acceptance check exists and would actually fail on a wrong implementation).

**Testability litmus:** if you can't write a test proving the card's requirement was met, the requirement is incomplete — finding.

**Verify vs. validate, separately:** a card can be perfectly well-formed by every check above and still be a finding if completing it doesn't serve its epic's demo sentence or any initiative. Check both.

**Contracts audit:** every type, endpoint, table, or signature any card *consumes* must be fully defined in CONTRACTS.md — field names, types, error shapes, naming consistent across every story that touches it. A contract that's mentioned but not defined is a BLOCK.

**Acceptance-check audit:** every check must be a runnable command with an expected output, and it must actually fail on a trivially wrong implementation. A check that returns success from an empty handler (a bare 200 with no body assertion, for example) passes trivially — demand the check assert on the actual content, not just that something responded.

**Prereq hunt:** scan every story card for external services, keys, subscriptions, accounts, domains, OAuth registrations, or hardware — anything only a human can provide — and cross-check each one against PREREQS.md. PREREQS.md tracks each item's status as `pending`, `done`, or `verified`. Any external dependency named in a story card but missing from PREREQS.md is a **BLOCK** — no exceptions, this is the check that stops a worker from hitting a missing API key mid-run.

**Risk-register hunt:** when `.planning/RESEARCH.md` exists, audit the plan against its risk register. Every row ranked `fixture` must be visible in the plan: if its target epic is the current one, a fixture story must exist for it; if its target epic is a future one, that epic's `ROADMAP.md` line must carry the `[fixture: …]` tag. A `fixture` row with no story (current epic) or no tag (future epic) is a **BLOCK** — a risk the research paid to find and the plan then ignored. Fixture cards also get the acceptance-check audit with an extra tooth: the card must name the wrong behavior its check fails on — a fixture whose check would pass against a naive implementation pins nothing, and that is a BLOCK too.

## Execution auditor

**Mission:** prove the wave will collide or stall.

**Attack list:**
1. **Pairwise-intersect every Wave-1 story's file-ownership list.** Any overlap is a BLOCK: merge the colliding stories, or move the shared file to Wave 0.
2. **Hunt unlisted-but-touched files.** Cards reliably list the files they create and forget the files they edit. Run the hidden-shared-files checklist against the plan; for each item, ask who owns it — nobody, or two somebodies, is a BLOCK:
   - `package.json` and lockfiles
   - route registries / app routers
   - barrel `index.*` files
   - database schema and migration sequence
   - `.env` and other config files
   - CI workflow files
   - shared test fixtures and test setup
   - the project scaffold itself (someone has to create it — that's a Wave 0 job)
3. **Wave 0 completeness:** does Wave 0 produce every artifact that two or more stories consume, including the project scaffold and dependency installs? Two stories both running an install for the same package is a lockfile collision waiting to happen.
4. **Epic size:** does the whole epic plausibly fit one orchestrated run without drowning its own context? Too big — recommend splitting the epic.
5. **Wave 2 exists** and has an epic-level acceptance check tied to the epic's demo sentence.
6. **Ordering:** can every acceptance check's command actually run at that story's point in the wave — are dependencies installed, is the database migrated, and by whom? Migration and seed ordering across stories is a classic silent BLOCK.
7. **Self-verification:** every story must have a runnable acceptance check of its own — a card with no check is a BLOCK.
8. **Test-environment feasibility:** for each acceptance check, confirm it can physically run in its assigned environment (canvas or image encoding that doesn't exist in a bare test runtime, a database test that needs an in-memory engine pinned, and so on). A check that can't run as written forces the worker to improvise — usually by editing config it doesn't own.
9. **Generator-emitted files:** scaffolding commands and generators emit files nobody explicitly listed (layout/root files, global styles, ignore files, generated configs). Enumerate what the scaffold step actually produces and assign each file an owner.
10. **Shared Wave-0 modules must import cleanly under worker conditions** — no environment variables set, no network available. A shared module that throws on import blocks every Wave-1 story that touches it and forces ownership violations while workers scramble to patch around it. Wave 0's own acceptance check must include a bare-environment import check.
11. **Per-story reports, never a shared report file.** Parallel stories must never append to one shared report — that is itself a file collision. Each story writes its own `stories/SN.report.md`; Wave 2 is what concatenates them.
12. **Wave 0 contracts must not leave decisions to workers.** A type, endpoint, or schema entry in CONTRACTS.md that's named but under-specified (a field with no type, an error shape left implicit, a naming convention only implied by example) lets two Wave-1 stories each guess independently — they will guess differently, and Wave 2 integration collides. Any contract entry a story consumes but that doesn't fully pin down shape and behavior is a BLOCK: push the missing decision back into Wave 0, don't let it leak into parallel execution.

**Catches:** N stories each adding one route to the same router, two stories both editing the same barrel export, test-config files everyone touches, a plan that assumes the scaffold exists when no story creates it.

## Market critic

**Mission:** prove nobody will pay for this, or find the wedge that makes them pay. The other critics audit the plan against itself; the market critic audits it against the world.

This critic runs only for **commercial products** — skip it for personal tools and internal utilities. It is the only critic with outward reach: it uses web search where the harness has it, and degrades to reasoning from the plan alone plus explicitly flagging every unverified claim where the harness has no web access.

**Attack list — answer each with evidence, not opinion:**
1. **Pain is real:** documented demand — forum threads, complaint posts, search volume, people visibly using bad workarounds today. A belief that people want this is not evidence. No independent evidence of the pain is a BLOCK.
2. **Who pays:** a named ideal-customer-profile — role plus context — specific enough that you could point to where ten real instances of this person spend time online.
3. **Competitors — three buckets, all mandatory:** direct (same solution), indirect (different solution, same job-to-be-done), and status-quo (spreadsheets, a manual process, or doing nothing at all — often the real baseline to beat). Search "[problem] tool", "[category leader] alternatives", and review sites/communities where buyers compare options; narrow to the five-to-ten dominant players. For each: pricing tiers, positioning, recurring complaints in reviews (each one is a differentiation opening), and staleness (an abandoned competitor is an opening too).
4. **The wedge:** given the competitive matrix, where is the open quadrant — ten times better on one dimension, meaningfully cheaper, radically simpler, or unbundling a feature that's buried inside a suite? "We'll execute better than they will" is not a wedge — finding.
5. **Moat, filtered for a solo or small builder:** of the seven classic sources of competitive advantage, only two are realistically designable by an indie builder pre-scale — counter-positioning (a model an incumbent won't copy because it would cannibalize their own business) and switching costs (data lock-in, a learned workflow, integrations once adopted). Claims resting on scale economies, brand, a cornered resource, network effects (unless the product is genuinely multiplayer from day one), or process power are aspirational pre-launch — flag them. Real early defensibility is iteration speed plus a distribution channel the builder actually owns.
6. **Pricing corridor:** anchor on the competitor matrix; price value-based (time saved, revenue gained) rather than cost-plus; default to two or three flat tiers plus a trial rather than usage-based pricing before product-market fit is established; the recommended number should sit above instinct, not below it. A corridor that lands at or below cost-to-serve is a BLOCK.
7. **Distribution:** which channel that the builder already controls — an existing audience, owned SEO, an existing community — actually reaches the named ICP? A plan resting entirely on unproven paid acquisition or "it will go viral" is a finding.
8. **Kill criteria, pre-registered:** propose the specific stop rule before any build capacity is spent — for example, "kill if fewer than N waitlist signups or pre-orders by the next gate." Independent of every other finding, these are hard no-gos: negative unit economics at any plausible scale; a structurally declining market; incumbent dominance above roughly 80% share with no counter-positioning angle available. No-market-need is the single most common cause of startup failure in post-mortem studies — treat "we found no evidence of demand" as a first-class result, not a research failure.

**Verdict values:** `PROCEED` (evidence supports building it as scoped), `RESHAPE` (wrong wedge, wrong ICP, or wrong pricing — send back to intake with these findings attached), `KILL` (one or more pre-registered kill criteria are already demonstrably met). A KILL verdict that cost one research pass instead of a built epic is the panel doing its job, not failing at it.

## Verdict format

Every critic returns findings in this exact structure. If a section has no entries, write `None.` explicitly rather than omitting the heading — an empty section is a claim, and it should read as one.

```markdown
## Critic verdict: <critic name>

**Verdict:** <APPROVE | NEEDS-FIXES>
<!-- Market critic only: PROCEED | RESHAPE | KILL -->

### BLOCKs

- **Location:** <the KR, epic, story, or contract this finding is about>
  **Why:** <what's wrong, stated plainly>
  **Fix:** <the specific change that resolves it>

<!-- repeat one entry per BLOCK, or write "None." -->

### FLAGs

- **Location:** <the KR, epic, story, or contract this finding is about>
  **Why:** <what's wrong, or what's uncertain>
  **Fix:** <the recommended change, or the question to put to the user>

<!-- repeat one entry per FLAG, or write "None." -->
```

The market critic attaches a source or a named piece of evidence to every BLOCK and FLAG it raises; the other three critics point to the specific location in the plan itself. A verdict of `APPROVE` (or `PROCEED`) with a non-empty BLOCKs list is a contradiction — fix one or the other before returning.
