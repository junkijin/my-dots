---
name: planning
description: Use when the user asks to plan before coding, clarify ambiguous requirements, design or spec work, or review and revise an existing implementation plan.
---

# Plan Mode

Collaborate with the user on a plan before implementation. Remove ambiguity and produce a plan that another engineer or agent can implement without making additional decisions.

## Workflow

Progress:

- [ ] 1. Explore the environment (non-mutating) before asking the user anything
- [ ] 2. Self-interview; resolve what you can, record defaults as assumptions
- [ ] 3. Ask surviving material questions, one per turn
- [ ] 4. Run the final-plan check
- [ ] 5. Write or update `.pi/plans/plan-*.md`; reply with the file path and a summary

## Core rule

Stay in planning behavior until the user explicitly asks you to implement or modify files. Writing or updating the planning artifact under the project's `.pi/plans/plan-*.md` is allowed during planning and does not count as implementation.

## Execution boundary

You may perform non-mutating exploration that improves the plan. Do not perform mutating implementation work.

Allowed:

- Read and search files, configs, schemas, types, manifests, docs, tests, and logs.
- Inspect likely entrypoints and current implementation shape.
- Run commands that only gather information, including dry-run style checks.
- Run tests/builds/checks for feasibility validation when they do not modify repo-tracked files. Build artifacts or caches are acceptable if expected.
- Create or update the plan document at `.pi/plans/plan-*.md`, creating the `.pi/plans` directory when needed.

Not allowed:

- Edit, write, delete, or patch implementation files (source code, config, tests, generated files).
- Run formatters, linters, migrations, codegen, or snapshot acceptance that rewrites repo-tracked files.
- Execute commands whose purpose is to carry out the implementation rather than refine the plan.

When in doubt, ask: "Is this doing the work, or learning enough to plan the work?" If it is doing the work, do not do it.

## Phase 1: Ground in the environment

Explore first, ask second. Before asking the user a question, do at least one targeted non-mutating exploration pass when a local environment is available. Do not ask questions that can be answered from the repository or system.

Exception: you may ask before exploring only when the user's prompt itself has obvious contradictions or cannot be scoped at all without user intent.

### Self-interview before asking

Do not run planning as a user interview. Before asking the user anything:

1. Identify the important decisions, ambiguities, risks, dependencies, and edge cases.
2. For each, ask yourself the question you would normally ask the user.
3. Answer it yourself when the repository, existing conventions, stated requirements, or a reasonable default are sufficient; record chosen defaults as assumptions.
4. Explore more when doing so would resolve the question better than asking the user.

### Planning against a target state

When a target state exists (design, spec, issue, screenshot, reference implementation, or prior behavior), read `references/delta-analysis.md` before proposing changes. Plan only verified deltas between the target and the current state instead of restating the target as work.

## Phase 2: Clarify intent

Keep resolving ambiguity until you can state:

- Goal and success criteria
- Audience or user impact
- In scope and out of scope
- Constraints and non-goals
- Current state
- Key preferences or tradeoffs

## Phase 3: Clarify implementation shape

Resolve before finalizing:

- Approach and architecture — one selected approach, not "A or B" alternatives
- Important interfaces, APIs, schemas, inputs, and outputs
- Data flow or control flow
- Edge cases and failure modes
- Compatibility, migration, rollout, or monitoring concerns when relevant
- Tests, validation, and acceptance criteria

Record each material decision so the implementer knows what to do, not merely what to consider. Rejected alternatives may be mentioned briefly as rationale.

## Handling unknowns

Discoverable facts (repo structure, current behavior, names, paths, existing APIs): resolve through non-mutating exploration. Ask only when multiple plausible candidates remain after exploration, nothing relevant is found but the information is necessary, or the ambiguity is actually product intent.

Preferences and tradeoffs (product behavior, UX choice, backward compatibility tolerance, risk level, test depth, rollout strategy): cannot be discovered — ask early.

## Asking questions

These rules govern every question to the user:

- Ask only when the answer would materially change the plan and cannot be safely inferred from the repository, stated requirements, established conventions, or a safe default.
- Ask one question per turn; resolve decisions sequentially so each answer can inform the next.
- Give 2–4 concrete options with a recommended default. Avoid filler choices.
- If the user does not answer and it is safe to proceed, use the recommended default and record it under assumptions.

A decision is under-supported when it materially shapes scope, architecture, behavior, API, or acceptance and cannot be grounded after exploration and self-interview. Do not bury under-supported decisions as assumptions — surface them as questions and resolve them one at a time before finalizing. If the user says to proceed with defaults, record those choices under assumptions.

Good: "Should this preserve the current API shape, or is a breaking change acceptable? Recommended: preserve compatibility."
Bad: questions answerable by searching the repo, questions that do not change the plan, broad open-ended questions when concrete options are available.

## Final plan requirements

Write the final plan only when it is decision complete and executor-invariant: two competent engineers or agents following the plan should produce materially the same result, without choosing architecture, API shape, file placement, naming, edge-case behavior, tests, or rollout. Material open questions must be resolved before finalizing; final plans may mention only non-blocking unknowns, unavailable evidence, or assumptions that do not leave the implementer choosing between material paths.

File rules:

- Create the plan at `<project-root>/.pi/plans/plan-<short-kebab-case-topic>.md`. Prefer the repository root from Git; if unavailable, use the current working directory that contains the task context.
- If a plan document for the same task already exists, update that file instead of creating a new one. The document is the canonical plan the user reviews and comments on.

Final-plan check (run internally before writing):

- [ ] Could two implementers produce meaningfully different results while both following this plan?
- [ ] Does any step say or imply "decide", "choose", "consider", "maybe", "if appropriate", "as needed", or "etc." for a material implementation detail?
- [ ] Are any important file locations, interfaces, data flows, behavior rules, or validation steps underspecified?
- [ ] Are assumptions/defaults explicit enough that they become decisions rather than hidden choices?

If any check fails, resolve it through repository evidence, a safe default, or a user question before presenting the plan.

Replace language that delegates choices to the implementer:

- Bad: "Use the existing pattern where appropriate." → Good: "Place the new parser in `src/shared/lib/parser.ts` and export it from `src/shared/lib/index.ts`, matching the existing shared-lib public API pattern."
- Bad: "Add tests as needed." → Good: "Add unit tests for success, invalid input, empty input, and network-failure cases in `src/foo/__tests__/bar.test.ts`."

## Plan document template

Use this template, adapting sections as needed:

```markdown
# [Title]

## Summary
[Brief description of the goal and the selected approach]

## Final Decisions
- [Selected architecture, behavior, API/interface shape, file placement,
  edge-case handling, validation strategy; rejected material alternatives
  briefly, when relevant]

## Key Changes
### [Subsystem or behavior]
- [Change, with file paths/interfaces where they prevent ambiguity]

## Test Plan
- [Tests and acceptance scenarios]

## Assumptions
- [Defaults chosen and their rationale]
```

Add sections only when relevant: public API/interface/type changes, data flow or state transitions, failure/privacy/security behavior, compatibility/migration/rollout, and — for target-state plans — evidence inspected, already-matching areas, verified deltas, and unavailable evidence. Prefer behavior-level descriptions over file-by-file inventories; mention file paths only when they prevent ambiguity.

## Output behavior

- While still exploring or clarifying, do not write or present a final plan.
- When the first decision-complete plan is ready, write the full plan to the project-local `.pi/plans/plan-*.md` file, then respond with the file path and a concise summary — not a full duplicate of the document. Invite feedback on the plan document.
- On feedback, update the same document and respond only with the changed portions in an `As-is / To-be` delta format (including affected assumptions, decisions, or test-plan changes) plus the file path. Reprint the full plan only when explicitly asked or when no prior full plan document exists in the conversation.

## Gotchas

- An imperative like "do it" while planning is active means "plan how to do it", not permission to implement.
- Writing `.pi/plans/plan-*.md` is not implementation; editing any other repo-tracked file is.
- Formatters, linters, codegen, and snapshot acceptance count as mutations even when framed as checks.
- Do not end the final plan with "should I proceed?" — the user requests implementation separately. Asking them to correct assumptions, decisions, or scope is fine.
- A final plan is a selected execution path, not a menu: no "A or B" or "either X or Y" for material choices.
