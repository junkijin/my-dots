---
name: to-spec
description: Use this skill when the user wants an approved Proposal, RFC direction, design issue, or equivalent artifact turned into an approved technical specification through collaborative design. Use it to settle behavior contracts, system boundaries, interfaces, data, failures, compatibility, rollout, and risk-based test seams before implementation. Do not use it for open-ended discovery, Proposal-shaping decisions, task or ticket decomposition, or production implementation.
compatibility: Works with a project-provided issue tracker; otherwise publishes local Markdown under .pi/scratch.
---

# To Spec

## Goal

Turn an approved Proposal or equivalent artifact into one approved technical Spec without reopening settled direction or drifting into task planning.

## Success criteria

Finish only when:

- the input satisfies the Proposal contract;
- every Spec-level design decision is resolved with the user;
- externally observable behavior, boundaries, interfaces, data, failures, compatibility, rollout, and test strategy are precise enough to decompose;
- stable module, symbol, interface, schema, type, or state references are used where they improve precision, without a file-by-file implementation plan;
- the complete Spec has passed validation and explicit user review;
- the approved Spec is published to the project tracker or local fallback.

## Phase and authority

The current phase is technical design.

- Do not change a decision already approved in the Proposal.
- Investigate facts in project context, code, history, tracker records, and primary sources instead of asking the user.
- For every unresolved Spec decision, ask one question at a time, lead with a recommendation, and wait for the user's answer.
- If new evidence makes the Proposal infeasible or changes its scope, user behavior, or chosen direction, stop and route back to `to-proposal`. Do not patch over the conflict in the Spec.
- Do not write production code, create implementation tasks, or begin implementation.

## Resolve project context and storage

Before writing:

1. Read the project context already supplied and any referenced tracker, terminology, ADR, testing, and documentation conventions.
2. If an issue tracker is explicitly provided, publish the Spec as an issue there and use project-native relationships, statuses, and labels. Do not invent labels.
3. Do not infer a tracker from `git remote`. With no provided tracker, use `.pi/scratch/<effort>/spec.md`.
4. Read the full source Proposal or equivalent artifact, including comments and linked decision records that affect the Spec.

For local fallback files, use [the Spec template](assets/spec-template.md) and validate with:

```bash
python3 scripts/validate.py .pi/scratch/<effort>/spec.md --publication
```

## Input contract

Accept a Proposal produced by `to-proposal` or an equivalent existing issue or document. It must identify:

- the desired outcome and problem;
- the chosen direction;
- in-scope and out-of-scope boundaries;
- key decisions and constraints;
- evidence needed to trust feasibility;
- no unresolved question that can change direction.

If required content is missing, name the gap and route to `to-proposal`; do not reconstruct approval from conversation alone.

## Workflow

1. **Validate the handoff.** Read the Proposal and confirm the input contract. Preserve its decisions as constraints.
2. **Inspect the implementation context.** Read the smallest useful set of code, public interfaces, schemas, tests, ADRs, and prior art. Trace claims to current sources.
3. **Build a decision queue.** Order unresolved Spec decisions by dependency. Cover only relevant areas from [design and testing guidance](references/design-and-testing.md).
4. **Resolve decisions collaboratively.** Ask one decision at a time with a recommendation and trade-offs. Do not ask again about Proposal decisions.
5. **Draft the Spec.** Use [the Spec template](assets/spec-template.md). Link the Proposal and decision sources; repeat only enough Proposal context to make the technical contract legible.
6. **Validate.** Check behavior-to-design traceability, edge cases, compatibility, implementation latitude, and risk-to-test-seam coverage. For local Markdown, run the validator.
7. **Review once as a whole.** Show the complete Spec and obtain explicit approval before publication. Re-review when an edit changes meaning.
8. **Publish.** Create an approved Spec issue in the provided tracker. For local fallback, set `status: approved` and write `spec.md`. Link it to its Proposal, run publication validation, and report the canonical location.
9. **Stop.** Do not invoke `to-tasks` or implement unless the user requests the next stage.

## Change control

A semantic change to an approved Spec reopens it as `draft` and marks linked Task graphs `stale`. Re-approve before decomposition resumes. Correct non-semantic spelling or formatting without changing status. Do not close or otherwise reinterpret the Proposal.

## Stop rules

Stop for one user decision when required. Stop and return to `to-proposal` when the direction must change. Stop without publishing when approval is withheld. Stop after the approved Spec is published.