# Decomposition guidance

## Unit of work

A task is the smallest coherent change that:

- delivers an observable or mechanically verifiable result;
- can land green without unmerged work except declared blockers;
- fits one fresh agent context for discovery, implementation, and validation;
- has a clear contract with adjacent tasks;
- does not require the executing agent to make a missing Spec decision.

Use vertical slices for user-facing behavior when they produce a narrow complete path. Do not force every task through every layer. A cohesive contract change, infrastructure enablement, prefactor, migration, or mechanical refactor may stand alone when it creates an independently green result.

## Task contract, not procedure

Specify:

- the outcome and boundaries;
- approved Spec decisions that constrain the work;
- externally observable or mechanical acceptance criteria;
- the evidence or test seams that prove completion;
- genuine blockers;
- shared interfaces, schemas, modules, generated artifacts, or other collision surfaces;
- the handoff another task needs.

Do not prescribe an ordered file list or implementation algorithm unless the Spec deliberately fixes that contract.

## Dependencies and parallelism

A blocking edge means the dependent task cannot safely start before the blocker finishes. Do not use blockers merely because one task is expected to merge first; record non-gating coordination in the task body.

Optimize for low coordination cost:

- expose naturally independent work;
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

For data changes, include backfill, read/write cutover, compatibility, and rollback evidence as required by the Spec. Do not force expand–contract merely because a diff is wide.

## Integration and verification

Each task validates its own result. Add a final integration/verification task only when:

- multiple independently green tasks must be combined to prove an end-to-end behavior;
- parallel changes interact in a way no task can test alone;
- a shared integration branch or coordinated rollout is required;
- the Spec calls for system evidence available only after all blockers land.

The integration task must name the evidence unavailable earlier. Do not add a ceremonial final test task.

## Coverage check

Before review, map every Spec behavior, constraint, migration, and test obligation to at least one task. Then check the reverse: every task must trace to an approved Spec need. If either direction fails, repair the graph or return to `to-spec`.