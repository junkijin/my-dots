---
name: planning
description: Create or refine implementation plans that explain how an existing codebase can evolve from its current state to a requested outcome. Use when a software change benefits from codebase-aware technical direction before implementation.
---

# Planning

## Outcome

Produce a standalone implementation plan that explains how the current codebase will change to satisfy the supplied requirements.

Make the implementation steps the center of the document. Support them with confirmed current-state evidence, a selected design, interface and data behavior, verification steps, and completion criteria.

The completion point for this skill is delivery of the implementation plan.

## Prepare before writing

Obtain codebase evidence, resolve material gaps, and select the implementation design before drafting the final document.

Build the final plan from confirmed current-state facts, selected code changes, and future verification steps.

## Acquire sufficient context

Inspect relevant entrypoints, implementations, callers, types, schemas, tests, configuration, manifests, migrations, and public APIs. Use supplied requirements, issues, designs, logs, code excerpts, schemas, and prior plans as target-state evidence.

Record every source that materially informs the plan and the fact, constraint, or decision it establishes. Use stable identifiers such as repository paths, `path::symbol`, document titles, issue IDs, design links, schema names, and URLs.

Trace the relevant behavior from its entrypoint through intermediate layers to its consumers and tests. Capture:

- current ownership and responsibilities;
- data and control flow;
- interface, schema, state, configuration, and dependency constraints;
- existing tests and observable behavior;
- adjacent behavior that the change must preserve.

Treat inspected facts as evidence and inferred new structure as a proposal. Label every new path or symbol as proposed until it exists.

## Resolve material gaps before planning

Extract the supplied goal, target behavior, scope, constraints, compatibility requirements, and success conditions.

Classify a gap as material when its answer changes one or more of these:

- user-visible behavior or scope;
- architecture, ownership, or file placement;
- API, schema, persistence, event, or state contracts;
- security, privacy, authorization, or permission behavior;
- compatibility, migration, deployment, rollback, or acceptance criteria.

Resolve implementation details from codebase evidence and established conventions. For remaining material gaps, return a focused context request containing:

1. the exact file, contract, output, or product decision needed;
2. why it changes the implementation design;
3. the smallest cohesive set of related inputs needed to continue.

Resume plan creation after those inputs are resolved. Select safe defaults for non-material details and express them as implementation decisions.

## Readiness gate

Begin the final plan when all of the following are true:

- target behavior, scope, and success conditions are defined;
- the relevant current implementation and integration points are identified;
- one implementation approach is selected;
- ownership and file placement are determined;
- important interface, data, state, error, and security behavior is specified;
- compatibility, migration, and rollout consequences are decided when relevant;
- verification and completion can be described concretely.

When the gate is incomplete, continue context acquisition or return the focused context request.

## Derive the codebase delta

Compare the target behavior with the current implementation and retain the smallest coherent set of changes.

For each delta:

- identify the existing `path::symbol` or exact proposed location;
- state the current responsibility;
- specify the new logic, structure, or contract;
- trace caller, dependency, consumer, and data-flow effects;
- define invariants, validation, failure behavior, and preserved behavior;
- connect the change to a concrete test or verification case.

Order the deltas by implementation dependency. Keep already-matching behavior as preserved context rather than planned work.

## Write the plan document

Use a user-specified destination when provided. Otherwise, create `<project-root>/.pi/plans/plan-<short-kebab-topic>.md`.

Update the existing plan for the same task so one canonical current document remains.

Use this structure and omit sections that have no implementation relevance:

```markdown
# <Implementation plan title>

## Objective
<Target behavior, scope, and selected implementation approach.>

## Planning references
| Source | Contribution to the plan |
| --- | --- |
| `<path, path::symbol, document, issue, design, schema, or URL>` | <fact, constraint, or decision established by this source> |

## Current-state evidence
- `<path>::<symbol>` — <current responsibility and relevance to the change>

## Proposed design
<Post-change architecture, ownership, and end-to-end data/control flow.>

## Implementation steps

1. **<Concrete codebase change>**
   - **Location:** `<existing-path>::<symbol>` or `<proposed-new-path>`
   - **Current role:** <relevant current responsibility>
   - **Change:** <exact logic, structure, or contract change>
   - **Integration:** <callers, dependencies, consumers, and flow>
   - **Behavior:** <invariants, failures, edge cases, and preserved behavior>
   - **Verification:** <specific test or observable result>

## Interface and data changes
- <API, type, schema, persistence, event, state, or configuration changes>

## Verification strategy
- **Automated:** <test files, cases, assertions, and regression coverage>
- **Manual:** <behavior-level scenario and expected result, when useful>
- **Commands:** `<evidence-backed command>` — <expected result>

## Completion criteria
- <Observable behavior or contract that establishes completion>

## File impact summary
| Path | Action | Responsibility |
| --- | --- | --- |
| `<path>` | Modify / Add / Remove | <precise purpose of the change> |

## Compatibility, migration, and rollout
- <Selected compatibility, migration, deployment, observability, rollback behavior>

## Constraints and mitigations
- <Resolved product, code, compatibility, deployment, or rollout constraint and its selected mitigation>
```

## Precision rules

Write affirmative, selected instructions:

- “Place `parseSession` in `src/session/parser.ts` and export it from `src/session/index.ts`.”
- “Add success, invalid-input, timeout, and retry cases to `src/session/parser.test.ts`.”
- “Preserve `SessionService.load(userId): Promise<Session>` and map the new repository error to the existing `SessionLoadError`.”

Use stable `path::symbol`, route, schema, and configuration-key locations. Ground existing locations in inspected evidence and mark new locations as proposed.

Make two competent implementers converge on the same architecture, contracts, behavior, file placement, and test coverage.

## Verification rules

Write verification as future actions for the implementer:

- derive test placement and style from existing tests;
- specify inputs, outputs, assertions, protected regressions, and failure cases;
- include commands supported by inspected manifests, scripts, or documentation;
- state the expected evidence of success for each command or scenario.

## Final quality gate

Confirm all items before delivery:

- [ ] Every numbered step describes a concrete codebase change.
- [ ] One coherent implementation approach is selected.
- [ ] Planning references identify the material sources and what each contributed.
- [ ] Existing locations and behavior are evidence-backed; proposed locations are labeled.
- [ ] Paths, symbols, contracts, flows, ordering, and dependencies are precise.
- [ ] Scope boundaries and preserved behavior are explicit.
- [ ] Relevant edge cases, failure behavior, security, compatibility, and migration are resolved.
- [ ] Verification identifies concrete tests, scenarios, expected results, and evidence-backed commands.
- [ ] Material questions, `TBD` items, research tasks, and implementer choices are absent from the plan.
- [ ] Every section contains implementation-relevant evidence, decisions, changes, or verification.
- [ ] Two competent implementers would make the same material decisions from this document alone.

Return to context acquisition whenever the readiness or quality gate is incomplete.

## Delivery

Return the plan path and a concise summary.

For revisions, update the same canonical document, remove superseded decisions, rerun the quality gate, and summarize the material changes.
