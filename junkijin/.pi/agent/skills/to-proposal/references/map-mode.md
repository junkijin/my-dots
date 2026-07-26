# Map mode

Use a Map as low-resolution coordination state for a Proposal that cannot be settled in one coherent conversation. The Map is not the final Proposal.

## Initial charting

1. State the destination and boundaries.
2. Survey the decision space breadth-first.
3. Separate precise questions from fog that cannot yet be phrased precisely.
4. Draft the Map, initial issues, and blocking edges.
5. Show the complete initial graph and obtain one approval.
6. Publish the Map and issues, then wire native child and dependency relationships where the tracker provides them. For local fallback, change the Map to `status: active`, each issue to `status: open`, and run `python3 scripts/validate.py .pi/scratch/<effort>` before work begins.
7. Automatically delegate independent, unblocked `research` issues when a subagent or background-agent tool is actually available. Announce what was delegated. When no such tool exists, leave the issues available or research them in the current session; never claim background work is running.

After the initial graph approval, claim, add, update, and resolve issues autonomously while they remain inside the approved destination. Ask again before changing the destination, expanding scope, or crossing an external, destructive, or costly permission boundary.

Charting does not have a one-ticket-per-session limit. Continue while useful evidence is available and no user decision, permission boundary, or blocker requires a pause.

## Map artifact

Use `assets/map-template.md`. Keep only:

- the destination and approved boundaries;
- standing project constraints;
- one linked gist for each resolved issue;
- fog that is in scope but not yet precise enough to become an issue;
- explicit out-of-scope items.

Do not duplicate full resolution detail in the Map. Query the tracker's open children for live state. If the tracker lacks child relationships, maintain a compact linked child index in the Map.

## Issue types

Use `assets/decision-template.md` and exactly one type:

- **`decision`** — a Proposal-shaping choice that the user must confirm. Present one recommendation and wait for the user.
- **`research`** — bounded evidence gathering. It may be delegated and must return findings, sources, confidence, and remaining uncertainty; it does not make the user's value judgment.
- **`prototype`** — one isolated throwaway artifact answering one explicit design question. It resolves only after the user gives a verdict.
- **`prerequisite`** — non-production work needed before evidence or a decision is possible, such as obtaining access or preparing representative sample data. It must not deliver part of the destination.

Do not create implementation tasks in a Proposal Map.

## Identity, claims, and dependencies

- The tracker ID is canonical on a real tracker. Local fallback IDs are `D001`, `D002`, and so on.
- Use native assignment as the claim when available. Local fallback uses `status: claimed` and `claimed_by` in YAML frontmatter.
- Claim before work. Do not work an issue claimed by another actor.
- Use native blocking links when available. If the tracker has no native dependency, keep canonical blocker links in `## Dependencies`. Local fallback also uses `blocked_by: [D001, D002]`.
- A frontier issue is open, unblocked by unresolved issues, and unclaimed.
- Record a resolution once: in the issue's resolution comment or its local `## Resolution`. The Map and Proposal contain only the conclusion and a link.

Other sessions or agents may change graph state. Refresh the relevant issue and blockers before claiming or resolving it.

## Work the graph

1. Load the Map, not every issue body.
2. Refresh the frontier.
3. Prefer a user-named issue; otherwise select useful frontier work. Independent research may run in parallel.
4. Claim each issue before work.
5. Load only related decisions and evidence.
6. Resolve the issue according to its type.
7. Record the resolution, close or mark it resolved, and append one linked gist to the Map.
8. Add newly precise issues, wire real blockers, and remove graduated fog. Move work beyond the destination to Out of scope rather than resolving it on the route.
9. Continue with other useful frontier issues until a stop rule applies.

## Automatic research delegation contract

For each delegated research issue, provide the worker with:

- the destination and exact research question;
- relevant project-context and source pointers;
- the prohibition on production changes;
- the required output: findings, claim-level citations, confidence, contradictions, and remaining unknowns;
- the canonical issue or local file to update, if the tool safely supports that ownership model.

Parallelize only independent research. Synthesize returned evidence before creating or resolving downstream decisions.

## Completing the Map

The Map is ready to finish when all direction-changing questions are resolved or ruled out and remaining details belong in `to-spec`.

1. Draft a separate Proposal from the resolved graph.
2. Show the complete Proposal and obtain explicit approval.
3. Publish the Proposal and link it from the Map.
4. Mark the Map complete using project tracker conventions; for local fallback use `status: completed`.
5. Leave decision detail in its original issue and stop.