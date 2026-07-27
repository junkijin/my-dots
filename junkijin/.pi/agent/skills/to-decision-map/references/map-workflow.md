# Decision Map workflow

Use this workflow to chart a new Decision Map or work an existing one. The Map is the final proposal-stage artifact, not an intermediate document and not a container for duplicated detail.

## Chart a new Map

1. **Name the destination.** State in one or two lines what approved product or architectural direction `to-spec` will synthesize into a tracker-native Product Spec. The destination fixes the scope.
2. **Inspect before asking.** Read the smallest relevant set of project context, code, history, tracker records, ADRs, and primary external sources. Do not ask the user for facts the environment can answer.
3. **Survey breadth-first.** Fan out across the whole direction-level decision space. Identify precise questions, their likely blockers, and in-scope fog that cannot yet be phrased precisely. Leave product-spec synthesis to `to-spec` and implementation-contract questions to `to-tasks`.
4. **Test whether a Map is warranted.** If the destination and entire route are already clear, no meaningful fog or dependency graph remains, and the effort fits one coherent session, create nothing. Explain that a Map would add no coordination value and ask the user how to proceed.
5. **Create the Map.** Use `assets/map-template.md`. Fill Destination and Notes, leave Decisions So Far empty, record fog under Not Yet Specified, and record known exclusions under Out of Scope.
6. **Create precise issues.** Use `assets/decision-template.md` for local fallback. On a tracker, create child issues with one precise `## Question` and native type metadata or project-defined labels.
7. **Wire dependencies in a second pass.** Issues need canonical identities before blockers can reference them. Use native blocking relationships when available.
8. **Delegate independent research.** When a real subagent or background-agent facility exists, delegate independent unblocked research issues in parallel and announce what was delegated. Otherwise leave them on the frontier or research them in a later session. Never claim work is running when it is not.
9. **Activate and stop.** Publish the graph using tracker conventions. For local fallback, set the Map to `status: active` and issues to `status: open`, then inspect that identities are unique, blockers exist, the graph is acyclic, and frontier state is coherent. Stop without hand-resolving a decision or prototype.

After creation, changes inside the destination do not require graph-wide approval. Ask before changing the destination, expanding scope, or crossing an external, destructive, credential-changing, or costly permission boundary.

## Map as index

Keep only:

- the destination;
- standing constraints and context;
- one linked gist for each resolved issue;
- in-scope fog not yet precise enough to become an issue;
- explicit out-of-scope items.

A resolution lives in exactly one issue. Do not restate its rationale, evidence, or full answer in the Map. Open issues are tracker state and should not be listed in the Map when child queries are available.

## Fog of war

Fog is in-scope uncertainty whose question cannot yet be stated precisely.

- Create an issue when the question is precise now, even if it is blocked.
- Keep it in Not Yet Specified when the question itself is still unclear.
- When a resolution sharpens fog, create the new issue or issues, wire blockers, and remove the graduated fog from the Map.
- Do not put resolved work, live issues, or excluded work in Not Yet Specified.

Out-of-scope work never graduates. If an existing issue is discovered to lie beyond the destination, close or mark it out of scope, record the reason once in its resolution, and add one linked gist under Out of Scope. Do not add it to Decisions So Far.

## Identity, claims, and dependencies

- The tracker issue identity is canonical. Local fallback IDs are `D001`, `D002`, and so on.
- Refer to issues in human-facing text by linked title, never by a bare ID.
- Claim before work. Native assignment is the claim; local fallback uses `status: claimed` and `claimed_by`.
- Never work an issue claimed by someone else.
- Use native blocker relationships. Local fallback uses `blocked_by: [D001, D002]`.
- An issue is unblocked only when all blockers are resolved or out of scope.
- The frontier is the open, unblocked, unclaimed set of child issues.
- Refresh issue status and blockers immediately before claiming or resolving because other sessions may edit the graph concurrently.

## Work one issue

Resolve at most one non-research issue in a session.

1. Load the Map, not every child body.
2. Refresh the frontier.
3. Prefer an issue named by the user; otherwise choose the first useful frontier issue.
4. Claim it before investigation or discussion.
5. Load only related decisions and evidence needed for this question.
6. Resolve it according to its type:
   - `decision`: present one recommendation and trade-offs, then wait for the user's answer;
   - `research`: gather bounded evidence and report findings, claim-level sources, confidence, contradictions, and unknowns;
   - `prototype`: produce the cheapest isolated artifact that enables a user verdict, then wait for that verdict;
   - `prerequisite`: perform safe non-production setup where authorized, or give the user a precise checklist.
7. Record the answer once in a resolution comment or local Resolution, then close or mark it resolved.
8. Append a linked one-line gist to Decisions So Far unless the issue was ruled out of scope.
9. Add newly precise issues, wire blockers, graduate fog, and update or stale invalidated issues.
10. Stop. Independent research may run or return in parallel, but do not use that exception to resolve multiple HITL issues.

## Research delegation contract

Provide each worker with:

- the destination and exact research question;
- the decision the research informs;
- relevant project and source pointers;
- the prohibition on production changes;
- the required output: findings, claim-level citations, confidence, contradictions, and remaining unknowns;
- the canonical issue or local file it may update, only when the tool safely supports that ownership model.

Synthesize returned evidence before resolving downstream issues. Research supplies facts; it does not make the user's direction-shaping judgment.

## Complete and approve the Map

The graph is ready for approval only when:

- every direction-shaping issue is resolved or out of scope;
- no direction-changing fog remains;
- non-directional product detail can be synthesized by `to-spec`, while technical implementation latitude is explicitly deferred to `to-tasks`;
- the Map and linked records collectively state the outcome and problem, chosen direction, scope boundaries, key decisions, constraints, feasibility evidence, risks, and success criteria.

Then:

1. Create one final `decision` issue whose question is whether the complete Map is approved as the direction contract for `to-spec`.
2. Do not combine approval with the session that resolved the last preceding HITL issue.
3. Show the complete Map. Follow links only where the user needs detail.
4. If approval is withheld, add or reopen the issues required by the feedback and make them block approval.
5. If approved, record the user's verdict in the approval issue, resolve it, add its linked gist to Decisions So Far, point the Map's approval metadata to it, and mark the Map completed.
6. Before completion, inspect the Map and graph directly: every issue is resolved or out of scope, blockers are coherent and acyclic, no direction-changing fog remains, and the approval pointer names the user's resolved approval decision.
7. Report the canonical Map location and stop. The completed Map and its linked records are the only direction input to `to-spec`.
