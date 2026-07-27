---
name: to-decision-map
description: Use this skill when the user wants to shape a large or uncertain product change, migration, or architectural direction into an approved issue-backed decision map that is safe to hand to to-spec for product-spec synthesis, or wants to work an existing map one decision at a time. Use it for direction-stage wayfinding that spans decisions, sessions, research, prototypes, dependencies, or multiple agents. Do not use it for a small change whose destination and route are already clear, Product Spec synthesis, technical design, task decomposition, production implementation, or domain-agnostic execution planning.
compatibility: Works with a project-provided issue tracker and optional subagent tools; otherwise uses local Markdown and current-session research.
disable-model-invocation: true
---

# To Decision Map

## Goal

Turn direction-stage uncertainty into one approved Decision Map that is safe to hand to `to-spec` for synthesis into a tracker-native Product Spec. The Map and its linked decision records are the deliverable; do not synthesize or publish a separate direction document.

The Map issue or `map.md` is the canonical entry point. It is a low-resolution index over child decisions, not a store for their detail.

## Success criteria

Finish only when:

- the destination identifies the outcome this effort is choosing and bounds the direction-level scope;
- every question that could change the problem, outcome, scope, user behavior, feasibility, success criteria, or chosen architectural direction is resolved or ruled out;
- the linked records collectively capture the chosen direction, constraints, evidence, risks, and success criteria needed for `to-spec` to synthesize the Product Spec;
- decision detail is recorded once in its issue resolution and represented in the Map only by a linked one-line gist;
- no in-scope fog remains that could change direction;
- the user has reviewed the complete Map and explicitly approved it through the final approval decision;
- the completed Map is published to the project tracker, or to the local fallback when no tracker is provided.

Product details that do not change direction may be left for `to-spec` to synthesize from the conversation and Map records. Technical implementation contracts and design decisions are deferred to `to-tasks`.

## Phase and authority

The current phase is proposal-level research and decision-making, not implementation.

- Inspect project files, documentation, history, APIs, and tracker state as needed.
- Write planning artifacts, evidence notes, and isolated throwaway prototypes only.
- Do not modify production code or deliver any part of the destination. Unlike a domain-agnostic Wayfinder, this skill has no execution override.
- Resolve facts from available evidence. Put every direction-shaping judgment to the user, one at a time, with a recommended answer and a short trade-off explanation.
- A HITL issue resolves only through a live user answer. Never answer for the user.
- Do not revisit an approved decision unless new evidence contradicts it.
- Ask before changing the destination, expanding scope, or taking an external, destructive, credential-changing, or costly action.
- Resolve at most one non-research issue per session. Independent research issues may be delegated in parallel.

## Resolve project context and storage

Before writing:

1. Read the project context already supplied and any files it points to.
2. If it explicitly provides an issue tracker, use that tracker for the Map and decision issues. Follow its native issue, child, dependency, assignment, status, and label conventions; do not invent labels.
3. Do not select a tracker merely from `git remote`. If no tracker is provided, use `.pi/scratch/<effort>/` in the project root.
4. Read project-provided terminology and ADRs relevant to the destination. Update them only when the project already defines their location and format and the user has confirmed the decision.

For local fallback files, the templates in `assets/` are optional starting points, not publication schemas. Before using or completing a local Map, inspect its identities, statuses, claims, blockers, resolution links, remaining fog, and approval state directly.

In user-facing narration and Map summaries, refer to tracker issues by their linked titles, never by bare IDs. IDs remain canonical metadata but do not substitute for readable names.

## Decision Map model

### Map

The Map contains only:

- **Destination** — the approved-direction outcome this effort is finding;
- **Notes** — standing constraints, terminology, and context every session needs;
- **Decisions So Far** — one linked gist per resolved issue;
- **Not Yet Specified** — in-scope fog that cannot yet be phrased as a precise issue;
- **Out of Scope** — work consciously ruled beyond the destination.

Open work is discovered from open child issues, not copied into the Map. If a tracker lacks child relationships, maintain the smallest possible linked child index without duplicating issue bodies.

### Issue types

Use exactly one type per child issue:

- **`decision`** (HITL) — a direction-shaping choice. Present one recommendation and wait for the user.
- **`research`** (AFK) — bounded evidence gathering. Return findings, claim-level sources, confidence, contradictions, and remaining uncertainty; do not make the user's value judgment.
- **`prototype`** (HITL) — one isolated throwaway artifact answering one explicit design question. Resolve only after the user gives a verdict.
- **`prerequisite`** (AFK or HITL) — non-production work required before evidence or a decision is possible. It may not deliver part of the destination.

Do not create implementation tasks in a Decision Map.

### Claims, dependencies, and frontier

Claim an issue before work by native assignment. Local fallback uses `status: claimed` and `claimed_by`. A frontier issue is open, unblocked by unresolved issues, and unclaimed. Use native blocking relationships where available; local fallback uses `blocked_by`.

Record the answer exactly once: in the issue's resolution comment or the local `## Resolution`. Link assets rather than pasting them into the Map.

## Invocation

There is no Direct mode. Read [the Map workflow](references/map-workflow.md), then use one of two invocation modes.

### Chart the Map

Use when the user provides a loose idea rather than an existing Map.

1. Establish the destination in one or two lines.
2. Inspect available context before asking for facts.
3. Survey the decision space breadth-first, separating precise questions from fog.
4. If no meaningful fog or dependency graph exists and the entire route is clear enough for one coherent session, create no planning artifact. Stop and ask how the user wants to proceed.
5. Otherwise create the Map, initial child issues, and blocking edges; delegate independent research when an actual subagent facility is available.
6. Stop. Charting creates coordination state but hand-resolves no HITL issue.

### Work through the Map

Use when the user supplies a Map URL, tracker reference, or local path. Without a named issue, choose the first useful frontier issue.

1. Load the Map at low resolution and refresh the frontier.
2. Claim one issue before doing its work.
3. Resolve it according to its type.
4. Record the resolution, close it, append its linked gist to the Map, and update newly visible issues, dependencies, fog, and scope.
5. Stop after that issue, except that independent research issues may complete in parallel.

## Final approval and handoff

When all direction-shaping issues are resolved or out of scope and no direction-changing fog remains:

1. Create one final `decision` issue asking the user to approve the complete Map as the direction contract for `to-spec`. Create it only when the graph is otherwise complete.
2. In that session, show the complete low-resolution Map and zoom into linked records only as needed. The agent must not self-approve.
3. If the user requests a semantic change, leave approval unresolved, add or reopen the necessary issues, wire blockers, and return the Map to active work.
4. If the user approves, record the approval as that issue's resolution, close it, append its linked gist, store its canonical pointer as the Map approval, and mark the Map completed.
5. Report the canonical Map link or path and stop.

A completed Decision Map plus its linked resolutions is the complete direction handoff. Do not create a separate summary document or issue.

## Change control

A semantic change to a completed Map invalidates its approval: return it to active status, reopen or create the affected decision issues, and mark linked Specs and Task graphs stale. Obtain final approval again after the graph is complete. Correct spelling or formatting without changing status.

## Stop rules

Stop and ask how to proceed when charting shows that no Map is warranted. Stop after initial charting. Stop for the user's answer on a HITL issue. Stop after one non-research issue per session. Stop when required evidence or permission is missing. Stop after publishing the completed, approved Map.
