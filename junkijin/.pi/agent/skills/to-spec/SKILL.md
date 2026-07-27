---
name: to-spec
description: Use this skill when the user wants the current conversation, optional approved direction records, and known codebase context synthesized into a product-focused Spec or PRD and published as one project tracker issue. Use it to capture the problem, user-facing solution, comprehensive user stories, already-settled implementation decisions, external-behavior testing decisions, scope, and notes. Do not use it to interview for new requirements, make new technical design decisions, decompose tasks, or implement.
compatibility: Works with a project-provided issue tracker; otherwise publishes local Markdown under .pi/scratch.
disable-model-invocation: true
---

# To Spec

## Goal

Turn the product context already established in the current conversation and available project sources into one tracker-native Product Spec issue. Confirm the proposed test seams, publish the issue without changing labels or other triage metadata, report its canonical location, and stop.

## Success criteria

Finish only when:

- every claim in the Product Spec is grounded in the current conversation, an optional approved Decision Map, linked decision records, or current project evidence;
- the problem and solution are stated from the user's perspective using project domain terminology;
- the numbered user stories comprehensively cover the discussed behavior without filler or duplication;
- implementation decisions include only choices already settled by the available sources and do not invent technical design;
- testing decisions describe externally observable behavior, use existing and high-level seams where practical, and identify relevant prior art;
- the user has confirmed that the proposed test seams match expectations;
- scope exclusions and material notes are explicit;
- one Product Spec issue is published to the provided tracker, or one local fallback file is written when no tracker is provided;
- publication does not add or change labels, status, assignment, or other triage metadata.

## Phase and authority

The current phase is product-requirements synthesis, not discovery or technical design.

- Do not interview the user for new requirements. Investigate project facts instead of asking for facts the environment can answer.
- Do not invent a requirement, decision, or assumption to fill a gap. If the existing conversation and sources are not sufficient for an honest Product Spec, name the exact missing product context and stop rather than asking questions one at a time.
- A completed Decision Map is optional. When one is supplied, preserve its approved direction and linked resolutions as authoritative constraints; do not reopen them.
- Record technical choices only when they were already settled. Leave unresolved system boundaries, interfaces, schemas, failure mechanisms, compatibility plans, rollout details, and implementation methods to `to-tasks`.
- If new evidence conflicts with an approved Decision Map or would change its problem, outcome, scope, user behavior, success criteria, or chosen direction, stop and tell the user to invoke `/skill:to-decision-map` with the canonical Map reference.
- Do not write production code, create implementation tasks, or begin implementation.

## Resolve project context and storage

Before writing:

1. Read the current conversation and project context already supplied, including referenced terminology, ADR, testing, documentation, and tracker conventions.
2. If a Decision Map or other decision source is supplied, read the portions needed to preserve its resolved direction and constraints.
3. Inspect the smallest useful set of current code, public behavior, tests, and history needed to understand the present state, use domain vocabulary correctly, and find testing prior art.
4. If an issue tracker is explicitly provided, publish one Product Spec issue there. Create the issue with the tracker's defaults; do not add or change labels, status, assignment, or other triage metadata.
5. Do not infer a tracker from `git remote`. With no provided tracker, write `.pi/scratch/<effort>/spec.md`.

Use [the Product Spec template](assets/spec-template.md) for the issue body or local fallback. Follow [requirements and testing guidance](references/requirements-and-testing.md) when judging coverage and test seams.

## Input contract

The current conversation and any supplied sources must collectively provide enough settled context to state:

- the user's problem and desired outcome;
- the relevant actors;
- the user-facing solution and expected interactions;
- the in-scope and out-of-scope boundaries;
- the product behavior and constraints already discussed;
- any implementation decisions already made;
- no unanswered product question whose answer could materially change the resulting Product Spec.

An approved Decision Map is not required for a straightforward, already-discussed change. Technical design uncertainty alone does not block `to-spec`; preserve that latitude for `to-tasks`. If product context is insufficient, report the exact gaps and stop without drafting or starting an interview. Recommend `to-decision-map` only when the missing context represents substantial direction-stage uncertainty.

## Workflow

1. **Resolve sources.** Read the current conversation, supplied decision records, and project context. Distinguish explicit user decisions from repository facts and technical latitude.
2. **Inspect the current product context.** Verify current behavior, domain terminology, relevant ADRs, and existing tests using the smallest useful project surface.
3. **Validate synthesis readiness.** Confirm the input contract. Stop on missing product context rather than inventing it or beginning an interview.
4. **Propose test seams.** Prefer existing stable seams and the highest externally observable boundary that proves the discussed behavior. Use the fewest seams that provide credible coverage; do not force one seam when distinct behavior cannot be observed there. Show the proposal and wait for the user to confirm that it matches expectations.
5. **Write the Product Spec.** Use [the Product Spec template](assets/spec-template.md). Make user stories extensive enough to cover the feature, but non-duplicative and grounded. Record only already-settled implementation decisions.
6. **Review the Spec.** Check source grounding, story coverage, internal consistency, domain vocabulary, out-of-scope boundaries, external-behavior testing, and separation from technical design. Do not add a separate approval lifecycle or approval record.
7. **Publish.** Create one Product Spec issue in the provided tracker using default metadata, or write `spec.md` for local fallback. Link supplied Decision Maps or evidence in the issue body when useful. Do not create labels, change labels, or mutate triage metadata.
8. **Report and stop.** Return the canonical issue URL or local path. Do not proceed to technical design or task decomposition.

## Change control

A semantic change to a published Product Spec can invalidate a linked implementation plan or task graph. Surface that impact and let `to-tasks` review or rebuild the affected graph; do not create an approval lifecycle for the Product Spec. Correct formatting only when asked. Do not reinterpret a completed Decision Map. Route direction changes back to `/skill:to-decision-map` with its canonical reference.

## Stop rules

Stop without drafting when required product context is missing. Stop for the single test-seam confirmation. Stop when supplied direction sources conflict. Stop after the Product Spec issue or local fallback is published. Do not implement.
