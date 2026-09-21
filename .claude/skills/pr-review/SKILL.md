---
name: pr-review
description: Thoroughly review a GitHub pull request on remote-flows — code quality, architecture, tests, public-API impact. Use this skill whenever the user asks to "review a PR", "review this pull request", provides a GitHub PR URL and asks for feedback, or says things like "what do you think of this PR", "check this PR", or "review PR 1234". Also trigger when the user pastes a GitHub PR link and asks for a review, code review, or feedback on the changes. This is the go-to skill for comprehensive PR reviews, and is what `/deliver` runs automatically after opening a PR. For reviewing local uncommitted changes before a commit, use the built-in code-review skill instead.
allowed-tools: Bash(git:*), Bash(gh:*), Read, Grep, Glob
---

# PR Review

Diff-scoped review of a remote-flows GitHub PR. Scale depth to the actual change: trivial diffs get a quick pass; multi-flow or public-API-touching diffs get parallel sub-agents.

## Step 1: Load context

- Resolve the PR number and repository from the input; pass `--repo <owner/repo>` to every `gh` command when a URL or non-current repository was supplied.
- Fetch metadata with `gh pr view <number> --repo <owner/repo> --json title,body,baseRefName,headRefName,files` and the diff with `gh pr diff <number> --repo <owner/repo>`.
- Before using local Git, verify the PR's repository matches the current checkout. For the same repository, fetch the head branch (`git fetch origin <headRefName>`) before `git show`. For a different repository, inspect through `gh` or an isolated temporary clone instead of the current `origin`.
- If CI is failing, check it: `gh pr checks <number> --repo <owner/repo>`.

## Step 2: Read the rules

Read [CLAUDE.md](../../../CLAUDE.md), [ARCHITECTURE.md](../../../ARCHITECTURE.md), and any `.cursor/rules/*.mdc` whose globs match the changed files. Apply them to the diff. Skip rules that don't match.

## Step 3: Analyze the diff — code quality review

Read each changed file in full, not just the diff hunks. Then review the diff for:

**Logic and correctness**

- Off-by-one errors, missing null/undefined checks, incorrect conditions
- Race conditions, missing error handling at system boundaries
- Incorrect API usage (wrong endpoint, missing params, wrong HTTP method)
- State management bugs (stale closures, missing dependencies, wrong update patterns)

**remote-flows conventions**

- A flow under `src/flows/<FlowName>/` importing from a sibling flow (flows must be self-contained)
- Changes to `src/index.tsx` exports, prop signatures, or hook return shapes — flag as **breaking** unless purely additive (public API is contract-bound; see CLAUDE.md)
- Mutation error handling that skips `mutationToPromise`/`mutateAsyncOrThrow`, or accesses `normalizedErrors`/`fieldErrors`/`rawError`/`response` without narrowing via `isMutationError(error)` first, or that swallows the error instead of re-throwing
- New React Query usage that doesn't fit either the `queryOptions` factory or custom-hook pattern (see `.cursor/rules/react-query-abstractions.mdc`)
- Hand-edits to `src/client/*.gen.ts` (must be regenerated via `npm run openapi-ts`, never hand-edited)
- HTML from API responses rendered without `sanitizeHtml()` (or DOMPurify)
- `any` types outside genuine workarounds using `$TSFixMe`
- New `console.log`/`console.info` (only `console.warn`/`console.error` are allowed outside `scripts/`)

**Patterns and conventions**

- Deviations from existing codebase patterns (check surrounding code)
- Missing or incorrect TypeScript types (especially `any` or type assertions)
- Naming that doesn't match project conventions

**Architecture**

- Responsibilities in the wrong layer (business logic in components, UI concerns in hooks)
- Missing or excessive abstractions
- Prop drilling where context or composition would be cleaner
- Coupling between domains (flows) that should be independent

**Edge cases**

- Empty states, loading states, error states not handled
- Arrays that could be empty, values that could be undefined
- Concurrent user actions, browser back/forward, page refresh during flows
- Accessibility concerns in UI changes (missing labels, keyboard navigation)

**Security**

- User input flowing into dangerous sinks without sanitization
- Sensitive data exposed in logs, URLs, or client state
- Missing authorization checks

**Tests**

- `vi.mock('@/src/client')` instead of MSW (`server.use(...)` + handlers) — mocking the generated client bypasses the real query/serialization path
- `expect.objectContaining()` used where strict `toHaveBeenCalledWith({ exact: 'shape' })` is expected
- React Query consumers not wrapped in the shared `TestProviders`/`queryClient`, or missing `queryClient.clear()` between tests
- New behavior added without a corresponding test

**Comment quality**

Default posture: comments are opt-in, not opt-out — most code needs none. The checks below flag existing comments that shouldn't have been written; never flag a missing comment.

- Doc comments (JSDoc) on exported/shared symbols should describe only caller-visible behavior — flag if it leaks internal mechanism (which hook/library/context is used) instead of the observable contract
- Inline comments should explain _why_, not restate _what_ the code already says — flag ones that just narrate an obvious line or enumerate branches the code already makes clear
- A comment deleted in the diff while its subject still exists in the new code is a red flag — it should have been updated to match the change, not dropped

Focus on **changed/added code**. Don't audit the entire codebase — only flag pre-existing issues if the diff makes them worse or newly relevant. If a real pre-existing issue turns up outside the diff, call it out separately as a follow-up (worth filing as an issue or a CLAUDE.md note) rather than blocking this PR on it — don't let it live only in the review comment.

When uncertain about intent, phrase as a question ("Was this intentional?" rather than "This is wrong"). Suggest improvements, don't demand rewrites.

## Step 4: Specialized reviews (when applicable)

Launch sub-agents in parallel, only when the diff warrants it:

- **Bundle size** — when the diff adds a dependency, a new entry point, or non-trivial code to a flow; sanity-check against `.sizelimit.json` and whether `npm run size:check` would still pass.
- **Breaking-change scan** — when the diff touches `src/index.tsx`, any flow's `hooks.tsx`/`types.ts`, or `RemoteFlowsProvider.tsx`; confirm additive-only or that a `BREAKING CHANGE:` footer is warranted.
- **Test quality** — when the diff adds/changes tests; check Step 3's test checks against every touched `*.test.tsx`.

Only skip a category when it's clearly irrelevant to the diff.

## Step 5: Output

Number findings 1, 2, 3, ... straight through all sections.

```
**Critical / High** (must fix before merge):
1. [file:line] Issue + suggested fix

**Medium** (should fix or justify):
2. [file:line] Issue

**Low / style** (nice to fix):
3. [file:line] Issue

**Passed** (areas checked, no issues)
```

If the diff is clean, say so briefly. Don't manufacture issues to fill space.

## Step 6: Post inline comments (only with user approval)

Ask: "Want me to post these as inline comments on the PR? Include nitpicks?"

Default to posting Critical and Medium only. Include nitpicks only if the user explicitly says yes.

If yes:

- Anchor added and context lines on the new side; use the old side for deleted lines (`gh pr comment` for general notes, or the GitHub review API via `gh api` for inline comments anchored to a file/line).
- Format comments using [conventional comments](https://conventionalcomments.org/):
  - Critical → `issue (blocking): <subject>` — reserve `(blocking)` for correctness bugs, security issues, and data-loss risks; everything else stays `issue:` or `suggestion (non-blocking):` regardless of severity
  - Medium → `suggestion: <subject>`
  - Low/style → `nitpick: <subject>`
  - Include `praise:` when something is well done.
- Suffix every comment with `[by <AI tool>]` for transparency (e.g. Claude).

Example:

```
issue (blocking): Race condition when both handlers fire concurrently

If `handleSubmit` and `handleCancel` run at the same time, `isSubmitting` state can get out of sync. Consider guarding with an early return if already submitting. [by Claude]
```
