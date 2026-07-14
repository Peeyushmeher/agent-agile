<!-- Written once during intake; edit by hand if the harness or budget changes. -->
# CONFIG
- **profile:** <quality | balanced | budget — optional one-word preset; explicit tier lines below override it>
  - `quality` — smart tier everywhere, including story workers. For projects where correctness outweighs cost.
  - `balanced` — the default split: smart tier for planning/contracts/integration/verification, cheap tier for story workers.
  - `budget` — smart tier ONLY for Wave 0 contracts (contract errors cascade — never economize there); cheap tier everywhere else, including the integrator and verifier. Accepts weaker integration judgment in exchange for cost.
- **smart_tier:** <model for planner/critics/contracts/integrator/verifier — your harness's strongest>
- **cheap_tier:** <model for story workers — cheapest that passes worker-ready cards>
- **gate:** <interactive | checkpoint | full-auto>
- **commercial:** <yes|no — yes adds the market critic to panels>
