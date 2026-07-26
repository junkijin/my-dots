# Evidence, prototypes, and prerequisites

Load this reference only when a Proposal decision needs more than repository inspection and user judgment.

## Research

Use the source that owns the fact whenever possible:

1. official specifications and standards;
2. first-party documentation and APIs;
3. upstream source code and release records;
4. high-quality secondary analysis only when primary material is absent or insufficient.

For secondary evidence, state why primary evidence was insufficient and label confidence. Cite each consequential claim close to the claim. Record contradictions rather than averaging them away.

Bound each investigation with:

- one question;
- the decision it informs;
- eligible source types;
- a concise output contract;
- a stop condition.

After one or two meaningful retrieval fallbacks, stop and identify the missing fact instead of searching indefinitely.

## Throwaway prototypes

Build the cheapest isolated artifact that can answer one explicit question. The question determines the form; do not force a terminal UI or multiple visual variants.

- Keep it outside production code. Use an existing project scratch convention, otherwise `.pi/scratch/<effort>/prototypes/<slug>/`.
- Use the project's runtime and design system when relevant, but do not add production dependencies.
- Make code prototypes runnable with one documented command when practical.
- Build only the behavior needed to produce a human verdict. Skip polish, broad error handling, production abstractions, and unrelated tests.
- State the question, assumptions, and observation method beside the artifact.
- Link the artifact from its `prototype` issue.
- Resolve the issue only after the user records the verdict and rationale.

A useful prototype may be a schema sketch, state transition table, mocked interaction, CLI, visual comparison, API probe, or small executable. Choose based on evidence value, not format.

## Prerequisites

A prerequisite exists only to unblock research or a Proposal decision. Examples include requesting access, obtaining a representative export, or preparing a safe test account.

Perform safe local work autonomously after the Map is approved. Ask before external, destructive, costly, credential-changing, or scope-expanding actions. Record what was done and any durable pointers needed downstream. Never use a prerequisite issue to implement part of the destination.