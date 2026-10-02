---
name: planning
description: Write or revise Plan mode deliverables as self-contained Tech Specs. Excludes routine progress updates and task checklists.
---

# Planning

Produce a Tech Spec that another executor can implement without access to the planning conversation. This skill defines the planning artifact; follow the active mode's rules for investigation, tool use, and plan delivery. User instructions take precedence over this skill's defaults.

## Scope and completeness

Plan the complete behavior requested in the current session. Include only work needed to deliver that behavior, preserve affected contracts, and complete required verification. Keep implementation, review, and testing within the same scope. Potential future usefulness or reuse alone does not justify additional features, error handling, or abstractions.

## Output contract

Write in the user's requested language, translating the section headings and item labels below consistently. Use unnumbered Markdown headings in the specified order, with the required subsections. Format labeled entries as `- Label: content`, using the specified labels in the listed order. Scale detail to the change; briefly mark inapplicable sections instead of inventing content to fill them.

Ground technical claims in relevant code and source materials, preserve exact paths and identifiers, and distinguish verified facts from assumptions. Resolve routine implementation details using available context and repository conventions. Ask about missing information or product decisions only when they affect the requested behavior or block implementation within scope. Continue planning work that does not depend on the answer.

Use clear, natural prose and keep each prose paragraph on a single source line. Keep settled decisions distinct from open questions. Remove template instructions, placeholder examples, and decision history that does not help execution or review.

## Required sections

### Summary

Explain the problem and proposed technical approach in 3–5 sentences. A reviewer should understand the purpose and direction from this section alone.

### Background and scope

Use these subsections:

- **Background**: Describe the current structure, technical problem, and reason for the change without repeating the product requirements.
- **Goals**: State the intended outcomes.
- **Non-goals**: State the explicit exclusions relevant to the requested change.
- **Related materials**: Use the labels `Related issue:`, `Product and design:`, `API and related documentation:`, and `Code references:` for the applicable references. Include exact issue identifiers, links, and file paths.

### Technical design

Use these subsections:

- **Proposed approach**: Describe the implementation direction, overall structure, and ordered implementation steps. Cover screens, routing, components, state, and data flow only as needed to explain the design. Add a Mermaid diagram when it helps.
- **Affected areas**: Identify affected pages or modules and their responsibilities, state and data-flow changes, API integrations and contracts, and existing implementations to reuse or replace.
- **Key design decisions**: Give each consequential decision a descriptive subheading. Under each decision, use `Decision:` for the selected approach, `Rationale:` for its justification, and `Tradeoffs:` for the benefits and costs accepted.

For UI work that must follow a supplied design, first establish whether the project uses a design system and identify its relevant supported components, variants, and tokens. Plan the implementation within those capabilities while preserving the design's intended layout, hierarchy, and behavior. Do not bypass or extend the design system solely to achieve pixel-perfect reproduction. Document material differences required by its constraints. If no design system is used, follow the project's existing UI conventions.

### User experience and exception handling

Describe user-visible outcomes for the requested happy path in feature work and for the specified scenarios in bug fixes or error-handling work. Use each scenario's name as its label, with the user-visible outcome and any required recovery behavior as the content. Include other states and recovery behavior only when required by the request or existing contracts.

Preserve existing API and type requirements and error propagation. Keep success actions conditional on actual success, and account for cleanup of state or resources introduced by the change. These obligations do not justify additional failure handling.

Leave unspecified failure behavior outside scope. Do not add unrequested error UI, retries, fallbacks, validation rules, or recovery policies. Do not make deferred behavior an acceptance requirement or treat its absence as unfinished work, a review defect, or a reason to ask for clarification or stop.

### Impact and risks

Use `Impact:` for affected features, users, or systems, `Risk:` for material risks, and `Response:` for relevant prevention, mitigation, or observation measures. Discuss performance, accessibility, localization, analytics, browser compatibility, or security only when the change meaningfully affects them.

### Alternatives considered

Give each relevant alternative actually considered a descriptive subheading. Under each alternative, use `Approach:` for its description and `Reason not selected:` for the justification. Include only comparisons needed to assess the proposed design; do not invent alternatives to populate this section.

### Verification and rollout

Use these subsections:

- **Verification**: Define tests, required repository checks, manual checks, and acceptance criteria for the requested behavior and consequential decisions. Match verification to the change. Distinguish checks already completed from checks the executor must run, and identify any required checks that could not be completed and why. Require regressions caused by the change to be fixed. Report unrelated or pre-existing failures without expanding the implementation to fix them. For UI work based on a supplied design, require visual comparison of the rendered UI against that design for the requested screens and states. Define acceptance criteria within the design-system constraints established in Technical design, distinguish intentional adaptations from unintended discrepancies, and require correction of unintended discrepancies within scope.
- **Rollout**: Use `Rollout method:` for the applicable deployment approach and `Post-release checks:` for the errors, metrics, or user flows to check after release. Include `Rollback:` only when separate action is needed. Do not introduce deployment mechanisms or policies solely to fill this section.

### Open questions

List unresolved decisions as unchecked checklist items, with an owner mention only when known. Explain what each unresolved decision affects. Keep dependent design provisional rather than presenting it as settled. State when there are no open questions.

## Completion criterion

Before handoff, remove out-of-scope additions you introduced into the spec. Require the executor to remove their own out-of-scope additions before finishing implementation. Preserve the user's pre-existing changes in both phases.

The deliverable is ready for implementation when another executor can identify the requested behavior, affected areas, implementation steps, contracts to preserve, and acceptance checks without reconstructing the conversation. If an unresolved decision prevents that handoff, identify it in Open questions and complete the independent parts of the spec. Deliver the spec according to the active mode; this skill does not authorize implementation or a mode change.
