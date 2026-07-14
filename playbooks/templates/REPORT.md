<!-- Written by each story worker at completion, one file per story (stories/SN.report.md). The machine-checkable fields ARE the handoff: the integrator parses this file, it never infers status from prose. -->
```yaml
story: S<N>
status: PASS | FAIL | NOT-WORKER-READY
files_touched:
  - <every file created or edited, exact relative paths>
acceptance_cmd: <the exact command run>
acceptance_output: |
  <last lines of the real output, verbatim — never a paraphrase>
repair_rounds_used: <0-3>
deviations: []                 # anything done differently than the card said, or empty
dead_ends: []                  # approaches tried and abandoned, with one-line reasons — so a redo never repeats them
contract_change_requests: []   # requests only — a worker never edits CONTRACTS.md
notes: <optional, at most 2 lines — nothing load-bearing goes here>
```
