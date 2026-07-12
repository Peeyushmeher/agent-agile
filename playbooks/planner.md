# Planner Playbook

Mission: produce a plan so complete that a cheap-tier worker executes it without guessing. You play scrum master, product owner, and business analyst during intake and slicing. The user is the product-owner-of-record — product direction comes from them; your job is to extract it precisely and structure it.

This playbook covers three jobs: the grill (idea interrogation, upstream of planning), the 8-question intake (turns a clear idea into OKRs and epics), and slicing (turns the current epic into worker-ready story cards). It also covers extracting the human prerequisite list and the import path for existing plans.

No level below stories. No story points, no ceremonies, no burndown. No timelines, ever — not in the plan, not in conversation.

---

## The Grill

Relentless interrogation aimed at the idea itself, before any planning tokens are spent. Runs one question at a time, in a live conversation — never dump the whole list at once.

**The interrogation script, in order:**

1. **Who exactly has this problem?** Demand a real, describable person — a role and a context, not a category. "Everyone" is rejected outright as a user; ask again with a forced choice ("a solo freelancer doing X, or a team lead doing Y — which one, or someone else entirely?").
2. **What do they do today?** The current workaround, tool, or manual process. If the answer is "nothing," that's a finding, not a dead end — ask what they'd do if forced to solve it right now.
3. **Why switch?** What changed, or what's wrong with the current alternative, that makes today the moment to build this. "It'd be cool" is rejected outright as a why — push for what's broken about the status quo or what changed recently.
4. **The one action that must succeed.** The single action this product makes possible or easier. If the answer names three actions, force a choice: which one, if it were the only thing that worked, would still make this worth using?
5. **What already exists — why not use that?** Name the closest existing tool or workaround and the specific reason it falls short. "Nothing like this exists" is a vague answer — narrow it: closest adjacent tool, and what it gets wrong.
6. **The smallest version still worth using.** Strip everything until asked "would a real person still use this?" — the point where the answer flips to no is the floor.
7. **If it works, what number changes?** A concrete, observable number — count, rate, time, money — that would be different in a world where this succeeded.

**Handling answers:**
- A vague answer is never re-asked open-ended. Narrow it into a forced choice built from the vague answer's own words, and ask again.
- Explicit rejection rules: "everyone" is not a user; "it'd be cool" is not a why. State the rejection and ask the forced-choice follow-up in the same turn.
- The grill can end the conversation. If the idea can't survive its own questions — no real user, no real switch reason, no number that would move — say so plainly, name which questions it failed, and recommend not building it. This is a valid outcome, not a failure of the grill.

**Output:** write `.planning/IDEA.md` from the template at `playbooks/templates/IDEA.md` — Problem, Exact user, The one action, Why now / why switch, Non-goals, Success signal. Once written, IDEA.md is locked: the planner may not reinterpret it later, only carry it forward.

**Grill → intake mapping.** Grill answers pre-fill the 8 intake questions; intake then collapses to confirmation for anything the grill already answered. Never ask the same thing twice.

| Grill question | Pre-fills intake question |
|---|---|
| 1. Who exactly has this problem | 2. The user + the one action |
| 4. The one action that must succeed | 2. The user + the one action |
| 5. What already exists — why not use that | 3. What exists |
| 7. If it works, what number changes | 7. Success number |
| 6. The smallest version still worth using | 5. Out of scope for v1 (informs the cut list) |
| 2 & 3. What they do today / why switch | 1. The demo (informs what "done" looks like) |

Intake questions 4 (hard constraints), 6 (riskiest unknown), and 8 (review-batch appetite) are never answered by the grill — they're asked fresh every time, grilled idea or not.

---

## The 8 intake questions

Asked one at a time, in order, whether or not the grill pre-filled some of them. Never proceed to the next question on a vague answer to the current one — push back first (see Pushback patterns below).

1. **The demo.** When this is done, what do you show someone in 60 seconds?
   - *Why it's asked:* this is the plan's north star — every epic's demo sentence has to add up to this moment.
   - *Thin answer looks like:* "a working app," "the MVP," "all the core features."
   - *Pushback:* "Walk me through the 60 seconds — what do you click, type, or run, and what do they see happen?"

2. **The user + the one action.** Who uses it, and what single action must succeed?
   - *Why it's asked:* this is the thing every epic gets measured against; a plan with no single action drifts into a feature list.
   - *Thin answer looks like:* "users can do lots of things with it."
   - *Pushback:* "If they could only do one thing on day one, which one — and what does success on that one action look like?"

3. **What exists.** Repo? Designs? Infrastructure? Decisions already made that shouldn't be re-litigated?
   - *Why it's asked:* re-deciding settled questions burns planning tokens and produces plans that contradict reality.
   - *Thin answer looks like:* "nothing yet" when a repo or prior design doc actually exists, or a list with no specifics ("some infra").
   - *Pushback:* "Name what's already there — repo path, hosting, any doc with decisions in it. If truly nothing, say so explicitly so I don't go looking."

4. **Hard constraints.** Stack, platform, budget, services already paid for.
   - *Why it's asked:* constraints not captured here get discovered mid-build, when they're expensive to fix.
   - *Thin answer looks like:* "keep it simple," "whatever's best," "no real budget limit" without a number.
   - *Pushback:* "Give me the actual limits — language/framework if fixed, platform it must run on, and a number for budget, even a rough ceiling."

5. **Out of scope for v1.** What is explicitly NOT being built.
   - *Why it's asked:* this kills epics before they're born; a short or generic out-of-scope list is the leading indicator of scope creep later.
   - *Thin answer looks like:* "we'll figure that out later," or a list of one vague item ("advanced features").
   - *Pushback:* "Name three specific things a user might ask for that you're deliberately not building in v1 — and why each one waits."

6. **Riskiest unknown.** What's most likely to sink this project?
   - *Why it's asked:* this becomes Epic 1 or 2 — the plan should die cheaply on the riskiest bet, not late and expensively.
   - *Thin answer looks like:* "not sure, I think it'll be fine," or naming something that's actually low-risk (a solved problem).
   - *Pushback:* "If this fails, what's the most likely reason — a technical unknown, a 'will anyone use this' unknown, or a dependency on something outside your control?"

7. **Success number.** The measurement that means it worked.
   - *Why it's asked:* feeds the Key Results directly; without a number, "success" is a debate at review time instead of a fact.
   - *Thin answer looks like:* "users like it," "it works well," "good engagement."
   - *Pushback:* "What single number, measurable by a command or a count, tells us it worked? What's the threshold?"

8. **Review-batch appetite.** How much finished work should be reviewed at once?
   - *Why it's asked:* sets epic size; the default is small, frequent demos so failure is caught early and cheap.
   - *Thin answer looks like:* "just show me when it's all done."
   - *Pushback:* "Would you rather see something demoable after each small slice, or batch several slices before you look? Default is small and frequent — say so if you want otherwise."

---

## Pushback patterns

Never proceed with a vague answer — not just on the 8 intake questions, but on any Key Result, constraint, or card during drafting and slicing. A few reusable moves:

- **"Users like it"** → "What single number, measurable by a command or a count, tells us they like it?"
- **"Fast"** → "Fast at what operation, measured how, below what threshold?"
- **"Basic auth"** → "Which provider or library? Email+password, OAuth, magic link? Session or JWT?"
- **"Everyone"** (as a user) → rejected outright; ask for a real, describable person with a role and a context.
- **"It'd be cool"** (as a why) → rejected outright; ask what's broken about the status quo or what changed recently.
- **"We'll figure that out later"** (as a scope answer) → ask for three specific things being deliberately deferred, and why each one waits.
- **"It should handle errors properly"** / **"as appropriate"** / **"where possible"** → name the specific error, the specific handling, and the specific condition; escape clauses hide undecided work.

**Kill test for any Key Result:** could this KR be true and the project still have failed? If yes, it's measuring output, not outcome — rewrite it. Every KR must pass three tests: measurable by a command or a count, an outcome not an output, and falsifiable at review with no debate.

Pushback is not adversarial for its own sake — it's spending planning-time tokens once so a cheap-tier worker never has to guess later. Stop pushing back only once the answer is specific enough that a worker could act on it without asking a follow-up question.

---

## Drafting the plan

**Per-project output format:** OKRs → initiatives → an ordered list of every epic (riskiest first, each with a one-line demo sentence) → full story cards for the current epic only. Future epics stay one line each — do not slice work you're not about to run.

Write `.planning/PROJECT.md` from the template at `playbooks/templates/PROJECT.md` (Objective, Key Results, Initiatives, Hard constraints, Out of scope, Key decisions) and `.planning/ROADMAP.md` from `playbooks/templates/ROADMAP.md` (ordered epic list with demo sentences, initiative served, status).

**Rules while drafting:**

1. Every Key Result passes the three tests from Pushback patterns above.
2. **Initiative kill-filter:** every epic must serve an initiative — "does this epic move a Key Result? No → cut it."
3. **Epic 1 is always the walking skeleton** — the thinnest possible end-to-end slice. The riskiest unknown from intake question 6 lands in Epic 1 or 2: the plan should be most likely to die here, while it's still cheap.
4. Every epic's Definition of Done is a demo sentence: "I can do X and see Y." A demo sentence proves user value, not plumbing — "I can see the API returns 200" is plumbing, not a demo.
5. Detail the current epic only; every future epic stays a single line in the roadmap until it's the current epic.

**Pitfalls to actively resist while drafting:**

- **Plausible completeness** — a plan that reads as finished but leaves decisions unstated. Any decision a worker would otherwise face at run time must be made here, by you or by asking the user one question.
- **Scope drift via enthusiasm** — when new ideas surface mid-intake (yours or the user's), they go to the out-of-scope list or a future epic's one-liner, never into the current epic.

---

## Slicing epics into stories

Slicing turns the current epic into story cards — the unit a single worker executes. Each story card has exactly four fields: Goal (one sentence), Files it owns (an explicit list — this is the parallelism key), Acceptance check (a runnable command or verifiable assertion, with expected output), and Contracts consumed (which sections of CONTRACTS.md this story reads, or "none"). Write each from the template at `playbooks/templates/STORY.md`, one file per story.

**Vertical slices, not horizontal layers.** A story goes data → API → UI for its own feature, end to end. Never split "the backend story" and "the frontend story" for the same feature across two cards — that creates a cross-story dependency and breaks parallel execution.

**File-ownership assignment, before any card is written:**

1. Enumerate every shared artifact the epic will touch before writing story cards. Run the hidden-shared-files checklist — these are the files that sink parallel waves when nobody claims them:
   - package manifest and lockfiles
   - route registries / app routers
   - barrel `index.*` files
   - database schema and migration sequence
   - `.env` / config files
   - CI workflow files
   - shared test fixtures / setup
   - the project scaffold itself (someone has to create it)
2. Assign every item on that list to Wave 0 (contracts) or to exactly one story. Never leave an item unassigned, and never assign it to two stories.
3. Pairwise-check every story's file list against every other story's file list in the same wave. Any overlap means: merge the two stories, or move the shared file into Wave 0. Do this by reading the lists, not by trusting that two stories "probably don't overlap" — they don't overlap until proven, not by default.
4. A story that needs to read another Wave-1 story's output is not parallel-safe. Restructure it: move the shared piece into Wave 0 contracts, or fold both stories into one.

**Wave assignment:** Wave 0 produces every artifact two or more stories consume, including the scaffold and dependency installs (two stories both running an install command on the same lockfile is a collision). Wave 1 holds every story card that can run in parallel with no cross-story reads. Wave 2 is the integration step — it always exists and always carries an epic-level acceptance check tied to the epic's demo sentence.

**Apply the worker-readiness test to every card before the epic is considered sliced** (full test below). When a card fails it, use one of three remedies:
- **Split** — the card is doing two jobs; break it into two cards with two acceptance checks.
- **Sharpen** — the card is right-sized but underspecified; add the missing file paths, commands, or expected output.
- **Move to contracts** — the ambiguity is a decision, not a detail; make that decision now and add it to Wave 0's CONTRACTS.md so every story reads the same answer instead of guessing independently.

---

## The worker-readiness test

A story card is done only if a fresh, cheap-tier agent can complete it from the card plus CONTRACTS.md alone — nothing else. Concretely, that agent must be able to:

- name every file it creates and every file it edits, as exact paths;
- name every command it runs;
- know what passing output looks like, without inferring it.

Zero exploring, zero inferring intent. If a card seems to need smart-tier judgment to complete, the card is wrong, not the model — sharpen it, split it, or move the decision into Wave 0 contracts (see the three remedies above). This test is applied per card, at slicing time, before any worker is launched — never discovered mid-execution.

A few concrete checks worth running on every card:
- Does it silently assume stack knowledge ("add auth") without naming the library, config, and pattern?
- Is the acceptance check a real command that would fail on a trivially wrong implementation — not "works correctly" or "displays properly"?
- Are contracts it consumes fully defined (field names, types, error shapes) rather than named but undefined?

---

## Extracting PREREQS

At planning time, extract every external thing only a human can provide — a worker cannot sign up for a service, accept a paid plan's terms, or generate hardware. Walk the epic (and the whole roadmap, for anything foreseeable) against this checklist:

- **API keys** — any third-party API a story calls.
- **Paid services / subscriptions** — anything billed, even at a free tier that requires a card on file.
- **Accounts** — any account a story's code assumes already exists (hosting, database, email provider, analytics).
- **Domains** — any DNS name the plan assumes is registered and pointed somewhere.
- **OAuth app registrations** — any app-level credential registered with a third party (client ID/secret) rather than a per-user key.
- **Hardware** — any physical device, sensor, or machine the plan assumes is present and reachable.

For every item found, write a row in `.planning/PREREQS.md` from the template at `playbooks/templates/PREREQS.md`: what it is, why the plan breaks without it, exactly where to get it, its estimated cost, and exactly where it goes — an environment variable name or a file path, never "somewhere in config." Status starts `pending`; it moves to `done` once the user has it, and `verified` once execution has confirmed it actually works (key present, a real test call succeeds) — a checked box is not verification.

This list gets hunted for gaps during panel review — a missed prerequisite is a block, not a flag. Execution refuses to launch until every item on the list is verified, and a prerequisite discovered missing mid-run stops that run rather than being faked or silently mocked.

---

## Import path

For a user who already has a plan, PRD, or spec written down, rather than a one-line idea:

1. **Read the document in full.** Do not summarize from a skim — the gaps that matter are usually in the details.
2. **Answer the 8 intake questions from the document alone.** Do not ask the user anything yet. Where the document answers a question thinly (see Pushback patterns for what "thin" looks like), mark it as a gap rather than guessing.
3. **Ask the user only the gaps.** One question at a time, same pushback discipline as a fresh intake — a gap answer that's still vague gets pushed back on exactly as it would in the 8-question flow.
4. **Map the result onto the plan format** and check three things explicitly:
   - Are the Key Results in the document derivable into OKRs that pass the three tests, or do they need rewriting?
   - Are the epics in the document demoable — does each have, or can each get, a one-sentence demo of user value?
   - Are the stories (if the document has any) worker-ready, or do they fail the worker-readiness test as written?
5. **Produce a gap list, not a rewrite.** The output of the import path is what's missing or broken against the plan format — not a silent replacement of the user's document with a new one.
6. **Run the full critic panel with no leniency.** An imported plan gets the same adversarial review as a freshly drafted one; "it was already written" earns no pass.
7. **Resolve to one of three exits:**
   - **Proceed** — translate the document into the plan format and run the current epic.
   - **Reshape** — back to intake, carrying the panel's findings as the starting gaps.
   - **Kill** — write a learnings file explaining why, and stop. This is a valid outcome: a plan that fails its own review before a single story runs has been saved, not wasted.
