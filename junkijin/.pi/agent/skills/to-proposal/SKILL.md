---
name: to-proposal
description: Use this skill when the user wants to shape a large or uncertain change, migration, product idea, or architectural direction into an approved proposal, especially when discovery spans decisions, issues, sessions, prototypes, research, or multiple agents. Use it for planning, wayfinding, discovery, RFC scoping, and figuring out what should be built even when the user does not say “proposal.” Do not use it to technical-spec an approved direction, decompose an approved spec into tasks, implement production code, or plan a small change whose destination and route are already clear.
compatibility: Works with a project-provided issue tracker and optional subagent tools; otherwise uses local Markdown and current-session research.
---

# To Proposal

## Goal

Turn uncertainty into one approved Proposal that is safe to hand to `to-spec`. Use a lightweight direct conversation when possible and an issue-backed decision map only when the uncertainty warrants it.

## Success criteria

Finish only when:

- the Proposal states the outcome, problem, chosen direction, scope, constraints, evidence, risks, and success criteria;
- every question that could change scope, user behavior, feasibility, or the chosen architectural direction is resolved;
- decision detail is linked to its source rather than copied across artifacts;
- the user has reviewed the complete Proposal and explicitly approved publication;
- the approved Proposal is published to the project tracker, or to the local fallback when no tracker is provided.

Implementation details that do not change the direction may be deferred explicitly to `to-spec`.

## Phase and authority

The current phase is research and design, not implementation.

- Inspect project files, documentation, history, APIs, and tracker state as needed.
- Write planning artifacts, evidence notes, and isolated throwaway prototypes only.
- Do not modify production code or deliver part of the destination.
- Resolve facts from available evidence. Put every Proposal-shaping decision to the user, one at a time, with a recommended answer and a short trade-off explanation.
- Do not revisit an approved decision unless new evidence contradicts it.
- Ask again before changing the destination, expanding scope, or taking an external, destructive, or costly action not covered by an approved map.

## Resolve project context and storage

Before writing:

1. Read the project context already supplied to the session and any files it points to.
2. If it explicitly provides an issue tracker, use that tracker for the Map, decision issues, Proposal, Spec, and Tasks. Follow its native issue, child, dependency, assignment, status, and label conventions. Do not invent labels.
3. Do not select a tracker merely from `git remote`. If no tracker is provided, use `.pi/scratch/<effort>/` in the project root.
4. Read project-provided terminology and ADRs relevant to the destination. Update them only when the project already defines their location and format and the user has confirmed the decision. Do not introduce a new glossary or ADR system.

For local fallback files, use the templates in `assets/` and validate them with:

```bash
python3 scripts/validate.py .pi/scratch/<effort> --publication
```

## Choose the smallest useful mode

### Direct mode

Use Direct mode when the destination and all Proposal-shaping decisions can be resolved through one coherent conversation without a persistent dependency graph or independently delegated investigations.

### Map mode

Use Map mode when decisions depend on one another, meaningful fog remains, work will span sessions, or independent investigations can usefully run across agents. Do not choose it merely because implementation will be large.

Read [the Map workflow](references/map-mode.md) only when Map mode applies.

## Workflow

1. **Establish the destination.** State the user-visible or decision-visible end condition in one or two lines. Use it to bound scope.
2. **Inspect before asking.** Read the smallest relevant set of project context, code, history, tracker records, and external sources. Do not ask the user for facts the environment can answer.
3. **Map the decisions breadth-first.** Identify choices that can change the Proposal. Ask one question at a time, lead with the recommendation, and wait for the user's answer. Keep implementation-detail decisions for `to-spec`.
4. **Gather evidence when needed.** Read [evidence and prototypes](references/evidence-and-prototypes.md) when a decision needs external research, a throwaway prototype, or prerequisite work.
5. **Draft the Proposal.** Use [the Proposal template](assets/proposal-template.md). Link decision records and evidence. Do not turn it into a file-by-file plan or technical specification.
6. **Check completion.** Confirm that no unresolved question can change scope, user behavior, feasibility, or the chosen direction. Label remaining implementation latitude as deferred to `to-spec`, not as an open Proposal blocker.
7. **Review once as a whole.** Show the complete Proposal. Ask for one explicit approval to publish; incorporate edits and re-review when meaning changes.
8. **Publish.** Create an approved Proposal issue in the provided tracker. With no tracker, set `status: approved`, write `.pi/scratch/<effort>/proposal.md`, and run publication validation. Report the canonical link or path.
9. **Stop.** Do not start `to-spec` or implementation unless the user requests the next stage.

## Change control

Treat an approved Proposal as a stable handoff. A semantic change reopens it as `draft`; mark linked Specs and Task graphs `stale`, then obtain approval again. Correct spelling or formatting without changing status.

## Stop rules

Stop and ask the smallest blocking question when a Proposal decision requires the user's judgment. Stop and return to evidence gathering when a required fact is missing. Stop without publishing when approval is withheld. Stop after the approved Proposal is published.