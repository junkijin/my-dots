---
name: git-commit
description: Review Git changes, organize atomic commits, write commit messages that follow repository conventions, and create authorized commits. Use for commit creation, commit message drafting or improvement, staged diff review, or planning logical commit boundaries. Do not use for general implementation, code review, or branch, push, PR, or history management alone.
---

# Git commit

Create commits that are easy to understand, verify, and revert. Review the actual contents before writing the message.

## 1. Establish scope and conventions

- For message-only or review requests, do not modify files, the index, or history. Stage and commit only when authorized; do not request the same approval again.
- Follow the user's scope and repository instructions. Inspect relevant `AGENTS.md`, `CONTRIBUTING`, commit templates, and commitlint or hook configuration. Use recent commits as secondary evidence of conventions.
- Follow the repository's message language, type and scope, length, footer, and signing requirements. Do not impose Conventional Commits, a 50-character limit, capitalization, or mandatory bodies universally.
- Preserve user work and existing staged changes. If unrelated changes are already staged, clarify the commit scope rather than including or unstaging them without authorization.
- A commit request does not authorize push, amend, rebase, squash, reset, clean, or deletion. Do not hide existing work with an automatic stash or bypass hooks.

## 2. Inspect changes and define commit boundaries

```bash
git status --short
git diff
git diff --staged
git log -10 --format=%s
```

Read relevant untracked files separately; they do not appear in `git diff`. If output is truncated, inspect by path until the full relevant diff has been reviewed.

Group changes by purpose, not file count or extension:

- Keep a bug fix, its regression tests, and related documentation together.
- Separate unrelated fixes, broad formatting, behavior-preserving refactoring, and behavior changes.
- Include required dependencies, configuration, lockfiles, and intentionally tracked generated files.
- Describe each commit in one sentence. If reverting it would also undo unrelated work, reconsider its boundaries.
- Dependent commits are valid, but each step must remain coherent and verifiable in order. Briefly outline boundaries and dependency order when multiple commits are needed.

## 3. Stage and validate the intended contents

For authorized commit creation, add explicit paths and use hunk-level staging for mixed changes. Do not use unreviewed `git add .`, `git add -A`, or `git commit -a`.

```bash
# Replace placeholders with reviewed target paths.
git add -p -- path/to/tracked-file
git add -- path/to/new-file
git diff --staged
git diff --staged --check
```

In non-interactive environments, a reviewed patch containing only authorized hunks may be applied with `git apply --cached`. Do not overwrite working files to arrange staging.

Review the entire staged diff for missing required changes, unrelated edits, debug output, temporary files, personal settings, and sensitive data. If secrets are present, stop and report their location without revealing values. Already exposed credentials require revocation or rotation; a deletion commit or `.gitignore` is not a remedy. Do not change external credentials without authorization.

Run the build, tests, lint, and secret checks required for the change. `git diff --staged --check` detects whitespace errors and conflict markers, not functional defects or secrets. Check for regression coverage when fixing bugs; do not expand a message or review request into code changes.

**Working-directory tests do not prove that a partially staged snapshot passes.** Where feasible, validate the exact index snapshot in a separate temporary environment with the required dependencies. Verify each intermediate state when splitting commits. Report unavailable checks and distinguish working-directory validation from staged-snapshot validation.

If a check or hook modifies files, review the changes, stage only authorized content, and rerun affected checks. Resolve failures before committing; do not claim unperformed checks passed.

## 4. Write a message grounded in the diff

Write a concise, specific subject describing the resulting change, not a work log such as `update code` or `address review feedback`. Use imperative wording as an English default and natural, consistent phrasing in other languages.

For non-obvious changes, leave a blank line after the subject and explain the relevant context:

- What was wrong and what changes now
- Why this approach was chosen, including important alternatives or constraints
- Compatibility impact, side effects, or remaining limitations
- Validation actually performed and its results, when useful

Do not paraphrase obvious code or rely on an issue link for the essential explanation. Never invent rationale, issue numbers, performance measurements, or test results. Ask only when necessary context cannot be established. A subject alone may suffice for a trivial change.

If the repository uses Conventional Commits, follow `type(scope): description` with an optional scope. Use `feat` for features and `fix` for bug fixes; choose other types by repository convention and purpose, not file extension. A fix and its regression tests may share one `fix` commit. Do not label behavior changes as `refactor`. Mark breaking changes with `!` or `BREAKING CHANGE:` and explain the impact.

Fictional example; adapt to the actual diff and repository conventions:

```text
fix(payments): retry only with idempotency keys

A response timeout after payment processing can cause automatic retries
to duplicate a charge. Disable retries for requests without an
idempotency key while preserving the retry policy for keyed requests.
```

## 5. Commit and report

Before an authorized commit, confirm that the staged contents, logical purpose, message, and validation results agree. If nothing is staged, do not create an empty commit unless explicitly requested.

Follow the repository's signing policy. `git commit -s` adds a `Signed-off-by` attestation; `git commit -S` creates a cryptographic signature. Do not substitute one for the other or attest to contribution rights without confirmation.

After committing, inspect `git log -1 --format=fuller --stat` and `git status --short` to confirm the result and remaining changes. Do not automatically amend an unexpected result.

For message requests, return a ready-to-use message. For reviews or split plans, report issues and recommended boundaries. For completed commits, briefly report the hash, subject, check results, and any remaining changes or validation gaps.
