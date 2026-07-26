# Design and testing guidance

Load only the sections relevant to the Proposal. Omit concerns that do not change behavior, risk, or implementation constraints.

## Design decision coverage

Resolve in dependency order:

1. **Behavioral contract** — actors, inputs, outputs, state transitions, ordering, idempotency, and observable acceptance scenarios.
2. **System boundaries** — responsibilities and interactions of stable modules or services.
3. **Interfaces and data** — public APIs, events, schemas, ownership, invariants, migrations, and compatibility windows.
4. **Failure and edge behavior** — invalid input, partial failure, retries, concurrency, cancellation, recovery, and user-visible errors.
5. **Delivery constraints** — rollout, backward compatibility, security, privacy, performance, observability, and operations when relevant.
6. **Implementation latitude** — reversible choices the implementation agent may make without changing the contract.

Use stable module, symbol, interface, type-shape, schema, or state-transition references when prose would be ambiguous. Avoid exhaustive file paths, code listings, and ordered implementation steps.

## Collaborative decision rule

The Proposal is fixed input. For every remaining substantive Spec decision:

- investigate project facts first;
- present one recommended answer;
- state the material trade-offs briefly;
- ask one question and wait;
- record the confirmed choice once in the Spec.

If the answer would alter Proposal scope, user behavior, feasibility, or chosen architecture, stop and reopen the Proposal instead.

## Test seams

A test seam is the boundary through which a test drives the system and observes results, such as a browser flow, HTTP API, public module interface, event boundary, or pure domain function.

Choose seams by risk, not by a universal test level:

- use a high-level seam for critical end-to-end behavior and wiring;
- use contract or integration seams for service, adapter, persistence, and compatibility boundaries;
- use lower-level seams for dense state logic, combinatorial rules, rare failures, and deterministic edge cases;
- prefer stable seams and prior art already present in the project;
- choose the cheapest seam that proves the behavior without coupling to implementation details.

The Spec records the important behavior or risk, chosen seam, and required evidence. It does not enumerate every concrete test case; Tasks complete those details.

## Validation checklist

Before approval, verify:

- each promised behavior maps to a design contract and test seam;
- each interface has ownership, inputs, outputs, and failure behavior;
- data changes cover migration and compatibility where needed;
- edge behavior is explicit rather than delegated accidentally;
- no blocking `TBD` remains;
- implementation latitude cannot change user-visible or cross-boundary contracts;
- no section silently contradicts the Proposal or project ADRs.