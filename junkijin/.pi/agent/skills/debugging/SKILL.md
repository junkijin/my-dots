---
name: debugging
description: Diagnose or fix a concrete error, test failure, regression, crash, hang, performance problem, flaky behavior, or other incorrect runtime behavior. Use when the user asks for a root cause, investigation, or repair of a reported malfunction. Distinguish diagnosis-only requests from requests that authorize a fix. Do not use for general feature implementation, review-only work, verification of already-understood behavior, implementation plans, or requirements specifications.
---

# Debugging

## Set the boundary

- Determine whether the user requested diagnosis only or authorized a fix. Keep diagnosis-only work read-only.
- Define the observed symptom, expected behavior, affected scope, and available evidence. Do not convert an unconfirmed suspicion into a fact.

## Find the root cause

1. Reproduce the failure with the smallest reliable case available. Capture the exact inputs, environment, command, output, and failure boundary.
2. Trace the failing path through relevant callers, state, contracts, dependencies, and recent changes.
3. Form evidence-backed, falsifiable hypotheses. Rank them and test one meaningful variable at a time.
4. Use each result to confirm, reject, or refine a hypothesis. Continue until the causal mechanism explains the symptom and relevant edge cases.
5. If reproduction is impossible, report what was attempted and what evidence is missing. Never invent a root cause.

Do not suppress the symptom with broad exception handling, retries, disabled checks, weakened assertions, or special cases unless evidence shows that behavior is the correct causal fix.

## Apply an authorized fix

- Inspect the worktree and preserve pre-existing user changes.
- Change the narrowest coherent layer that owns the faulty behavior.
- Add or update a regression test when practical so it fails for the original defect and passes for the fix.
- Keep unrelated defects outside scope; report them separately when material.

## Verify and report

- Re-run the original reproduction, then run focused regression checks and broader checks justified by the impact.
- Separate failures caused by the defect or fix from pre-existing, environment-related, and flaky failures.
- Report the reproduction, root cause, supporting evidence, changes made if authorized, verification results, and residual uncertainty.
