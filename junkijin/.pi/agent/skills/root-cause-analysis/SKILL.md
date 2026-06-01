---
name: root-cause-analysis
description: Use this skill for any debugging, bug fix, failing test, regression, incident, flaky behavior, production issue, or ambiguous technical problem. Load it before proposing or applying a fix. Separate observable symptoms from hypotheses, identify the most likely root cause with evidence, create or find a reproduction path, apply a targeted fix, and validate the result. Do not use for requests where the user explicitly asks for only a quick guess.
---

# Root Cause Analysis

## Workflow

1. Separate observable symptoms from hypotheses.
2. Rank plausible causes by likelihood.
3. Identify the most likely root cause with evidence.
   - Explain the mechanism that produces the observed symptoms.
   - Cite concrete evidence such as code paths, logs, tests, or reproduction behavior.
   - Note important alternatives and why they are less likely.
4. Reproduce before fixing when feasible.
   - Prefer a failing test, command, script, or user flow.
   - If direct reproduction is not feasible, use the closest reliable proxy and state the limitation.
5. Apply a small targeted fix for the root cause.
6. Validate using the reproduction path and relevant checks.

## Guardrails

- Do not treat suspicious code as root cause without evidence.
- If confidence is low, state what evidence is missing.
