# Investigation: flood of `jsfModify` `FIELD_TO_CHANGE_NOT_FOUND` warnings for `equity_compensation` during Onboarding

**Reported symptom:**

```json
[
  {
    "type": "FIELD_TO_CHANGE_NOT_FOUND",
    "message": "Changing field \"equity_compensation\" was ignored because it does not exist."
  }
]
```

logged repeatedly (a "flood") in the browser console while going through the Onboarding flow.

**Conclusion up front:** this is not a bug in the sibling `@remoteoss/json-schema-form` /
`@remoteoss/remote-json-schema-form-kit` library — `modify()` is behaving exactly per its
documented contract. There are two separate mechanisms at play, and (per a comparison with
Dragon, Remote's main web app, added below) only one of them is actually a remote-flows-side
gap:

- Applying one global `fields` customization (including `equity_compensation`) to every
  country's schema, regardless of whether that country's schema defines the field, is an
  **established, intentional convention** — Dragon does the exact same thing and explicitly
  accepts the resulting occasional `FIELD_TO_CHANGE_NOT_FOUND` warning as tolerable noise.
  Not a mistake unique to remote-flows.
- What *is* remote-flows-specific is that this warning reruns on almost every render instead
  of once per schema fetch, because of an unmemoized React Query `select`, which is what
  turns an accepted, occasional warning into a flood. See "Comparison with Dragon" below.

## Where the warning comes from

`src/common/createHeadlessForm.tsx` wraps the library's `modify()`:

```ts
const { schema, warnings } = modify(jsfSchema, {
  ...modifyConfig,
  muteLogging: true,
} as Parameters<typeof modify>[1]);
if (warnings && warnings.length > 0) {
  console.warn('jsfModify warnings:', warnings);
}
```

This wrapper intentionally mutes the library's own generic log line and re-surfaces the
actual `warnings` array — that part is deliberate and correct (see the comment above it).
The problem is *why* `modify()` is producing this specific warning in the first place, and
why it repeats so often.

## Bug A — `equity_compensation` is force-added to every country's contract-details schema

`src/flows/Onboarding/hooks.tsx:605-661` builds a `contractDetailsCustomFields` object that
unconditionally includes an `equity_compensation` entry in `jsfModify.fields`, alongside
`annual_gross_salary` and (when the `daily_schedule` feature flag is on) `daily_schedule`:

```ts
const equityCompensationField =
  options?.jsfModify?.contract_details?.fields?.equity_compensation;
...
const contractDetailsCustomFields = useMemo(
  () => ({
    fields: {
      annual_gross_salary: { ... },
      equity_compensation: {
        ...equityCompensationField,
        presentation: { calculateDynamicProperties: ... },
      },
      ...(isDailyScheduleEnabled ? { daily_schedule: { ... } } : {}),
    },
  }),
  [...],
);
```

This object is merged into `jsfModify.contract_details.fields` for **every** country, for
both the default (v0) and JSF-v1 contract-details engines (`hooks.tsx:714-720` and
`hooks.tsx:729-738`).

But not every country's contract-details schema defines an `equity_compensation` property.
Checking the existing JSF-v1 fixtures under `src/flows/Onboarding/tests/fixtures/contractDetails/`:

| Country fixture | has `equity_compensation`? | has `annual_gross_salary`? |
|---|---|---|
| `v1-germany.ts` | yes | yes |
| `v1-portugal.ts` | yes | yes |
| `v1-southKorea.ts` | yes | yes |
| `v1-france.ts` | **no** | yes |
| `v1-italy-apl.ts` | **no** | **no** |

`@remoteoss/json-schema-form`'s `modify()` treats every key under `ModifyConfig.fields` as
a promise that the field exists in the schema being modified — if it doesn't, it emits
`FIELD_TO_CHANGE_NOT_FOUND` (confirmed by reading `node_modules/@remoteoss/json-schema-form/dist/index.d.ts`,
which documents `fields` as a flat `Record<string, FieldModification | fn>` with no
"apply only if present" semantics). There is no supported way to pass a customization that
silently no-ops when the target field is absent — the caller is expected to only reference
fields that exist in the schema it's modifying.

Reproduced directly, outside of React entirely, by calling `modify()` from
`@remoteoss/remote-json-schema-form-kit` with a schema shaped like France/Italy's (no
`equity_compensation` property) and the same `fields.equity_compensation` override used in
`hooks.tsx`:

```
json-schema-form modify(): We highly recommend you to handle/report the returned `warnings`...
[
  {
    "type": "FIELD_TO_CHANGE_NOT_FOUND",
    "message": "Changing field \"equity_compensation\" was ignored because it does not exist."
  }
]
```

— an exact match for the reported warning. Equity compensation is evidently a
market-specific offering (present for DEU/PRT/KOR in the sample fixtures, absent for
FRA/ITA), yet remote-flows applies the customization globally regardless of country.

## Bug B — the customization (and thus the warning) reruns on almost every render for most countries

Only France, Italy and Germany use the "JSF v1" contract-details engine
(`JSF_V1_CONTRACT_DETAILS_COUNTRIES = ['FRA', 'ITA', 'DEU']` in `src/flows/Onboarding/utils.ts`).
Every other country (the majority) goes through the **default engine**, via
`useJSONSchemaForm` in `src/flows/Onboarding/api.ts:191-250`:

```ts
return useQuery({
  queryKey: [...],
  queryFn: async () => { ... },
  select: ({ data }) => {
    const jsfSchema = data?.data || {};
    return createHeadlessForm(jsfSchema, fieldValues, options);
  },
});
```

`select` is a fresh, unmemoized arrow function created on every render, closing over
`fieldValues` and `options` — both of which change on essentially every keystroke while
filling in the form (`fieldValues` is component state fed by `react-hook-form`'s `watch`).

TanStack Query recomputes `select(data)` on every render of the subscribing component when
`select` isn't referentially stable — it has to, in order to derive that render's return
value. This was confirmed directly with a small harness: a `useQuery` with an inline,
unmemoized `select` closing over unrelated local state re-invoked `select` on every
`fireEvent.change`, even though the query's underlying data never changed — while a
`useMemo`-wrapped equivalent did not.

This means for any default-engine country, `createHeadlessForm` → `modify()` reruns (and
re-logs its warnings) on effectively every keystroke, not once per fetch — turning what
would already be an incorrect-but-occasional warning into a flood.

Notably, the codebase already knows the correct pattern: the JSF-v1 path
(`useContractDetailsSchema`, `src/flows/Onboarding/api.ts:252-317`) wraps the equivalent
`createHeadlessForm` call in `useMemo`, keyed on `[options, response?.data]`
(`api.ts:306-311`), and `useJsfV1ContractDetails` (`hooks.tsx:181-190`) memoizes the
`options` object it depends on. The default-engine path just never got the same treatment.

## Comparison with Dragon (Remote's main web app)

Dragon (`apps/employ`) uses the same `@remoteoss/json-schema-form` /
`remote-json-schema-form-kit` stack for its own contract-details form, so it's a useful
reference for whether the "one global `fields` config for every country" pattern (Bug A) is
actually an established, intentional convention rather than a mistake.

`apps/employ/src/domains/shared/employment/employer/contractDetails/jsfModify.jsx` builds a
`commonFieldsModify` object that — just like remote-flows — includes an
`equity_compensation` customization (and `annual_gross_salary`, `hourly_gross_salary`,
`has_bonus`, etc.) applied **unconditionally to every country**, then merges it with
per-country overrides. Structurally identical to what `Onboarding/hooks.tsx` does.

Their `useCreateHeadlessForm.js` wrapper (`maybeModifySchema`) mutes the library's own log
line and re-surfaces the `warnings` array itself, same as remote-flows' wrapper — but with
an explicit comment acknowledging the tradeoff:

```js
/* We could log this to Datadog, but might be too noisy, depending on the warning type.
   For example: 'FIELD_TO_CHANGE_NOT_FOUND': -> This will happen in every country form,
   as we apply global changes. It's noisy... */
console.warn('JSF Modify warnings:', warning.message, warning.type, warning.meta);
```

So **Bug A is confirmed to be an intentional, accepted convention shared across both
codebases** — not a remote-flows-specific misuse. Applying one static field-customization
map to every country's dynamic schema, and accepting the resulting occasional
`FIELD_TO_CHANGE_NOT_FOUND` as tolerable console noise, is the established pattern here.
Dragon's own code even demonstrates the "smarter" alternative exists when it's judged worth
the complexity: `workScheduleFieldForJsonSchemaModify()` explicitly checks
`!!jsonSchema?.properties.daily_schedule` before including that field — they just haven't
applied the same guard to `equity_compensation`/`annual_gross_salary`.

**What Dragon does not have, though, is the flood.** Its `useCreateHeadlessForm` wraps the
modify + `createHeadlessForm` call in `useMemo`, keyed on
`[enabled, formSchema, valuesMemo, shallowMemo]` — so the computation (and any warning it
produces) only reruns when the schema or relevant values actually change, not on every
render. That lines up with Bug B: remote-flows' default-engine `useJSONSchemaForm` is the
odd one out for *not* memoizing this, which is why the same kind of warning that Dragon gets
once per country-schema-load turns into a per-keystroke flood here.

## Summary (revised)

- **Bug A (the warning exists at all for equity_compensation) is not a misuse specific to
  remote-flows** — it mirrors Dragon's own established, intentionally-accepted pattern of
  applying one global field-customization map to every country's schema and tolerating the
  resulting `FIELD_TO_CHANGE_NOT_FOUND` noise. Not something to "fix" without also changing
  the same convention in Dragon; more of a known, accepted cost of the dynamic-form approach.
- **Bug B (the flood) is still a remote-flows-specific gap**, not shared by Dragon. Dragon's
  equivalent computation is memoized; remote-flows' default-engine `useJSONSchemaForm`
  (`src/flows/Onboarding/api.ts:245-248`) is not, so the same kind of warning that Dragon
  logs once per schema load gets re-triggered on almost every keystroke here.

The console noise reported can be meaningfully reduced by fixing Bug B alone (matching the
memoization pattern already used elsewhere in this same file, and in Dragon), without
needing to change the shared "one global fields config" convention. No code changes are
included in this PR — investigation only, per request.
