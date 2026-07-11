---
name: verification
description: Verify existing code, a completed change, or a stated behavior with reproducible checks and explicit evidence. Use when the primary request is to test, validate, confirm a known expected outcome, or report check status without designing or implementing a change. Do not use for feature or fix implementation, investigation of an unknown root cause, defect-focused code review, implementation planning, or requirements clarification.
---

# Verification

## Define the claim

- State the behavior, acceptance criterion, regression, build property, or compatibility claim being verified.
- Inspect the relevant changes and code paths so each check measures the claim rather than a proxy.
- Keep verification read-only except for ordinary tool-generated test or build artifacts. Do not repair failures unless the user authorizes a fix.

## Select evidence-backed checks

- Derive commands from manifests, lockfiles, repository documentation, existing scripts, and CI configuration. Do not guess commands or silently replace project tooling.
- Start with the cheapest focused check that can falsify the claim, then broaden in proportion to the change's impact and risk.
- Prefer deterministic automated checks. Use a manual scenario when automation is unavailable or the behavior is inherently interactive, and define the expected observable result first.
- Preserve the user's worktree and avoid destructive baseline comparisons.

## Interpret results

- Record the exact command or scenario, exit status, and meaningful output.
- Distinguish a product failure from a pre-existing failure, environment or dependency failure, invalid test setup, and plausible flakiness.
- Use bounded reruns only when they provide evidence about flakiness; never rerun until a failure happens to pass and report it as success.
- Treat missing coverage, skipped tests, timeouts, and inconclusive observations as unverified, not passing.

## Report evidence

- Map every requested claim to its check and result: pass, fail, or inconclusive.
- Include commands, decisive evidence, failure classification, and checks not run.
- State remaining uncertainty and the smallest next check needed when evidence is incomplete.
- Never claim success without reproducible supporting evidence.
