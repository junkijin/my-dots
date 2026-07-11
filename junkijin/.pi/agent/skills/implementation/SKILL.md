---
name: implementation
description: Implement explicitly requested features, refactors, integrations, configuration changes, and build work in an existing codebase. Use only when the user authorizes concrete code or artifact changes. Do not use for explanations or questions, review-only requests, diagnosis of reported failures, verification-only requests, implementation plans, or requirements specifications; use the corresponding specialized skill instead.
---

# Implementation

## Establish the change boundary

- Confirm that the request explicitly authorizes code or artifact changes. Treat questions, explanations, reviews, and proposals as read-only.
- Preserve the requested scope, constraints, observable behavior, and compatibility commitments. Resolve only ambiguities that could materially change the result; use `clarify-requirements` when a requirements definition is itself needed.
- Use `planning` when the requested deliverable is a plan or a complex change requires an implementation plan before coding. Do not substitute a plan for an authorized implementation.

## Understand the code path

- Read applicable project instructions before editing.
- Inspect the relevant entrypoints, implementations, callers, contracts, types, schemas, configuration, tests, and manifests. Trace enough of the control and data flow to understand the change's effects.
- Inspect the current worktree state. Treat pre-existing and unrelated changes as user-owned; never discard, overwrite, or reformat them incidentally.
- Derive conventions and supported commands from repository evidence rather than assumptions.

## Implement the change

- Make the smallest coherent change that fully satisfies the request. Prefer established local patterns unless the task requires changing them.
- Preserve unrelated behavior and public contracts unless their change is explicitly in scope.
- Update tests, types, schemas, configuration, or documentation when the changed behavior makes them part of the same coherent change.
- Avoid opportunistic cleanup that obscures the requested delta.
- Commit, push, publish, deploy, or open a pull request only when separately authorized.

## Review and verify

- Inspect the final diff for correctness, completeness, accidental edits, stale references, and unintended contract changes.
- Run the most relevant available checks for the changed behavior. Start focused and broaden in proportion to impact and risk.
- Classify failures as introduced by the change, pre-existing, environment-related, or plausibly flaky. Fix in-scope regressions; do not broaden the task merely to make an unrelated check green.
- Never describe a skipped, failed, or inconclusive check as passing.

## Report completion

- Summarize the behavior implemented and the files changed.
- Report each verification command and its result.
- State checks not run, unresolved limitations, and remaining risks plainly.
