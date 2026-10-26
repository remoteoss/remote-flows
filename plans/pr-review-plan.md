# A stronger PR review skill

Plan only. Nothing here is built yet.

## Goal

Make `/pr-review` cheaper on safe changes and stricter on risky ones, and add a security pass that fits a public npm package. Cursor Bugbot is switched off in March, so the skill should also stand on its own.

## Where the skill is today

- One file. It applies the same effort to a one-line rename and to a public API change.
- It names three specialised passes (bundle size, breaking-change scan, test quality) but defines none of them.
- Security is three generic bullets that no step enforces.
- It does not read existing PR threads or Bugbot comments, so it can repeat what is already there.
- The mechanical checks (`console.log`, `createHeadlessForm` imports, `vi.mock('@/src/client')`, test timeouts) are prose, so a model has to remember them.

Review setups elsewhere at Remote add a no-model preflight with risk tiers, written specialised passes, and an adversarial second opinion for high-risk changes. These are the ideas worth borrowing.

## What is different about this repo

remote-flows is a public npm package that runs in partners' browsers, in a public GitHub repo. The risk is in different places from a server app. Counts are from `main` on 2026-10-23.

| Surface                  | What is there                                                                                                                                          | What a reviewer should check                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Raw HTML                 | 8 non-test files use `dangerouslySetInnerHTML`; `sanitizeHtml()` is called directly in 4 of them. The rest may sanitise upstream, which is not traced. | Every new sink goes through `sanitizeHtml` or a documented upstream sanitiser.                           |
| Code execution           | No `eval` or `new Function` outside the generated client.                                                                                              | Any new one is a finding.                                                                                |
| Auth token               | `src/auth/createClient.ts` builds the client once from the partner's `auth` function.                                                                  | Tokens are never logged, put in URLs or storage, or sent to another origin.                              |
| Employee data            | Forms handle personal and payroll fields, and errors reach an error boundary and reporting.                                                            | No field values in logs, error reports or thrown messages.                                               |
| Browser APIs             | A handful of non-test mentions of `window.open`, `postMessage` or storage, mostly in README text.                                                      | New `postMessage` needs an origin check, new storage needs a reason.                                     |
| Supply chain             | Renovate waits 7 days for new releases and ignores install scripts.                                                                                    | New dependency, lockfile change without a manifest change, added install script, loosened Renovate rule. |
| Workflows and publishing | 12 workflows including release and npm publish. `zizmor` already audits them.                                                                          | Triggers, permissions, secret use and untrusted input in `run:` steps. Defer to `zizmor` output.         |
| Example server           | `example/api/` has a token endpoint and a proxy that partners copy from.                                                                               | Credentials stay server-side and the sample teaches no unsafe pattern.                                   |
| Public-repo hygiene      | Nothing checks PR text or diffs for internal names, URLs, vault paths or tokens.                                                                       | None of those appear in the diff, PR title, body or commits.                                             |

## Proposal

Three tiers, cheapest first. Each stands alone.

### Tier 1: a cheap, deterministic base

1. A preflight script that runs before any model. It reads the saved diff and writes flags: public API touched, raw-HTML sink added, dependency or lockfile change, workflow change, example-server change, agent-config change, generated client edited, tests only, docs only. It also carries the mechanical checks listed above.
2. Tiers driven by those flags. Docs-only and clean small changes get a quick pass with no subagents. Touching the public API, a raw-HTML sink, dependencies or workflows forces the full review whatever the size.
3. Write the three named passes as short prompts, and track the `test-reviewer` agent in the repo.
4. Read existing PR threads and Bugbot comments first.
5. A public-repo hygiene check on the diff, PR title, body and commits. The pattern list must not name internal systems, because it would be public too. It matches generic shapes such as vault paths, internal hostnames and token formats, and any specific names stay in a local file.

### Tier 2: a conditional security reviewer

One subagent, launched only when the preflight sets a security flag: HTML sink, auth or client change, supply chain, workflows, example server, scripts that use credentials, or a hygiene hit. Findings are only on added lines, anything older is capped at Low, and each needs a `file:line` and the specific data flow. What it cannot trace is marked "unverified". The cheapest start is to wrap Claude Code's built-in `security-review` with the repo-specific checks as the brief.

### Tier 3: heavier options, only if the first two prove too thin

- An accessibility pass for changes to the default UI components, since the SDK ships them to partners.
- A performance and bundle pass for new dependencies or heavier flows. `size:check` already enforces the hard limits in CI.
- An adversarial chain (reviewer, a critic on a different model, a scorer, a report writer) for public API breaks and security-flagged changes only.
- A review run in CI after Bugbot is switched off. It needs an API key as a repository secret, must not run on pull requests from forks, and should use the plain `pull_request` trigger, never `pull_request_target`. `zizmor` would check the workflow.

## Rollout

Two stacked PRs after the agent-config stack merges: Tier 1, then Tier 2. Before merging each, dry-run the skill on past PRs of each kind (docs only, public API change, dependency bump, workflow change) and compare the tier it picks with what a human would pick. Record cost per tier from those runs.

## Open decisions

- [ ] Start Tier 1 right after the agent-config stack merges, or wait until Bugbot is gone?
- [ ] Wrap the built-in `security-review`, or write a dedicated reviewer?
- [ ] After March: no automatic review (reviews stay a local step), or a CI job?
- [ ] Include the adversarial chain for public API and security-flagged changes?
- [ ] Should `AGENTS.md` say that agents run `/pr-review` before opening a PR?
- [ ] Where does the list of internal names for the hygiene check live?
