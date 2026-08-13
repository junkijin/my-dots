---
name: agentskills
description: Use this skill when creating, reviewing, or improving Agent Skills (`SKILL.md`), including defining frontmatter and directory structure, writing scoped instructions, optimizing activation descriptions, adding reusable scripts or references, and designing evaluations. Do not use it for implementing the underlying domain task unless the request is specifically about packaging that workflow as an Agent Skill.
---

# Quickstart

## How skill works

Here's what happened behind the scenes:

1. **Discovery** — When the chat session started, the agent scanned default skill directories and found your skill. It read only the `name` and `description`, just enough to know when the skill might be relevant.

2. **Activation** — When you asked about rolling dice, the agent matched your question to the skill's description and loaded the full `SKILL.md` body into context.

3. **Execution** — The agent followed the instructions in the body, adapting the terminal command to the number of sides in your request.

This process uses **progressive disclosure** to let the agent access many skills without loading all their instructions up front.

## Next steps

You've created a working Agent Skill. From here:

* **[Best practices](references/best-practices.md)** — How to write skills that are well-scoped and effective.
* **[Optimizing skill descriptions](references/optimizing-descriptions.md)** — Test and improve your skill's description so it activates on the right prompts.
* **[Specification](references/specification.md)** — The complete format reference for `SKILL.md` files.
