# Agent config: one source of truth

## Goal

Rules, skills and review guidance for coding agents live once, in tool-neutral locations. `AGENTS.md` is the single instruction file. Tool-specific folders hold only what is genuinely tool-specific. Cursor is no longer used, so `.cursor/` is retired, except `.cursor/BUGBOT.md`, which Cursor Bugbot reads at that exact path until it is switched off in March.

## What the docs say

| Topic       | Guidance                                                                                                                                                                                                                     | Consequence here                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Entry file  | Claude Code 2.1.277+ reads `AGENTS.md` natively, but only when no `CLAUDE.md` or `CLAUDE.local.md` exists in or above the working directory. The recommended way to share one file is a `CLAUDE.md` containing `@AGENTS.md`. | `CLAUDE.md` is a one-line import. A symlink would break Windows checkouts of this public repo. |
| Rules       | `.claude/rules/*.md` with `paths:` frontmatter load only when Claude touches a matching file. Rules without `paths` load at startup. Symlinks are supported.                                                                 | Rules are `.agents/rules/*.md`, and `.claude/rules` links to them.                             |
| Size        | Under 200 lines per `CLAUDE.md`. Imports organise a file but do not reduce its context cost.                                                                                                                                 | Long guidance moves into path-scoped rules.                                                    |
| Skills      | Discovered only in `.claude/skills/`. Symlinked skill directories are supported.                                                                                                                                             | `.agents/skills/<name>` is the source and `.claude/skills/<name>` links to it.                 |
| Enforcement | `CLAUDE.md` is context, not enforced configuration. Hooks enforce.                                                                                                                                                           | Hard rules live in lint, CI and `.claude/settings.json`.                                       |
| Bugbot      | Reads `.cursor/BUGBOT.md`. Each `.md` file linked from it counts as its own rule (30,000 characters each, 100,000 combined). `.cursor/rules` does not apply to it.                                                           | `BUGBOT.md` stays a real file and links into the SSOT.                                         |

## Target layout

```text
AGENTS.md                    under 200 lines, shared by every tool
CLAUDE.md                    "@AGENTS.md" plus Claude-only lines
CLAUDE.local.md              unchanged, gitignored
.mcp.json                    single copy
.agents/
  rules/*.md                 paths: frontmatter for file-specific rules
  skills/<name>/             source of every tracked skill
.claude/
  rules   -> ../.agents/rules
  skills/<name> -> ../../.agents/skills/<name>   one link per skill
  settings.json              hooks and deny list for hard rules
.cursor/                     until March only
  BUGBOT.md                  short real file linking to AGENTS.md and .agents/rules
```

Skills are linked one by one, not as a whole directory, so local-only skills and agents that are not tracked can keep living in `.claude/skills/` and `.claude/agents/`.

## Stacked PRs

Each PR is based on the previous one and leaves the repo working. A final PR from the tip of the stack to `main` shows every change in one diff and is for review only.

| PR    | Branch                                | Content                                                                                                                      |
| ----- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1     | `chore/agent-config-1-move-content`   | Move rules and tracked skills into `.agents/`, link them back, `AGENTS.md` plus a `CLAUDE.md` import, update path references |
| 2     | `chore/agent-config-2-slim-agents-md` | Convert rules to `.md` with `paths:`, slim `AGENTS.md` under 200 lines, link `.claude/rules`                                 |
| 3     | `chore/agent-config-3-bugbot-links`   | `BUGBOT.md` links into the SSOT, `pr-review` reads `AGENTS.md` and `.agents/rules`                                           |
| 4     | `chore/agent-config-4-hooks`          | Format hook in `.claude/settings.json`, delete Cursor hooks                                                                  |
| all   | `chore/agent-config-all`              | Tip of the stack against `main`, review only                                                                                 |
| March | not opened yet                        | Switch Bugbot off and delete `.cursor/`                                                                                      |

PR 3 only takes effect for Bugbot once it is merged to the default branch, so it has to be merged on its own before its links can be tested.

## Verifying each PR

Baseline before PR 1: the `/skills`, `/agents` and `/mcp` lists, the Memory files and token figures from `/context`, and five canary prompts with today's answers (new schema form, `mutateAsyncOrThrow` errors, React Query hook, a test that waits for async UI, a code comment).

| PR    | Check                                                                                    | Passes when                                                                  |
| ----- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1     | `ls -la .claude/skills` and open a skill through its link                                | Every link resolves                                                          |
| 1     | `/skills` in a fresh session                                                             | Same list as the baseline                                                    |
| 1     | `/context`                                                                               | `CLAUDE.md` is under Memory files and carries the `AGENTS.md` content        |
| 1     | `git grep -nE "\.cursor/rules\|\.claude/skills"`                                         | Only intended hits remain                                                    |
| 1     | A throwaway `pnpm run worktree`                                                          | The new worktree has the links and `settings.local.json`                     |
| 2     | One rule with `paths:` and a leftover `globs:`, read a matching then a non-matching file | Loaded only after the matching read, no error                                |
| 2     | `wc -l AGENTS.md` and `/context` against the baseline                                    | Under 200 lines, fewer startup tokens                                        |
| 2     | Canary prompts again                                                                     | Same rules followed as in the baseline                                       |
| 3     | After merge, `bugbot run verbose=true` on a later PR                                     | Every linked file is listed, none truncated or omitted                       |
| 3     | A draft PR that breaks a rule found only in a linked file                                | Bugbot comments on it                                                        |
| 3     | If the links do not load                                                                 | Revert to the old body and freeze `BUGBOT.md`                                |
| 4     | Edit a badly formatted file through Claude                                               | Only that file is reformatted, and a missing `oxfmt` does not block the edit |
| 4     | `git grep -nE "cursor/hooks\|environment.json"` and CI                                   | No hits, green                                                               |
| March | A trivial PR after switching Bugbot off                                                  | No Bugbot comment, and `git ls-files .cursor` is empty                       |

## Rollback

Every PR reverts on its own.
