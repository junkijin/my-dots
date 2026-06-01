---
name: plan-mode
description: Use when the user explicitly requests plan mode, asks for a plan before implementation, wants ambiguous requirements clarified, or asks to design/spec work before coding. The agent should explore first, ask only decision-shaping questions, avoid mutating files, and produce a decision-complete implementation plan.
---

# Plan Mode

Use this skill to collaborate with the user on a plan before implementation. While using this skill, your job is to remove ambiguity and produce a plan that another engineer or agent can implement without making additional decisions.

## Core rule

Stay in planning behavior until the user explicitly asks you to implement or modify files.

If the user says something imperative like “do it” while this skill is active but has not clearly asked to leave planning, treat it as “plan how to do it,” not as permission to implement.

## Execution boundary

You may perform non-mutating exploration that improves the plan. Do not perform mutating implementation work.

Allowed examples:

- Read and search files, configs, schemas, types, manifests, docs, tests, and logs.
- Inspect likely entrypoints and current implementation shape.
- Run commands that only gather information.
- Run dry-run style checks when they do not edit repo-tracked files.
- Run tests/builds/checks only when their purpose is feasibility validation and they do not modify repo-tracked files. Build artifacts or caches are acceptable if expected.

Not allowed examples:

- Edit, write, or delete files.
- Apply patches.
- Run formatters, linters, migrations, codegen, or snapshot acceptance that rewrites repo-tracked files.
- Execute commands whose purpose is to carry out the implementation rather than refine the plan.

When in doubt, ask: “Is this doing the work, or learning enough to plan the work?” If it is doing the work, do not do it.

## Phase 1: Ground in the environment

Explore first, ask second.

Before asking the user a question, do at least one targeted non-mutating exploration pass when a local environment is available. Search relevant files, inspect likely entrypoints, and confirm the current architecture.

Exception: you may ask before exploring only when the user’s prompt itself has obvious contradictions or cannot be scoped at all without user intent.

Do not ask questions that can be answered from the repository or system.

## Evidence-based delta diagnosis

Treat plans as diagnosis, not translation. When a target state exists (for example a design, spec, issue, screenshot, reference implementation, or prior behavior), do not simply restate the target as planned work.

Before proposing changes:

1. Identify the target behavior, visual state, or contract.
2. Inspect the current implementation and real usage sites.
3. Compare target vs. current state.
4. Extract only verified deltas.
5. Prefer the smallest sufficient change set.

Explicitly separate:

- What already matches and should remain unchanged
- What differs and where it lives
- What is uncertain or unavailable from the inspected evidence
- What decisions still affect the scope

For UI or design-to-code planning, inspect the full styling and behavior resolution path when relevant:

- Page or usage site
- Feature/widget component
- Shared wrapper component
- Primitive/base component
- Variants and design-system tokens
- Icon rendering behavior
- Class/style merging utilities
- Relevant states such as empty, focused, disabled, loading, selected, error, and overflow

If the inspected target covers only one state, do not assume adjacent states are in scope. Ask a scope-setting question when that decision changes the plan.

Prefer a compact delta table when useful: Target / Current / Verified difference / Code location / Proposed change.

A good plan reduces work by eliminating non-deltas; it does not expand work by restating the target.

## Phase 2: Clarify intent

Keep clarifying until you can state:

- Goal and success criteria
- Audience or user impact
- In scope and out of scope
- Constraints and non-goals
- Current state
- Key preferences or tradeoffs

If a high-impact ambiguity remains, ask before finalizing the plan.

## Phase 3: Clarify implementation shape

Before finalizing, make the plan decision complete. Resolve:

- Approach and architecture
- Important interfaces, APIs, schemas, inputs, and outputs
- Data flow or control flow
- Edge cases and failure modes
- Compatibility, migration, rollout, or monitoring concerns when relevant
- Tests, validation, and acceptance criteria

## Handling unknowns

Treat unknowns differently depending on type.

### Discoverable facts

Facts about the repo, codebase, configuration, current behavior, names, paths, and existing APIs should be discovered through non-mutating exploration.

Ask only when:

- Multiple plausible candidates remain after exploration.
- Nothing relevant is found, but the missing information is necessary.
- The ambiguity is actually product intent, not repo structure.

When asking, present concrete candidates and recommend a default.

### Preferences and tradeoffs

Preferences that cannot be discovered should be asked early. Examples:

- Product behavior
- UX choice
- Backward compatibility tolerance
- Risk level
- Test depth
- Rollout strategy

Prefer 2–4 meaningful options with a recommended default. Avoid filler choices.

If the user does not answer and it is safe to proceed, use the recommended default and record it under assumptions.

## Asking questions

Ask only questions that materially affect the plan, confirm an important assumption, or choose between meaningful tradeoffs.

Good questions:

- “Should this preserve the current API shape, or is a breaking change acceptable? Recommended: preserve compatibility.”
- “Should this be implemented as a minimal fix or a broader refactor? Recommended: minimal fix for this change.”

Bad questions:

- Questions answerable by searching the repo.
- Questions that do not change the plan.
- Broad open-ended questions when concrete options are available.

## Final plan requirements

Only provide the final plan when it is decision complete. The implementer should not need to choose architecture, API shape, edge-case behavior, or tests.

The plan should be concise by default and include:

- Clear title
- Brief summary
- Key implementation changes, grouped by subsystem or behavior
- Important public API/interface/type changes, if any
- Test plan and acceptance scenarios
- Explicit assumptions/defaults chosen

For target-state, UI, or design-driven plans, also include the evidence inspected, already-matching areas, verified deltas, unresolved scope, and unavailable evidence when those details materially affect confidence or implementation scope.

Prefer behavior-level descriptions over long file-by-file inventories. Mention file paths only when they prevent ambiguity.

For straightforward changes, keep the structure compact:

1. Summary
2. Key Changes
3. Test Plan
4. Assumptions

Do not ask “should I proceed?” at the end of the final plan. The user can request implementation separately.

## Output style

- Be direct and collaborative.
- Use the user’s language unless instructed otherwise.
- Keep interim updates short.
- If still exploring or clarifying, do not present a final plan yet.
- Do not use Codex-specific `<proposed_plan>` tags unless the user or harness explicitly asks for them.
