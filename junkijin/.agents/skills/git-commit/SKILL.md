---
name: git-commit
description: Gives a procedure to examine Git changes, set commit boundaries, stage and check the permitted changes, write a commit message from the diff, and make the commit. Use it to make commits, write commit messages, examine staged diffs, or plan commit boundaries, but not for implementation, code review, or only branch, push, pull request, or history operations.
---

# Git commit

## 1. Purpose

This skill gives the procedure to make Git commits. Each commit must be easy to understand, test, and revert. Examine the changes before you write the commit message.

## 2. Terms

- **Commit scope**: The set of changes that the user tells you to commit.
- **Permission**: A clear instruction from the user to do a specified operation.
- **Index snapshot**: The exact contents of the staging area.
- **Repository rules**: The commit rules in the repository files. Examples are `AGENTS.md`, `CONTRIBUTING`, commit templates, commitlint configuration, and hook configuration.

## 3. Request types and permissions

Identify the request type before you start.

| Request type | Permitted operations |
| --- | --- |
| Commit message only | Read operations only |
| Review or split plan | Read operations only |
| Commit creation | Stage and commit the commit scope |

1. If the request is for a message or a review, do not change files, the index, or the history.
2. If the user gives permission to commit, stage and commit the changes. Do not ask for the same permission again.
3. Obey the commit scope and the repository rules.

CAUTION: A commit request does not give permission for push, amend, rebase, squash, reset, clean, or delete operations. Do not do these operations without a separate permission. If you do, you can cause loss of user work.

## 4. Procedure

### 4.1 Find the repository rules

1. Read the repository rules.
2. Read the subjects of the last 10 commits. Use them only as secondary data about the conventions.
3. Use the repository rules for the message language, type, scope, length, footer, and signature.
4. If the repository has no rule for an item, do not add a rule. For example, do not apply Conventional Commits, a 50-character limit, capital letters, or a mandatory body.

### 4.2 Examine the changes

1. Run these commands:

   ```bash
   git status --short
   git diff
   git diff --staged
   git log -10 --format=%s
   ```

2. Read the related untracked files. The `git diff` command does not show untracked files.
3. If the output is truncated, examine each path separately. Continue until you read the full diff for the commit scope.

CAUTION: Keep the user work and the changes that are already staged. Do not use an automatic stash. If unrelated changes are already staged, ask the user about the commit scope. Do not commit or unstage these changes without permission.

### 4.3 Set the commit boundaries

Put the changes into groups by purpose. Do not use the number of files or the file extensions to make the groups.

1. Put a bug fix, its regression tests, and its related documentation in one commit.
2. Put each of these changes in a separate commit:
   - Unrelated fixes
   - Large format changes
   - Refactors that do not change behavior
   - Changes in behavior
3. Add the necessary dependencies, configuration, lockfiles, and generated files that the repository tracks.
4. Write one sentence that describes each commit. If you cannot write this sentence, change the boundaries.
5. If a revert of a commit also removes unrelated work, change the boundaries.
6. If you make more than one commit, give the user a short list of the boundaries and their sequence.

NOTE: A commit can depend on an earlier commit. Each commit in the sequence must be correct and testable.

### 4.4 Stage the changes

Do this step only if you have permission to commit.

1. Stage each path by its name. If a file has mixed changes, stage only the applicable hunks.

   ```bash
   # Replace the placeholders with the paths that you examined.
   git add -p -- path/to/tracked-file
   git add -- path/to/new-file
   ```

2. If the environment is not interactive, make a patch that has only the permitted hunks. Examine the patch. Then apply the patch with `git apply --cached`.
3. Do not change the working files to make the staging easier.

CAUTION: Do not use `git add .`, `git add -A`, or `git commit -a` if you did not examine all of the changes. These commands can add unrelated changes or sensitive data to the commit.

### 4.5 Examine the staged changes

1. Run `git diff --staged`. Read all of the staged diff.
2. Make sure that the staged diff has all of the necessary changes.
3. Make sure that the staged diff does not have these items:
   - Unrelated changes
   - Debug output
   - Temporary files
   - Personal settings
   - Sensitive data

CAUTION: If you find a secret, stop the procedure. Tell the user the location of the secret. Do not show the secret value.

NOTE: A commit that deletes a secret does not make the secret safe. A `.gitignore` entry also does not make the secret safe. The owner must revoke or rotate an exposed credential. Do not change external credentials without permission.

### 4.6 Do the checks

1. Run the build, tests, lint, and secret checks that the change needs.
2. Run `git diff --staged --check`.

   NOTE: This command finds only whitespace errors and conflict markers. It does not find functional errors or secrets.

3. If the change is a bug fix, make sure that a regression test exists.
4. If the request is for a message or a review, do not change the code.
5. If a check or a hook changes files, examine the changes. Stage only the permitted changes. Then do the related checks again.
6. If a check fails, correct the cause before you commit.

CAUTION: A test in the working directory does not show that a partially staged snapshot is correct. If possible, test the exact index snapshot in a separate temporary environment. Install the necessary dependencies in that environment. If you split the changes into more than one commit, test each intermediate state.

7. Tell the user which checks you could not do.
8. Tell the user if you tested the working directory or the index snapshot.

CAUTION: Do not say that a check passed if you did not do that check.

### 4.7 Write the commit message

#### 4.7.1 Subject

1. Write a short and specific subject. The subject must describe the result of the change.
2. Do not write a work log, for example `update code` or `address review feedback`.
3. In English, use the imperative form. In other languages, use natural and consistent words.

#### 4.7.2 Body

1. If the change is not obvious, add a blank line after the subject. Then write a body.
2. Write only the necessary information in the body:
   - The problem and the change
   - The reason for the solution, with important alternatives or limits
   - The effect on compatibility, the side effects, and the limits that stay
   - The checks that you did and their results, if this data is useful
3. Do not repeat the information that the code clearly shows.
4. Do not use only an issue link for the main explanation.
5. For a trivial change, you can write a subject without a body.

CAUTION: Do not invent reasons, issue numbers, performance values, or test results. Ask the user only if you cannot find the necessary information.

#### 4.7.3 Conventional Commits

Use these rules only if the repository uses Conventional Commits:

1. Use the format `type(scope): description`. The scope is optional.
2. Use `feat` for a new feature. Use `fix` for a bug fix.
3. For other types, use the repository convention and the purpose of the change. Do not use the file extension to select the type.
4. You can put a fix and its regression tests in one `fix` commit.
5. Do not use `refactor` for a change in behavior.
6. For a breaking change, add `!` or a `BREAKING CHANGE:` footer. Explain the effect of the change.

Example:

```text
fix(payments): retry only with idempotency keys

A response timeout after payment processing can cause automatic retries
to duplicate a charge. Disable retries for requests without an
idempotency key while preserving the retry policy for keyed requests.
```

NOTE: This example is fictional. Change it to agree with the diff and the repository rules.

### 4.8 Make the commit

1. Make sure that the staged changes, the purpose, the message, and the check results agree.
2. If no changes are staged, do not make an empty commit. Make an empty commit only if the user tells you to do so.
3. Obey the signature rules of the repository:
   - `git commit -s` adds a `Signed-off-by` line. This line is a statement about contribution rights.
   - `git commit -S` adds a cryptographic signature.
   - Do not use one option as a replacement for the other option.
   - Do not use `-s` before the user confirms the contribution rights.
4. Do not use `--no-verify`. The hooks must run.
5. Make the commit.
6. Run these commands to examine the result:

   ```bash
   git log -1 --format=fuller --stat
   git status --short
   ```

7. If the result is not correct, do not amend the commit automatically. Tell the user about the problem.

## 5. Report

Give the output that agrees with the request type:

| Request type | Output |
| --- | --- |
| Commit message only | A commit message that is ready to use |
| Review or split plan | The problems and the recommended commit boundaries |
| Commit creation | The hash, the subject, the check results, the changes that are not committed, and the checks that you did not do |
