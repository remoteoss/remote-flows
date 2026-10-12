---
name: goal
description: Agree on a written goal before writing any code for a remote-flows feature or fix — target flow, scope, exact copy, out of scope, open questions, and how it will be verified against a real API. Use when the user says "/goal", "let's set a goal", "give me the goal first", "plan this before coding", or asks for a feature/fix whose target flow or behaviour isn't clear yet. Writes no code; saves the approved goal outside the repo for the PR description and later verification.
allowed-tools: Bash(git rev-parse:*), Bash(git branch:*), Bash(git log:*), Bash(gh pr view:*), Bash(gh issue view:*), Bash(mkdir -p ~/.claude/goals/*), Read, Write, Edit
---

# Goal

A goal is the agreed target for one branch: what the user will see when it's
done and how that will be proven. Draft it, get it approved, save it. **Write
no code and create no branch until the user approves it.**

## Step 1: Find the target

- If the request could mean more than one flow — EOR Onboarding vs
  ContractorOnboarding, the prebuilt flow vs the headless hook, Cost Calculator
  vs Onboarding's benefits step — ask which one **before** exploring. Don't
  pick one and start reading.
- Then read the code around it in this repo. When the behaviour mirrors the
  platform, read the Dragon counterpart (`~/remote/dragon`) and the Tiger
  endpoint (`~/remote/tiger`) too. Differences from Dragon go into the goal as
  findings, not silent fixes.
- If there's an existing goal file for the branch (see Storage), load it and
  update it instead of starting over.

## Step 2: Draft the goal, then stop

Show it in chat with exactly these sections:

- **Goal** — one or two sentences of user-visible behaviour, not implementation.
- **Scope** — the files that change and what changes in each. Flag anything
  that touches `src/index.tsx` or what it re-exports: that's public API and
  needs a higher bar (additive, or an explicit breaking change).
- **Copy** — exact user-facing text. Use a table when there are variants
  (states, countries, verdicts).
- **Out of scope** — what someone might expect to be included but isn't.
- **Open questions** — only decisions the user has to make, each with a
  recommendation. Don't list things you can answer from the code.
- **Verification** — see below.

Then stop and wait for approval.

## Step 3: Iterate

When the user changes something, update the goal and show **only the changed
sections**, not the whole thing again. Repeat until they approve ("approved",
"go", "looks good", …).

## Step 4: Save it

Once approved, write the goal file (see Storage) with this frontmatter:

```md
---
status: approved
date: YYYY-MM-DD
branch: <branch>
---
```

From then on the goal file is the source for the PR description (Summary, Why,
What changed, Testing) and for verification. If scope changes mid-build, update
the file and tell the user what changed.

## Verification section

One row per claim the feature makes. Each claim names its **observable
evidence**: an API response, visible text or attribute, and a screenshot name.
"The page loads" or "tests pass" isn't a claim.

```md
## Verification

env: review # root .env.<name>; say why if it isn't the obvious one
seed: npm run seed:onboarding -- --country=USA --env=review
route: ?demo=onboarding-basic&employmentId=<seeded>

| #   | Claim                      | Steps                                                                   | Expected                                                                                     | Screenshot           |
| --- | -------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| 1   | maybe shows info statement | role description: short gibberish (< 5000 chars); onsite No; license No | check returns `needs_review`; text "AI isn't sure if we can hire this role in United States" | maybe-info-statement |

gotchas:

- .env.sandbox's company isn't in job_title_eligibility_check_*_remote_api; use review.
```

- **env** picks the root `.env.<name>`. `review` runs on the deployed demo
  (`verify-sandbox-deployed-app`); `local`, `sandbox`, `staging`, `partners`
  run the local example app (`verify-local-app`). If you can't tell which env
  has the data or feature flags the claim needs, make it an open question —
  don't guess.
- **seed** is the exact command that creates the starting state.
- **gotchas** are things a fresh run would otherwise rediscover: which company
  has which flag, input limits that stop a check from firing, shared sandbox
  endpoints that affect everyone. Add new ones whenever they turn up.

## Storage

`~/.claude/goals/<project>/<branch>.md`, outside the repo, so it never lands in
a PR and survives removing the worktree.

```bash
project=$(basename "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")")
branch=$(git branch --show-current | tr / -)
```

`<project>` is the main checkout's directory name, so all worktrees share it.
If the work hasn't got a branch yet, name it in the goal (lowercase kebab-case
from the task) and use that name for both the file and the worktree.
