---
name: code-review
description: Review a diff, patch, commit, pull request, or bounded code area for concrete defects and engineering risks. Use when the user explicitly asks for code review, review findings, or a risk assessment of code changes. Keep review read-only unless the user separately requests fixes. Do not use for implementation, root-cause debugging, verification-only work, implementation planning, requirements clarification, or general code explanation.
---

# Code Review

## Establish review scope

- Identify the requested change, requirements, comparison base, and exact diff or code boundary.
- Inspect the complete relevant diff and enough surrounding code to understand behavior.
- Trace affected callers, consumers, contracts, state transitions, error paths, configuration, and tests. Verify claims against repository evidence.
- Do not modify files unless the user separately authorizes fixes.

## Look for actionable defects

Prioritize:

- correctness and data integrity;
- security, privacy, and authorization boundaries;
- concurrency, lifecycle, resource, and failure behavior;
- API, schema, configuration, platform, and backward compatibility;
- missing or misleading tests for material behavior.

Ignore preferences and cosmetic issues unless they create a concrete maintenance or correctness risk. Report only findings that are specific, reproducible or logically demonstrable, and actionable within the reviewed scope.

## Grade findings

- Assign **P0** to an immediate catastrophic or release-blocking failure.
- Assign **P1** to a high-impact defect likely to affect production or security.
- Assign **P2** to a material defect under realistic conditions.
- Assign **P3** to a localized lower-impact defect worth correcting.

Use the lowest severity supported by the evidence.

## Report findings first

For each finding, provide:

1. severity and concise title;
2. exact file and narrow line location;
3. triggering condition and supporting evidence;
4. user or system impact;
5. focused fix direction.

Order findings by severity. Put summaries after findings. If no actionable finding is supported, state that explicitly and mention only material residual risks or test gaps; do not manufacture issues to fill the review.
