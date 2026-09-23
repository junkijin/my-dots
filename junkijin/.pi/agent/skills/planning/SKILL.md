---
name: planning
description: Use this skill when the user asks for an implementation plan or technical design document for a software feature, change, or refactor, even if they simply ask to plan it without specifying a format. Do not use it for travel or personal schedules, or for implementation-only requests.
---

# Writing a technical change plan

1. Identify the goal, scope, and constraints. If a repository is available, inspect only the code, documentation, and API contracts needed to understand the design. Avoid unnecessary exploration when the context is sufficient.
2. When writing the plan, read the [plan template](assets/plan-template.md). Preserve its section headings and order unless the user requests a different format. Replace or remove blockquoted instructions, bracketed placeholders, and example issue IDs in the final document.
3. Distinguish verified facts from assumptions. Ask a question only when missing information would materially change the design; otherwise, state the assumption or record it under unresolved questions. Do not invent links, API contracts, owners, or alternatives.
4. Describe the changed areas, design decisions with rationale and tradeoffs, relevant user-facing edge cases, risks, verification, and release approach at a level appropriate to the change. Mark sections with no applicable content as not applicable. Include a Mermaid diagram only if it clarifies the actual design, and include rollback steps only if separate action is needed.
5. Before finishing, check that the summary has 3–5 sentences, the sections appear in the expected order, and no placeholders or unsupported claims remain. Describe planned verification as a plan, not as tests already run.

If the user specifies a document path, save the plan there; otherwise, provide it as Markdown in the response. If the user requests only a plan, do not implement it. If they request both a plan and implementation, write the plan and then continue with the requested work.
