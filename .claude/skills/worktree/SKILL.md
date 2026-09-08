---
name: worktree
description: Create a git worktree for remote-flows with dependencies already installed. Use only when the user explicitly asks to create or set up a worktree, or to review a PR in its own checkout.
allowed-tools: Bash(git fetch:*), Bash(git worktree:*), Bash(npm run worktree:*), Bash(gh pr view:*)
---

# Worktree

Use the repo's `npm run worktree` wrapper so the new worktree gets dependencies
installed (and `example/.env` copied) automatically — don't run raw
`git worktree add` for this.

- For a new branch, use a name supplied by the user or infer a concise
  lowercase kebab-case name from the available task context; ask only when a
  clear name cannot be inferred.
- For a new branch with no requested base or with `main` as its base, run
  `npm run worktree -- --branch <branch>` (defaults to `origin/main`). Stop if
  the fetch inside the script fails.
- When the user requests a non-`main` base, pass it with `--base <ref>`.
- To review a GitHub PR, run `npm run worktree -- --pr <number>` — this
  resolves the PR's head branch via `gh pr view` and checks it out into its
  own worktree. Do not resolve the branch name yourself first.
- For an existing local/remote branch that isn't tied to a PR, use its exact
  name: `npm run worktree -- --branch <branch> --existing`.
- Confirm success and give the user the worktree path plus the two dev
  commands the script prints (`npm run dev` and `cd example && npm run dev`).
- When the user is done with a worktree, remove it with
  `git worktree remove <path>` from the main checkout (not the worktree
  itself), and delete the branch only if asked.
