# [Change title]

## Summary

<!-- In 3–5 sentences, describe the problem and the proposed approach. A reviewer should understand the purpose and direction of the change from this section alone. -->

## Background and Scope

### Background

<!-- Explain the current behavior or structure, the problem, and why a change is needed. Include only the context the design depends on rather than repeating requirements. -->

### Goals

* [Outcome this change must achieve]

### Non-goals

<!-- Optional. List scope that a reader might expect but that this change intentionally excludes. -->

* [Excluded scope]

### References

<!-- Optional. List only issues, documents, and links that the user provided or that you verified. -->

* [Reference]

## Technical Design

### Proposed Approach

<!-- Describe the overall approach and how its parts interact. Include only the components, interfaces, data flow, and state needed to understand the design. Add a Mermaid diagram only when the flow spans several components and a diagram is clearer than prose. -->

### Areas of Change

<!-- Name concrete paths or symbols, and label files or modules that do not exist yet as new. -->

* [Module, file, or component]: [What changes and why]
* [Interface, schema, or contract]: [What changes and what depends on it]
* [Existing implementation]: [Reused or replaced, and why]

### Key Design Decisions

<!-- Optional. Include decisions that involved a real choice between viable options. -->

#### [Decision title]

* Decision: [Chosen approach]
* Rationale: [Why it best satisfies the goals and constraints]
* Trade-offs: [What it gains and what it costs]

## Edge Cases and Failure Modes

<!-- Optional. Include only cases outside the normal flow that affect the design, such as invalid or missing input, duplicate or concurrent requests, partial failures, timeouts, permission errors, or loading and empty states in user interfaces. -->

* [Situation]: [Expected behavior and recovery path]

## Impact and Risks

<!-- Optional. Describe effects on existing behavior, users, or systems, and the main risks. Cover cross-cutting concerns such as performance, security, privacy, compatibility, data migration, observability, accessibility, and localization only when relevant. -->

* Impact: [Affected behavior, users, or systems]
* Risk: [Potential problem] — Mitigation: [Prevention, mitigation, or monitoring]

## Alternatives Considered

<!-- Optional. Include only alternatives you actually evaluated. -->

### [Alternative title]

* Approach: [Alternative approach]
* Reason not selected: [Trade-off that ruled it out]

## Implementation Steps

<!-- Order steps by dependency, using the granularity that fits the change and the repository's conventions. End each step with a check that shows it is complete. -->

1. [Step title]
   * Changes: [Code, configuration, or data affected]
   * Done when: [Observable check]

## Validation and Rollout

### Validation

<!-- Describe planned checks, not results. Use the repository's actual test, build, or lint commands when known, and include at least one check that confirms the goals end to end. -->

* [Automated check]: [Behavior it covers]
* [Manual check]: [Expected outcome]

### Rollout

<!-- Optional. Include only when the release needs more than the standard process, such as a feature flag, staged rollout, data migration, or coordinated deployment. Add rollback steps only if reverting requires separate action. -->

* Method: [Release approach]
* Post-release checks: [Errors, metrics, or flows to monitor]
* Rollback: [Steps to revert]

## Open Questions

<!-- Optional. List questions whose answers could change the design. Add an owner only if the user named one. -->

* [Question]
