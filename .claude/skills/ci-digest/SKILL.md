---
name: ci-digest
description: Diagnose failing CI on a remote-flows PR from a compact digest instead of reading raw job logs. Use when the user says a PR's CI failed, asks "why is CI red", "what failed on PR 1234", or before fixing a failing check.
allowed-tools: Bash(npm run ci:digest:*), Bash(gh run rerun:*), Read, Grep
---

# CI digest

Run `npm run ci:digest -- <pr-number>` (omit the number to use the current branch's PR; `--max-lines=N` widens each excerpt).

It lists the failing checks, classifies each one (`format`, `lint`, `type`, `test`, `build`, `flake`, `unknown`), and prints the error lines with a little context plus the next step to take.

- Act on the digest first. Fetch a full log with `gh run view <run-id> --log-failed` only when the excerpt isn't enough.
- `flake` means an infra or rate-limit signature (for example the sandbox 403 block). Rerun the job after about 2 minutes (`gh run rerun <run-id> --failed`) before changing any code.
- Reproduce locally with the narrowest command the digest names, not the full suite. CI is the source of truth for the final check.
