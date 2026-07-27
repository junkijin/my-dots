---
kind: implementation-plan
product_spec: ""
---

# {{Feature title}} — Implementation Plan

## Product Spec

{{Link the published Product Spec issue and any authoritative direction records this plan preserves.}}

## Technical Design

### Behavioral Contract

{{Define implementation-relevant inputs, outputs, state transitions, ordering, idempotency, and observable acceptance behavior.}}

### System Boundaries

{{Define responsibilities and interactions at stable module, service, adapter, or external-system boundaries.}}

### Interfaces and Data

{{Define relevant APIs, events, schemas, type shapes, ownership, invariants, and migrations. State explicitly when no interface or data change is required.}}

### Failure and Edge Cases

{{Define invalid inputs, partial failures, retries, concurrency, cancellation, recovery, and user-visible errors that apply.}}

### Compatibility and Rollout

{{Define backward compatibility, rollout order, migration windows, rollback constraints, and deployment assumptions. State explicitly when none apply.}}

### Quality Constraints

{{Record relevant security, privacy, performance, observability, accessibility, or operational constraints. State explicitly when none apply.}}

### Test Strategy

| Behavior or risk | Test seam | Required evidence |
| --- | --- | --- |
| {{Important behavior or failure risk}} | {{Browser, API, contract, integration, public module, event, or pure logic seam}} | {{What passing evidence must prove}} |

### Implementation Latitude

- {{Reversible implementation choice an executing agent may make without changing a product or cross-task contract}}

## Task Graph

| Task | Outcome | Blocked by | Verification |
| --- | --- | --- | --- |
| {{Canonical task link or local ID}} | {{Independently green result}} | {{Real start blockers or None}} | {{Evidence produced by this task}} |

## Cross-task Coordination

- **Shared touchpoints:** {{Interfaces, schemas, modules, generated artifacts, or None}}
- **Integration gate:** {{Evidence unavailable to individual tasks, or None}}

## Coverage

- {{Product Spec story, requirement, or constraint}} → {{Technical Design contract}} → {{Task or tasks}}
