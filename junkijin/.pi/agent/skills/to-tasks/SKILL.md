---
name: to-tasks
description: Use this skill when the user wants an approved technical Spec, implementation design, or equivalent artifact decomposed into a reviewed dependency graph of agent-ready tasks or tracker tickets. Use it for large changes that need independently verifiable work, multiple issues, parallel agents, blocking edges, migrations, prefactors, or integration gates. Do not use it while product or technical design is unresolved, to write a Proposal or Spec, to assign or run agents, or to implement the tasks.
compatibility: Works with a project-provided issue tracker; otherwise publishes local Markdown tasks under .pi/scratch.
---

# To Tasks

## Goal

Turn an approved technical Spec into one approved graph of unassigned, agent-ready implementation tasks. Expose real parallelism without splitting work merely to occupy more agents.

## Success criteria

Finish only when:

- the input satisfies the Spec contract and contains no blocking design gap;
- every task produces an independently verifiable green result and fits one fresh agent context for exploration, implementation, and validation;
- dependencies represent only genuine start blockers and form an acyclic graph;
- task contracts preserve Spec decisions while leaving implementation method to the executing agent;
- collision surfaces, handoffs, and any required integration gate are explicit;
- the user has reviewed and approved the complete graph;
- one unassigned issue or local file per task is published with native dependency links where available.

## Phase and authority

The current phase is implementation decomposition, not implementation orchestration.

- Do not resolve product, contract, or architecture uncertainty inside a task. Route a gap back to `to-spec`.
- Do not create research or spike tasks. A prefactor or migration is valid only when the approved design already requires it.
- Do not assign, claim, execute, monitor, merge, or close implementation tasks.
- Do not close or modify the parent Spec except through the approved stale-artifact policy.
- Avoid file-by-file procedures. Stable module, interface, schema, or symbol references are allowed when they define a contract or collision boundary.

## Resolve project context and storage

Before writing:

1. Read the project context already supplied and any referenced tracker, terminology, ADR, testing, and issue conventions.
2. If an issue tracker is explicitly provided, publish the Tasks there as individual issues. Use native parent-child, blocking, status, and label features where documented; do not invent labels.
3. Do not infer a tracker from `git remote`. With no provided tracker, write one file per task under `.pi/scratch/<effort>/tasks/`.
4. Read the full Spec, comments, linked Proposal decisions, and relevant current code and tests.

For local fallback, use [the Task template](assets/task-template.md) and validate the graph with:

```bash
python3 scripts/validate.py .pi/scratch/<effort> --publication
```

## Input contract

Accept a Spec produced by `to-spec` or an equivalent approved document. It must define:

- observable behavior and acceptance boundaries;
- system responsibilities and relevant interfaces or data contracts;
- failure and compatibility behavior;
- risk-based test seams and required evidence;
- implementation latitude;
- no unresolved decision that can change the task graph.

If this contract is incomplete, identify the exact gap and stop at `to-spec`.

## Workflow

1. **Validate the handoff.** Read the complete Spec and confirm the input contract.
2. **Inspect decomposition seams.** Examine current modules, tests, dependency direction, migration constraints, and likely shared touchpoints. Respect project terminology and ADRs.
3. **Draft the graph.** Follow [decomposition guidance](references/decomposition.md). Create outcome-oriented tasks, true blockers, coordination notes, and a final integration task only when individual evidence cannot prove the combined Spec.
4. **Write task contracts.** Use [the Task template](assets/task-template.md). State outcome, scope, applicable Spec decisions, acceptance criteria, verification, and coordination boundaries. Let the executing agent choose implementation details.
5. **Validate.** Check task size, independent green states, graph acyclicity, blocker necessity, Spec coverage, unassigned ownership, and collision risk. Run the local validator when applicable.
6. **Review the whole graph.** Present tasks in dependency order. For each show title, outcome, blockers, verification, and shared touchpoints. Ask whether granularity and edges are right; iterate until the user approves the complete graph once.
7. **Publish.** Create one issue per task in dependency order so native edges can reference canonical IDs. Link every task to the Spec, create native blocking links where available, and leave every task unassigned. For local fallback write `T001-<slug>.md`, `T002-<slug>.md`, and so on.
8. **Report the frontier.** List the initially unblocked tasks and the canonical graph location. Do not claim or execute them.
9. **Stop.** Implementation orchestration is outside this skill.

## Change control

If a meaningful Spec change occurs, treat the graph as `stale` and decompose again after Spec re-approval. If a published graph changes semantically, review the whole affected graph and obtain approval before editing issues. Do not silently reshape tasks that may already be claimed; surface that state and stop.

## Stop rules

Stop and route to `to-spec` when a design gap appears. Stop before publication when approval is withheld. Stop after the approved, unassigned graph and frontier are published.