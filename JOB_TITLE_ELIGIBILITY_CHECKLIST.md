# Job Title Eligibility — production-readiness checklist

Context: PR #1395 (`feat(onboarding): job title eligibility check`) is a working prototype.
This tracks what's needed to take it to production, to be built incrementally as
separate, small PRs/issues rather than one big change.

Background docs worth re-reading before picking an item up:

- PR #1395 description (verdict table, known backend dependency)
- Tiger: `run_additional_check.ex` — the check is a **synchronous, LLM-backed call**,
  ~20s worst case combined across two AI stages. Never let it block the submit
  critical path with a fresh network call.
- Dragon (`apps/employ/.../jobTitleEligibility/`) — the parity reference. Notably:
  Dragon **removed** its risk-acknowledgement UI for `eligible_with_risk_acknowledgement`
  (commits `bf83ed945fc` / `8f3c9158ab9`) and now treats it like `eligible`. Dragon
  gates the **Invite** button on `employment.status !== 'job_title_review'`
  (`SendInvitation.jsx`), it does not block the wizard itself for `needs_review`.

---

## Immediate fixes (small, standalone, no dependencies)

- [ ] **Block Invite when `employment.status === 'job_title_review'`.**
      Add `job_title_review` to `disabledInviteButtonEmploymentStatus` in
      `src/flows/Onboarding/utils.ts`. Confirmed gap: the status exists in our own
      generated `EmploymentStatus` type but isn't in the blocking list, unlike Dragon's
      explicit `canInvite` gate.

- [ ] **`jsfModify` recipe for `not_eligible`.**
      Document (README + example app) how a partner injects an ineligible-role message
      via `jsfModify`'s `calculateDynamicProperties` → `statement { severity: 'error' }`,
      mirroring Dragon's pattern. Removes the "partner schema has no copy for this"
      limitation without needing a backend change.

- [ ] **Confirm with product: is `employer_acknowledges_risk` still wanted?**
      Dragon deleted its equivalent UI/requirement for the `RISKY`/`yes_with_ack` verdict
      and now treats it silently like `eligible`. Our code still requires and blocks on
      the ack. Get an explicit decision before calling this behavior "done" — don't
      silently diverge or silently match, document the call.

## Creating an employment from scratch

- [ ] Test: eligibility endpoint is called once role fields are complete, with the
      correct params, and the slug lands in the submitted `contract_details`.

- [ ] **Fix the overlapping-request race.** `check()` (the blur handler) is
      fire-and-forget; `setParams` (which flips `isFetching` → disables Submit) only
      lands after two `await`s (`handleValidation`, `parseFormValues`). There's a real
      window where a check has started but Submit isn't disabled yet, and where
      `checkForSubmit` can compute different params than the last blur check
      (different `formErrors` handling) and trigger a redundant fresh ~20s call.
      Fix: make "a check is pending for the current values" synchronous, and unify
      param computation between `check()` and `checkForSubmit`.

- [ ] Test: Submit stays disabled for the full duration of an in-flight job-title
      check. (Write this _after_ the race fix above, or it'll be flaky and won't catch
      the real bug.)

- [ ] Test: changing a role field cancels/supersedes the previous in-flight request
      (query key changes → old query aborted) — assert on the abort itself, not just
      the final settled state.

## Updating an existing employment

- [ ] Verify + test: resuming an employment with `contract_details` values already
      filled fires an eligibility check on entering the step, not just on manual edits.

- [ ] Test: going back to Basic Information, changing the job title, then returning
      to Contract Details produces a **fresh** check. The per-visit counter
      (`startNewVisit`) should already handle this — this needs an explicit regression
      test, since it's the kind of thing that silently breaks later.

## Backend-state coverage

- [ ] **MSW handler set covering every backend verdict** — `eligible` (with and
      without `check_id`), `not_eligible`, `needs_review`,
      `eligible_with_risk_acknowledgement`, error/timeout — as reusable fixtures rather
      than assertions buried in one test file.

- [ ] Split the existing 749-line table-driven test
      (`useOnboardingJobTitleEligibility.test.tsx`) into per-verdict/per-concern files,
      built on the fixtures above.

## End-to-end scenario doc

- [ ] **Write the full blocker matrix**: for each verdict, at each stage (contract
      details submit → employment status → invite), what blocks and what doesn't.
      The PR body already has half of this (the verdict table) — extend it to include
      the invite-gating behavior and use it as the acceptance criteria for the items
      above, rather than writing it up after the fact.

## Other hardening

- [ ] Silent failure in the blur-triggered check (`.catch(() => undefined)` in
      `check()`) — no visibility if it keeps failing. At minimum log/report it.

- [ ] Stale `fallbackJobTitle` on resume without a same-session `basic_information`
      submit — needs an explicit decision + test, not just the current code comment.

- [ ] Track the partner-schema backend blocker as its own linked issue:
      `remote_api` doesn't declare `additional_job_title_eligibility_check_result` yet,
      so risk-ack can't reach real partners regardless of anything on our side.

- [ ] Document the ~20s worst-case AI latency as a hard constraint in code/README,
      so a future change doesn't reintroduce a blocking submit-time call.
