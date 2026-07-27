# Requirements and testing guidance

## Synthesis, not discovery

Build the Product Spec only from the current conversation and supplied authoritative sources.

- Explicit user statements and approved decision records define intent and value judgments.
- Current code, tests, ADRs, tracker records, and project documentation establish facts and vocabulary.
- Repository evidence may clarify the current state but may not invent desired behavior.
- When an omission could materially change the Product Spec, report the gap and stop instead of assuming or beginning an interview.
- Technical latitude that does not change product behavior belongs to `to-tasks` and does not block synthesis.

## Product requirement coverage

Describe the feature from the user's perspective. Cover only relevant dimensions, including:

- actors and their differing goals or permissions;
- entry points, primary flows, and expected outcomes;
- first use, empty states, repeat use, edits, cancellation, and recovery when discussed or necessarily part of the stated behavior;
- user-visible errors and unavailable states already established by the sources;
- persistence, ordering, and compatibility expectations visible to users;
- accessibility, privacy, performance, or operational expectations when they are product requirements;
- explicit in-scope and out-of-scope boundaries.

Do not create stories merely to make the list long. Each story must add a distinct actor, behavior, or benefit and remain traceable to the available context.

## Already-settled implementation decisions

The Product Spec may preserve a technical decision when the conversation, Decision Map, ADR, or other authoritative source already settled it. Examples include a required external API, mandated compatibility behavior, an existing schema that must remain stable, or a chosen architectural direction.

Do not use the Product Spec to decide internal module responsibilities, new interface shapes, migrations, failure mechanisms, rollout procedures, or implementation algorithms. `to-tasks` resolves those decisions and records them in the graph-level implementation plan.

## Test seams

A test seam is a boundary through which behavior is driven and observed, such as a browser flow, public API, contract boundary, event, or public module interface.

For Product Spec testing decisions:

- test external behavior rather than implementation details;
- prefer stable seams and test patterns already present in the project;
- prefer the highest practical seam that proves the behavior;
- use the fewest seams that still provide credible behavioral coverage;
- do not force one seam when distinct actors or externally visible behaviors cannot be observed through it;
- record what evidence must prove, leaving risk-specific integration and lower-level seam selection to `to-tasks`.

Present the proposed seams once and wait for the user to confirm them. This is artifact verification, not a requirements interview.

## Validation checklist

Before publication, verify:

- every claim has a source in the conversation, approved direction records, or project evidence;
- the Problem Statement and Solution use the project's domain language;
- stories are comprehensive, distinct, numbered, and user-centered;
- no section silently invents behavior or technical design;
- implementation decisions were already settled before `to-spec` ran;
- testing decisions describe externally observable evidence and confirmed seams;
- exclusions and relevant notes are explicit;
- no blocking product question remains hidden in Further Notes.
