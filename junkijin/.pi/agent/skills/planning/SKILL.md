---
name: planning
description: Use this skill when the user asks for an implementation plan, technical design document, tech spec, or RFC for a software feature, change, migration, or refactor, including requests to "plan it first" that don't name a format. Do not use it for code review, debugging an existing failure, product requirements documents, end-user documentation, or requests to implement a change directly without a plan.
---

# Writing a technical change plan

A plan lets reviewers challenge the direction of a change before code is written, so it must be grounded in the actual codebase and make its uncertainties explicit.

1. **Frame the change.** Identify the goal, scope, and constraints. If a product decision such as user-visible behavior, scope, or priority is missing and would change the design, ask before writing. Decide routine technical choices yourself and record them as design decisions.
2. **Ground it in the code.** If a repository is available, locate the code to change, the existing patterns to reuse, and the contracts (APIs, schemas, types, configuration) the change touches. Stop exploring once every change area can be named with a concrete path or symbol.
3. **Fill the template.** Read the [plan template](assets/plan-template.md) and keep its section order unless the user requests a different format. Omit any section marked `Optional` that has no real content instead of writing "N/A"; a small change may need only the required sections. Remove every `<!-- -->` instruction comment and replace every bracketed placeholder.
4. **Focus on decisions.** For each key decision, state the rationale and the trade-off, because that is what reviewers evaluate. List alternatives only if you actually weighed them.
5. **Plan the steps.** Order implementation steps by dependency at whatever granularity fits the change and the repository's conventions, and give each step a check that shows it is complete. Do not impose a development methodology that the user or repository does not already use.
6. **Mark unknowns instead of filling them.** Never invent links, issue IDs, owners, or API contracts; omit fields the user did not provide. Label unverified statements as assumptions, and list every question that could change the design under Open Questions.
7. **Self-review and fix before finishing:**
   - Each goal maps to at least one area of change, implementation step, and validation item.
   - Each path, symbol, and command in the plan exists in the repository or is labeled as new.
   - The Summary has 3–5 sentences, and validation describes planned checks, not results.
   - No instruction comments or bracketed placeholders remain.

## Output

- Write the plan in the language the user is writing in, including section headings. Keep code, paths, commands, and identifiers unchanged.
- If the user specifies a document path, save the plan there; otherwise, return it as Markdown in the response.
- If the user asked only for a plan, stop after presenting it. If they also asked for implementation, continue after the plan unless an open question would change the design; in that case, ask first.
