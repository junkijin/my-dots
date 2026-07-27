# Decomposition guidance

## Tracer-bullet vertical slices

For user-facing behavior, the required unit of work is a **tracer-bullet vertical slice**: a narrow but COMPLETE end-to-end path through every affected layer, such as schema, API, UI, and tests. A completed slice is demoable or verifiable on its own and can land green. Split work by behavior or capability, not by technical layer. Do not publish separate schema-only, API-only, UI-only, or test-only feature tasks whose value appears only after they are combined.

A task may be non-vertical only when the reviewed implementation plan requires enabling work that cannot sensibly deliver user behavior itself: a prefactor, shared contract or infrastructure change, migration, wide mechanical refactor, or an integration/verification gate that meets the criteria below. Each exception must still land independently green, name the seam and handoff it creates, and directly enable one or more tracer-bullet slices. Do not use an exception to turn ordinary feature work into a horizontal sequence.

## Unit of work

A task is the smallest coherent tracer-bullet slice, or valid enabling exception, that:

- delivers an observable or mechanically verifiable result;
- can land green without unmerged work except declared blockers;
- fits one fresh agent context for discovery, implementation, and validation;
- has a clear contract with adjacent tasks;
- does not require the executing agent to supply a missing Product Spec requirement or Technical Design decision.

## Task contract, not procedure

Specify:

- the outcome and boundaries;
- Product Spec requirements and Technical Design decisions that constrain the work;
- externally observable or mechanical acceptance criteria;
- the evidence or test seams that prove completion;
- genuine blockers;
- shared interfaces, schemas, modules, generated artifacts, or other collision surfaces;
- the handoff another task needs.

Do not prescribe an ordered file list or implementation algorithm unless the Technical Design deliberately fixes that contract.

## Dependencies and parallelism

A blocking edge means the dependent task cannot safely start before the blocker finishes. Do not use blockers merely because one task is expected to merge first; record non-gating coordination in the task body.

Optimize for low coordination cost:

- expose naturally independent tracer-bullet slices;
- never split one end-to-end behavior into layer-only tasks merely to create parallel jobs;
- avoid splitting one cohesive change solely to create parallel jobs;
- separate tasks that can own distinct stable boundaries;
- serialize shared-schema or shared-generated-artifact changes when parallel edits would conflict;
- include handoff data at the boundary rather than relying on conversation memory.

Every published task is unassigned. Execution-time claim and orchestration are outside `to-tasks`.

## Prefactors

Create a prefactor task only when it makes an approved change safer or allows later tasks to be independently green. Its acceptance criteria must describe the preserved behavior and the new seam it enables. Do not use prefactoring as an excuse for unrelated cleanup.

## Atomic versus expand–migrate–contract

Prefer one atomic task when all of the following are true:

- the definition and all consumers fit one fresh context;
- one deployment or merge can update them together;
- compiler, codemod, schema tooling, or tests can detect omissions;
- the task can finish green without a compatibility period;
- temporary dual support would cost more risk than the atomic change.

Otherwise use an expand–migrate–contract graph:

1. **Expand** — add the new form beside the old and establish compatibility.
2. **Migrate** — move consumers in independently green batches, parallel only where touchpoints do not collide.
3. **Contract** — remove the old form after every migration blocker is complete and absence of old consumers is verified.

For data changes, include backfill, read/write cutover, compatibility, and rollback evidence as required by the Technical Design. Do not force expand–contract merely because a diff is wide.

## Integration and verification

Each task validates its own result. Add a final integration/verification task only when:

- multiple independently green tasks must be combined to prove an end-to-end behavior;
- parallel changes interact in a way no task can test alone;
- a shared integration branch or coordinated rollout is required;
- the implementation plan calls for system evidence available only after all blockers land.

The integration task must name the evidence unavailable earlier. Do not add a ceremonial final test task.

## Coverage check

Before review, map every Product Spec behavior and constraint plus every Technical Design migration and test obligation to at least one task. Then check the reverse: every task must trace to a Product Spec requirement or Technical Design decision. For each user-facing behavior, verify that its task is a complete tracer-bullet slice rather than one layer of a feature assembled elsewhere. If product coverage fails, return to the Product Spec; if a technical contract is missing, return to the Technical Design phase. Otherwise repair the graph before publication.