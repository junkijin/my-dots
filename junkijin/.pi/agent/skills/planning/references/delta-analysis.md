# Evidence-based delta analysis

Use when planning against a target state: a design, spec, issue, screenshot, reference implementation, or prior behavior. Treat the plan as evidence-based comparison, not translation — do not restate the target as planned work.

## Procedure

1. Identify the target behavior, visual state, or contract.
2. Inspect the current implementation and real usage sites.
3. Compare target vs. current state.
4. Extract only verified deltas.
5. Prefer the smallest sufficient change set.

Explicitly separate:

- What already matches and should remain unchanged
- What differs and where it lives
- What is uncertain or unavailable from the inspected evidence
- What decisions still affect the scope

## Tracing rules

- Trace the full resolution path that produces the current behavior (usage sites, intermediate layers, shared utilities) and the relevant states, rather than only the surface where the difference appears.
- If the inspected target covers only one state, do not assume adjacent states are in scope; treat that as a scope decision.

## Output

Prefer a compact delta table when useful: Target / Current / Verified difference / Code location / Proposed change.

In the final plan, include the evidence inspected, already-matching areas, verified deltas, and unavailable evidence when they materially affect confidence.
