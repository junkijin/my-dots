# Technical design guidance

Load only the sections relevant to the published Product Spec. Omit concerns that do not change behavior, risk, task boundaries, or implementation constraints.

## Design decision coverage

Resolve in dependency order:

1. **Behavioral contract** — implementation-relevant actors, inputs, outputs, state transitions, ordering, idempotency, and observable acceptance behavior.
2. **System boundaries** — responsibilities and interactions of stable modules, services, adapters, and external systems.
3. **Interfaces and data** — public APIs, events, schemas, ownership, invariants, migrations, and compatibility windows.
4. **Failure and edge behavior** — invalid input, partial failure, retries, concurrency, cancellation, recovery, and user-visible errors.
5. **Delivery constraints** — rollout, backward compatibility, security, privacy, performance, observability, and operations when relevant.
6. **Implementation latitude** — reversible choices an executing agent may make without changing product-visible or cross-task contracts.

Use stable module, symbol, interface, type-shape, schema, or state-transition references when prose would be ambiguous. Avoid exhaustive file paths, code listings, and ordered implementation steps.

## Collaborative decision rule

The published Product Spec is fixed product input. For every remaining substantive technical decision:

- investigate project facts first;
- present one recommended answer;
- state material trade-offs briefly;
- ask one question and wait;
- record the confirmed choice once in the graph-level Technical Design.

If the answer would alter the Product Spec's problem, outcome, scope, actor behavior, or product constraints, stop technical design and return upstream. Do not hide a product change in an implementation decision.

## Graph-level design record

Record a decision at the highest scope where it applies:

- cross-task contracts belong in the graph-level Technical Design;
- task-specific constraints belong in the task contract and may link to the graph-level decision;
- do not duplicate the same rationale across every task;
- keep the record precise enough to coordinate tasks without turning it into a file-by-file implementation procedure;
- review Technical Design and task graph together rather than creating a separate Technical Spec approval lifecycle.

## Test seams

A test seam is the boundary through which a test drives the system and observes results, such as a browser flow, HTTP API, public module interface, event boundary, contract adapter, or pure domain function.

Refine the Product Spec's externally focused testing decisions by risk:

- use a high-level seam for critical end-to-end behavior and wiring;
- use contract or integration seams for service, adapter, persistence, and compatibility boundaries;
- use lower-level seams for dense state logic, combinatorial rules, rare failures, and deterministic edge cases;
- prefer stable seams and prior art already present in the project;
- choose the cheapest seam that proves the behavior without coupling to implementation details.

The Technical Design records the important behavior or risk, chosen seam, and required evidence. Tasks turn those obligations into independently verifiable results.

## Validation checklist

Before decomposition, verify:

- each promised product behavior maps to a design contract and test seam;
- each interface has ownership, inputs, outputs, and failure behavior;
- data changes cover migration and compatibility where needed;
- edge behavior is explicit rather than delegated accidentally;
- no blocking technical decision remains unresolved;
- implementation latitude cannot change user-visible or cross-task contracts;
- no decision silently contradicts the Product Spec, linked direction records, or project ADRs.
