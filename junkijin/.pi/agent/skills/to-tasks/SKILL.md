---
name: to-tasks
description: Use this skill when the user wants a published Product Spec, PRD, or equivalent requirements issue turned into a reviewed graph-level technical design and a dependency graph of agent-ready tracer-bullet tasks or tracker tickets. Use it to resolve implementation contracts, boundaries, interfaces, data, failures, compatibility, rollout, risk-based test seams, vertical slices, blockers, migrations, prefactors, and integration gates. Do not use it while product requirements are unresolved, to write a Decision Map or Product Spec, to assign or run agents, or to implement the tasks.
compatibility: Works with a project-provided issue tracker; otherwise publishes a local implementation plan and Markdown tasks under .pi/scratch.
disable-model-invocation: true
---

# To Tasks

## Goal

Turn one published Product Spec into one reviewed implementation plan consisting of a graph-level Technical Design record and a dependency graph of unassigned, agent-ready tasks. Resolve technical design before decomposition, then create tracer-bullet vertical slices that deliver narrow but complete end-to-end paths. Expose real parallelism without splitting work merely to occupy more agents.

## Success criteria

Finish only when:

- the input satisfies the Product Spec contract and contains no blocking product-requirement gap;
- every material technical decision needed for decomposition has been resolved with the user;
- the graph-level Technical Design defines relevant behavioral contracts, system boundaries, interfaces and data, failures, compatibility, rollout, quality constraints, test strategy, and implementation latitude;
- every user-facing behavior task is a narrow, complete tracer-bullet vertical slice across every affected layer and is demoable or verifiable on its own;
- every task produces an independently verifiable green result and fits one fresh agent context for exploration, implementation, and validation;
- dependencies represent only genuine start blockers and form an acyclic graph;
- task contracts preserve Product Spec requirements and Technical Design decisions while leaving reversible implementation method to the executing agent;
- collision surfaces, handoffs, and any required integration gate are explicit;
- the user has reviewed and confirmed the complete Technical Design and task graph as one implementation plan;
- one graph-level design record and one unassigned issue or local file per task are published without adding or changing labels or other triage metadata.

## Phase and authority

The current phase is technical design and implementation decomposition, not product discovery or implementation orchestration.

- Treat the Product Spec's product behavior, scope, and already-settled decisions as fixed input.
- Investigate project facts before asking the user. For each unresolved substantive technical decision, present one recommendation with material trade-offs, ask one question, and wait for the answer.
- If a technical answer would change the Product Spec's problem, outcome, scope, actor behavior, or product constraints, stop and tell the user to return to the product discussion and invoke `/skill:to-spec` again with the canonical Product Spec reference. For a direction-level conflict with a Decision Map, route to `/skill:to-decision-map`.
- Do not defer unresolved product, contract, or architecture uncertainty into an implementation task.
- Do not create research or spike tasks. Gather bounded design evidence during this phase; a prefactor or migration task is valid only when the reviewed design requires it.
- Do not assign, claim, execute, monitor, merge, or close implementation tasks.
- Avoid file-by-file procedures. Stable module, interface, schema, type, state, or symbol references are allowed when they define a contract or collision boundary.

## Resolve project context and storage

Before writing:

1. Read the current conversation, the full Product Spec issue, linked Decision Map resolutions or evidence, and project-provided terminology, ADR, testing, documentation, and issue conventions.
2. Inspect relevant current code, public interfaces, schemas, tests, dependency direction, history, migrations, and rollout constraints.
3. If an issue tracker is explicitly provided, attach one graph-level Technical Design record to the Product Spec and publish Tasks as individual issues. Prefer a canonical tracker comment for the design record; when project conventions or tracker capabilities require it, create one linked implementation-plan issue instead. Use native parent-child and blocking relationships where available. Do not add or change labels, status, assignment, or other triage metadata; leave task issues unassigned.
4. Do not infer a tracker from `git remote`. With no provided tracker, write `.pi/scratch/<effort>/implementation-plan.md` and one file per task under `.pi/scratch/<effort>/tasks/`.

Use [the implementation plan template](assets/implementation-plan-template.md), [technical design guidance](references/technical-design.md), [the Task template](assets/task-template.md), and [decomposition guidance](references/decomposition.md). Templates are structural aids, not substitutes for contract and graph review.

## Input contract

Accept a Product Spec produced by `to-spec` or an equivalent published requirements issue. It must define:

- the user's problem, desired solution, and relevant actors;
- comprehensive user stories or equivalent user-visible requirements;
- in-scope and out-of-scope boundaries;
- implementation decisions and product constraints already settled upstream;
- external-behavior testing expectations and confirmed high-level seams;
- no unresolved product question whose answer could materially change the implementation plan.

Detailed system boundaries, interfaces, schemas, failure mechanisms, compatibility plans, rollout design, risk-specific test seams, and implementation latitude are not required input; resolving them is part of `to-tasks`.

If the product contract is incomplete, identify the exact gap and stop. Do not silently decide product behavior in the implementation plan. Technical uncertainty is expected: investigate it and resolve each substantive decision in the Technical Design phase.

## Workflow

1. **Validate the product handoff.** Read the complete Product Spec and linked sources; confirm the input contract and preserve settled product decisions.
2. **Inspect the implementation context.** Read the smallest useful set of code, public interfaces, schemas, tests, ADRs, history, and prior art. Trace consequential claims to current sources.
3. **Build a technical decision queue.** Order unresolved design decisions by dependency. Cover only relevant areas from [technical design guidance](references/technical-design.md).
4. **Resolve technical decisions collaboratively.** Ask one decision at a time with a recommendation and trade-offs. Do not reopen Product Spec decisions. Stop and return upstream when a proposed answer would change product behavior or scope.
5. **Draft the graph-level Technical Design.** Use the Technical Design sections of [the implementation plan template](assets/implementation-plan-template.md). Define cross-task contracts once and preserve reversible implementation latitude.
6. **Draft the task graph.** Follow [decomposition guidance](references/decomposition.md). Make every user-facing task a tracer-bullet vertical slice. Use non-vertical enabling tasks only for documented exceptions. Create true blockers, coordination notes, and a final integration task only when individual evidence cannot prove the combined behavior.
7. **Write task contracts.** Use [the Task template](assets/task-template.md). State outcome, scope, applicable product requirements and design decisions, acceptance criteria, verification, and coordination boundaries. Let the executing agent choose reversible implementation details.
8. **Review the implementation plan.** Check behavior-to-design-to-task traceability, technical completeness, edge cases, compatibility, risk-to-test coverage, tracer-bullet integrity, task size, independent green states, graph acyclicity, blocker necessity, collision risk, and the computed frontier.
9. **Review once as a whole.** Present the graph-level Technical Design and tasks in dependency order. For each task show title, outcome, blockers, verification, and shared touchpoints. Ask whether the design, granularity, and edges are right; iterate until the user confirms the complete implementation plan. This review does not create a separate Technical Spec approval lifecycle.
10. **Publish.** Attach or link the graph-level design record, then create one issue per task in dependency order so native edges can reference canonical IDs. Link each task to the Product Spec and design record, create native blocking links where available, and leave tasks unassigned. Do not mutate labels or other triage metadata. For local fallback, write `implementation-plan.md`, `T001-<slug>.md`, `T002-<slug>.md`, and so on.
11. **Report the frontier.** List the initially unblocked tasks and the canonical plan location. Do not claim or execute them.
12. **Stop.** Implementation orchestration is outside this skill.

## Change control

A semantic Product Spec change can invalidate the implementation plan and task graph; surface the affected contracts and rebuild or review the affected graph before work proceeds. If a published design record or graph changes semantically, review the whole affected plan with the user before editing tracker records. Do not silently reshape tasks that may already be claimed. Formatting-only corrections do not require design review. Do not create draft/approved states or a separate approval lifecycle for the Technical Design.

## Stop rules

Stop on a blocking product gap and route back to the product discussion and `to-spec`. Stop for one user answer when a substantive technical decision is required. Stop before publication when the implementation-plan review is not confirmed. Stop after the reviewed, unassigned graph and frontier are published. Do not implement.
