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
`@remoteoss/remote-json-schema-form-kit` library. `modify()` is behaving exactly per its
documented contract. The warning is a correct signal that remote-flows is misusing the
library in two compounding ways, both isolated to the Onboarding flow's contract-details
schema customization.

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

## Summary

Two independent, compounding issues on the remote-flows side (not in the sibling
`json-schema-form` library):

1. **`equity_compensation` (and to a lesser extent `annual_gross_salary`/`daily_schedule`)
   is injected into `jsfModify.contract_details.fields` unconditionally, for every country,
   instead of only for countries whose schema actually defines that field.** This is what
   makes the warning fire at all for markets like France/Italy that don't offer equity
   compensation.
2. **`useJSONSchemaForm`'s `select` (the default contract-details/basic-information engine)
   is not memoized**, unlike its JSF-v1 sibling `useContractDetailsSchema`. This is what
   turns a single misconfiguration warning into a flood — it reruns on nearly every render
   while the user is typing.

Fixing (1) alone would remove the warning; fixing (2) alone would reduce the flood to one
warning per fetch but wouldn't remove the underlying incorrect config. Both would need to
change to fully resolve this cleanly. No code changes are included in this PR — investigation
only, per request.
