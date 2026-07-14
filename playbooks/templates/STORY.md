<!-- Written by the epic planner during story slicing, one file per story; a worker reads only its own card plus CONTRACTS.md. -->
# S<N>: <goal in one sentence>

**Goal:** <one sentence>

**Files it owns:**
```files
<one relative path per line — this story may touch ONLY these files>
```

**Acceptance check:** <runnable command or verifiable assertion, with expected output>

**Grader:** <how pass/fail is decided — exact_match | numeric_tolerance(±x%) | regex_present | efficiency(<token or wall budget>) | llm_judge(<rubric>). llm_judge only when no deterministic grader exists, and its rubric is pinned here, not improvised at check time.>

**Contracts consumed:** <sections of CONTRACTS.md this story reads, or "none">
