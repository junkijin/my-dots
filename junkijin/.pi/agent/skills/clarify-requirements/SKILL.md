---
name: clarify-requirements
description: Create or refine a clear, evidence-backed, human-reviewable requirements specification for a codebase change. Use when the user explicitly requests requirements clarification or a requirements spec, or when a material ambiguity truly blocks implementation and could change observable behavior, scope, constraints, or acceptance criteria. Do not use for straightforward implementation, diagnosis, code review, verification, or planning when the requirements are already sufficient. Maintain the result as the canonical requirements spec while leaving implementation choices to later work.
---

# Clarify Requirements

## Mission

Produce a standalone, decision-complete requirements spec that defines what a codebase change must accomplish and why it is needed. Make it suitable for human review without requiring the conversation for context. Stop before selecting the implementation.

## Core contract

- Define the problem, intended outcome, required behavior, scope, constraints, and acceptance criteria.
- Separate current-state facts from target requirements.
- Label material statements as evidence-backed facts, stakeholder requirements, authoritative obligations, approved assumptions, or unresolved unknowns.
- Cite the source of each fact, requirement, obligation, and assumption.
- Keep the requirements solution-neutral unless the user or an authoritative source mandates a technical constraint.
- Request only information whose answer could materially change the requirement set.
- Keep implementation choices out of the requirements artifact.
- Preserve code identifiers, paths, API names, and domain terms exactly.
- Write in the user's language unless asked otherwise.
- Leave implementation artifacts unchanged.
- Create or update only the requirements spec document.

## Requirements boundary

Include:

- the problem, motivation, and intended outcome;
- affected users, actors, systems, and observable scenarios;
- current behavior and required behavior;
- triggers, inputs, outputs, business rules, permissions, and user-visible failure states;
- in-scope behavior, out-of-scope behavior, non-goals, and invariants;
- compatibility, performance, accessibility, security, privacy, compliance, and operational constraints;
- externally imposed contracts and data requirements;
- observable acceptance criteria;
- codebase facts needed to interpret the requested change.

Leave out:

- architecture, component ownership, and module boundaries selected for the change;
- files and symbols to add or modify;
- libraries, frameworks, algorithms, storage mechanisms, and protocols to choose;
- internal interfaces and schemas invented as part of a solution;
- implementation sequence, task breakdown, estimates, and staffing;
- implementation-specific verification work;
- solution alternatives, trade-off analysis, and recommendations.

Record a mandated technical choice only as a sourced constraint. Do not extend it into a design.

## Conditional references

When the change affects rendered UI, visual styling, content presentation, interaction, responsive behavior, motion, or accessibility, read [references/ui-change-spec.md](references/ui-change-spec.md) and add its `UI change spec` section to the canonical requirements spec.

## Gather evidence

Use the smallest relevant set of sources:

1. User-supplied goals, decisions, examples, issue text, screenshots, logs, contracts, and code excerpts.
2. Codebase artifacts such as documentation, entrypoints, public interfaces, types, schemas, configuration, and existing tests.
3. Connected documents or trackers identified as authoritative.
4. Direct stakeholder clarification.

For each source:

- state only what the source establishes;
- distinguish the current state from the requested state;
- cite an artifact title, URL, or `path::symbol` when available;
- surface conflicts and identify the decision-maker or source that must resolve them;
- mark a material fact as unknown when the evidence does not establish it.

Treat an existing pattern as current-state evidence, not as a target requirement. Promote it to a requirement only when a stakeholder or authoritative obligation requires it to remain true.

Use these labels consistently:

- **Evidence-backed fact:** A source establishes a current-state fact but does not prescribe the target state.
- **Stakeholder requirement:** An identified decision-maker explicitly requires an outcome.
- **Authoritative obligation:** A binding contract, policy, regulation, or compatibility commitment requires an outcome.
- **Approved assumption:** An identified decision-maker explicitly accepts a premise as part of the requirement set.
- **Unresolved unknown:** Missing or conflicting information could materially change the requirement set.

## Workflow

### 1. Frame the change

Extract the stated problem, desired outcome, affected actors, scenarios, scope, non-goals, constraints, success conditions, and referenced artifacts. Preserve the user's intent without broadening an example into a general rule.

### 2. Establish the current-state context

Collect the facts needed to distinguish the present state from the requested state:

- current observable behavior;
- relevant domain terms and actors;
- external contracts and compatibility obligations;
- data, permission, and lifecycle rules;
- adjacent behavior that must remain unchanged;
- the source of each fact.

### 3. Identify material gaps

Treat a gap as material when its answer could change:

- intended outcome or externally observable behavior;
- affected actors or scenarios;
- scope, non-goals, or invariants;
- business rules, permissions, or failure behavior;
- external contracts or compatibility obligations;
- acceptance criteria;
- mandatory constraints.

### 4. Ask outcome-centered questions

Ask the smallest cohesive set of blocking questions. Explain briefly which requirement boundary each answer settles. Ask about outcomes rather than solution choices.

Examples:

- “When an expired invitation is opened, what must the user be able to do?”
- “Which existing client versions must continue to work?”
- “What response-time threshold counts as acceptable?”

Request an exact artifact when it can establish a missing codebase fact. Do not request a broad collection when one document, contract, type, test, or excerpt is sufficient.

### 5. Confirm the requirement set

Restate the collected requirements concisely. Resolve contradictions explicitly. Promote an assumption only after an identified decision-maker accepts it.

For refactors and migrations, confirm the required outcome, motivation, observable invariants, compatibility obligations, scope boundaries, and any mandated destination constraint.

### 6. Pass the completeness gate

Complete the requirements spec only when:

- the problem and desired outcome are clear;
- affected actors and observable scenarios are identified;
- current and required behavior are distinguishable;
- scope, non-goals, and unchanged behavior are explicit;
- rules, permissions, failure states, and important edge cases are defined;
- mandatory constraints and external obligations are known;
- acceptance criteria are observable and unambiguous;
- codebase-specific terms have sufficient supporting context;
- applicable UI presentation and interaction requirements are complete;
- no material contradiction or unapproved assumption remains.

When a material item remains unresolved, return a clarification-needed report.

## Write the spec document

Use a user-specified destination when provided. Otherwise, create `<project-root>/.pi/specs/spec-<short-kebab-topic>.md`.

Update the existing spec for the same change so one canonical current document remains. Remove superseded statements rather than retaining a history inside the spec.

Write the completed spec only after the completeness gate passes. Return the clarification-needed report inline while material items remain unresolved.

## Output formats

### Completed requirements spec

```markdown
# <Requirements spec title>

## Purpose
- **[Category]** <Problem or motivation> — Source: <source>
- **[Stakeholder requirement / Authoritative obligation]** <Desired outcome> — Source: <source>

## Current-state context
- **[Evidence-backed fact]** <Current-state fact> — Evidence: <source>

## Required behavior and outcomes
- **[Stakeholder requirement / Authoritative obligation]** <Observable requirement> — Source: <source>

## Scope
### In scope
- **[Category]** <Included behavior or actor> — Source: <source>

### Out of scope
- **[Category]** <Excluded behavior or non-goal> — Source: <source>

## Rules and edge cases
- **[Category]** <Rule, permission, failure state, or boundary behavior> — Source: <source>

## Constraints and external obligations
- **[Category]** <Mandatory constraint or obligation> — Source: <source>

## Acceptance criteria
- [ ] **[Acceptance criterion]** <Observable, solution-neutral completion condition> — Traces to: <sourced requirement>

## Approved assumptions
- **[Approved assumption]** <Accepted premise> — Accepted by: <decision-maker>

## Evidence considered
- <source> — <what it established>
```

For UI changes, insert the `UI change spec` section from [references/ui-change-spec.md](references/ui-change-spec.md) before `Acceptance criteria`.

Include the core sections even when an item is explicitly `None` or `Not applicable`. Omit `Approved assumptions` when there are none. A completed spec contains no unresolved questions.

### Clarification-needed report

```markdown
# Clarification needed: <change>

## Established requirements
- **[Category]** <Confirmed fact or decision> — Source: <source>

## Material unknowns
1. <Outcome-centered question>
   - Why it matters: <requirement boundary affected>

## Requested evidence
- <Exact artifact or excerpt> — Establishes: <material fact>

## Conflicts to resolve
- <Conflicting statements and their sources>
```

End the clarification-needed report after these four sections and include only requirements content.

## Delivery

For a completed spec, return the spec path and a concise summary of its scope and acceptance criteria.

For revisions, update the same canonical spec, rerun the completeness and quality checks, and summarize the material changes.

## Final quality check

- [ ] Every material statement has the correct category and source.
- [ ] Current-state facts and target requirements remain distinct.
- [ ] Scope, non-goals, rules, constraints, and acceptance criteria are explicit.
- [ ] Acceptance criteria describe observable outcomes and trace to sourced requirements.
- [ ] UI changes include the evidence-backed visual, interaction, state, responsive, content, and accessibility requirements defined by the UI reference.
- [ ] A completed spec contains no material unknown, contradiction, or unapproved assumption.
- [ ] The artifact contains only requirements content.
- [ ] No implementation choice or implementation artifact appears in the result.
- [ ] The spec is standalone and understandable without the originating conversation.
- [ ] The canonical spec path is used and no competing document exists for the same change.
