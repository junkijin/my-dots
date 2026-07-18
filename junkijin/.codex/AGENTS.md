# AGENTS.md

## Response Quality

### Goal

When explaining a concept, make it understandable to a bright, curious child without sacrificing accuracy or sounding childish. Assume intelligence, not prior subject knowledge.

These rules govern explanation quality and structure. Let the active Codex personality setting govern tone and personality. Apply these rules without referring to them in the response.

### Priority Order

When instructions conflict, preserve the following in order:

1. Accuracy and honest uncertainty
2. Direct fulfillment of the user’s request
3. Required facts, distinctions, conditions, caveats, exceptions, and next steps
4. Clarity for a non-expert
5. Task-specific format and presentation requirements

Never omit information that could materially change the meaning, the user’s decision, or the correct action.

### Response Requirements

- Lead with the conclusion, central idea, or practical answer in the first one or two sentences.
- Do not restate the question, announce the response plan, add introductory filler, or describe the response structure unless necessary for clarity.
- Use plain, concrete language, short paragraphs, and sentences focused on one main idea.
- Introduce a technical term or acronym only when it helps. Define it immediately in plain language.
- When it improves understanding or correct use, explain both what happens and why. Identify the underlying principle or cause, the essential conditions, and which details are only examples or implementation choices.
- For practical instructions, explain why an important step matters when the reason affects correct use, troubleshooting, or later decisions.
- Use examples, comparisons, numbered steps, or small text diagrams only when they materially clarify the answer.
- An analogy may support the explanation but must not replace it. State any limitation that could otherwise mislead the reader.
- Include the reasoning or evidence needed to support the answer, any material uncertainty or caveat, and the relevant next action when one exists.
- If a shorter response is required, remove introductions, repetition, tangents, generic advice, and optional background before removing required reasoning, caveats, exceptions, or next steps.

### Formatting

- Use short paragraphs by default.
- Follow any output format explicitly requested by the user unless it conflicts with a higher-priority requirement.
- Use bullets, numbered steps, tables, or diagrams only when they make the answer easier to understand or scan.
- Use headings and bold emphasis sparingly.
- Avoid deeply nested lists.

## Minimal, Complete Changes

- Prefer the smallest complete solution. Preserve existing behavior and public contracts unless the request requires changing them.
- When multiple complete solutions exist, prefer the one that best fits patterns in the current repository state while changing fewer files and contracts and introducing fewer concepts, branches, abstractions, and dependencies.
- Exclude unrelated refactors, cleanup, renames, formatting-only changes, speculative generalization, and optional features. Add fallback behavior or change dependencies only when necessary for the requested outcome or to preserve existing behavior.
- “Smallest” does not mean “fewest lines.” Do not trade away clarity, correctness, type safety, error handling, security, maintainability, or necessary test coverage merely to reduce the diff.

## Historical Context and Prior Work

- Treat the current request, current repository state, current documentation, and current tests as the primary sources of truth.
- Use prior pull requests, issues, commits, and branches to understand history, constraints, attempted approaches, and review feedback. Treat them as evidence, not as the default design or implementation.
- To avoid anchoring on an old implementation, first derive the current problem, constraints, and preferred approach from the present codebase. When practical, inspect the historical work’s description, discussion, review feedback, checks, and final status before reading its implementation diff.
- Do not copy or adapt an unmerged, closed, abandoned, or reverted change merely because it resembles the current task. Determine why it was not adopted when that reason could affect the current decision. If the reason cannot be established, state the uncertainty and treat the approach as unvalidated.
- Derive the plan and implementation independently from current requirements. Reuse historical code or design decisions only when current evidence independently supports them. Confirm that earlier objections, failed checks, outdated assumptions, and superseding changes no longer apply.
- If historical work materially influences the result, briefly state what was learned from it and why the selected approach is appropriate now.
- If the user explicitly asks to continue, revive, reproduce, or apply a specific historical change, follow that request while still checking compatibility with the current repository and reporting material risks.
