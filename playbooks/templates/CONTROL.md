<!-- The epic-to-epic regression tripwire. Wave 2 re-runs every row before the epic reaches its gate — a "fix" that breaks something previously green is caught here, mechanically. Rows are minted at gate level only: the epic-level check of every approved epic, plus any redo finding's new acceptance check once it passes. Cap: 5 rows — when full, retire the oldest row that is not an epic-level demo check. Workers never read this file. -->
# CONTROL — previously-green checks

| Added after | Check (runnable command) | Expected |
|---|---|---|
| <EPIC-NN approval \| EPIC-NN redo> | <exact command> | <what passing output looks like> |
