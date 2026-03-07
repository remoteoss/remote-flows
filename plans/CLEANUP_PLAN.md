# Cleanup Plan: Remove Default Components & Radix Dependencies

Goal: make `components` prop required — consumers must always supply their own components.
This removes all default/lazy UI implementations, the Radix UI wrappers, and other libs only used by them.

---

## 1. Delete `lazy-default-components.ts`

- [ ] `src/lazy-default-components.ts`

**Impact:** `RemoteFlowsProvider.tsx` imports `lazyDefaultComponents` and spreads it into `FormFieldsProvider`. This must be cleaned up (see section 5).

---

## 2. Delete `default-components.ts`

- [ ] `src/default-components.ts`

**Impact:** Exported via `./default-components` entry in `package.json`. Remove that export entry too.

---

## 3. Delete all `default/` field components

All under `src/components/form/fields/default/`:

- [ ] `ButtonDefault.tsx`
- [ ] `CheckboxFieldDefault.tsx`
- [ ] `CountryFieldDefault.tsx`
- [ ] `DatePickerFieldDefault.tsx`
- [ ] `EmailFieldDefault.tsx`
- [ ] `FieldsetToggleButtonDefault.tsx`
- [ ] `FileUploadFieldDefault.tsx`
- [ ] `MultiSelectFieldDefault.tsx`
- [ ] `NumberFieldDefault.tsx`
- [ ] `RadioGroupFieldDefault.tsx`
- [ ] `SelectFieldDefault.tsx`
- [ ] `StatementDefault.tsx`
- [ ] `TextAreaFieldDefault.tsx`
- [ ] `TextFieldDefault.tsx`
- [ ] `WorkScheduleFieldDefault.tsx`

---

## 4. Delete shared default components

- [ ] `src/components/shared/drawer/DrawerDefault.tsx`
- [ ] `src/components/shared/zendesk-drawer/ZendeskDrawerDefault.tsx`
- [ ] `src/components/shared/table/TableFieldDefault.tsx`
- [ ] `src/components/shared/pdf-preview/PDFPreviewDefault.tsx`

---

## 5. Update `RemoteFlowsProvider.tsx`

- [ ] Remove `import { lazyDefaultComponents }` and remove spread `...lazyDefaultComponents`
- [ ] Make `components` prop required in `FormFieldsProvider` (remove `= {}` default)
- [ ] Make `components` prop required in `RemoteFlows` (no optional `?`)
- [ ] Remove `<Suspense>` wrapper (no longer needed without lazy components)
- [ ] Remove imports of `FormLoadingFallback` and `DelayedFallback` if no longer used elsewhere

---

## 6. Delete UI components only used by defaults

These have zero usage outside the default components deleted above:

- [ ] `src/components/ui/checkbox.tsx` — only `CheckboxFieldDefault`
- [ ] `src/components/ui/radio-group.tsx` — only `RadioGroupFieldDefault`
- [ ] `src/components/ui/select.tsx` — only `SelectFieldDefault`
- [ ] `src/components/ui/dialog.tsx` — only `WorkScheduleFieldDefault` + `command.tsx` chain
- [ ] `src/components/ui/popover.tsx` — only `DatePickerFieldDefault` + `multi-select.tsx` chain
- [ ] `src/components/ui/calendar.tsx` — only `DatePickerFieldDefault`
- [ ] `src/components/ui/command.tsx` — only `multi-select.tsx`
- [ ] `src/components/ui/multi-select.tsx` — only `CountryFieldDefault`, `MultiSelectFieldDefault`
- [ ] `src/components/ui/drawer.tsx` — only `DrawerDefault`, `ZendeskDrawerDefault`
- [ ] `src/components/ui/file-uploader.tsx` — only `FileUploadFieldDefault`
- [ ] `src/components/ui/badge.tsx` — only `multi-select.tsx`
- [ ] `src/components/ui/table.tsx` — only `TableFieldDefault`
- [ ] `src/components/ui/input.tsx` — only `TextFieldDefault`
- [ ] `src/components/ui/textarea.tsx` — only `TextAreaFieldDefault`

**UI components to KEEP** (used by non-default flows/components):

- `accordion.tsx` — `SummaryResults`, `EstimationResults`
- `alert.tsx` — `ContractPreviewStatement` (flow)
- `basic-tooltip.tsx` — `EstimationResults`
- `button.tsx` — `ActionsDropdown`, `PaidTimeOff`
- `card.tsx` — `SummaryResults`, `EstimationResults`, `AcknowledgeInformation`
- `form.tsx` — all form fields and flows
- `label.tsx` — `form.tsx`

---

## 7. Remove packages from `package.json`

Only used by deleted UI components / default components:

- [ ] `@radix-ui/react-checkbox` — `checkbox.tsx`
- [ ] `@radix-ui/react-dialog` — `dialog.tsx`
- [ ] `@radix-ui/react-popover` — `popover.tsx`
- [ ] `@radix-ui/react-radio-group` — `radio-group.tsx`
- [ ] `@radix-ui/react-select` — `select.tsx`
- [ ] `vaul` — `drawer.tsx`
- [ ] `cmdk` — `command.tsx`
- [ ] `react-day-picker` — `calendar.tsx`

**Packages to KEEP:**

- `@radix-ui/react-checkbox` — wait, all radix packages are only used by deleted components, all can go
- `react-flagpack` — used in `EstimationResults.tsx` (non-default flow), KEEP
- `@tanstack/react-query`, `react-hook-form`, `yup`, etc. — core, KEEP

---

## 8. Update `package.json` exports

- [ ] Remove `"./default-components"` export entry

---

## 9. Update test helpers

- [ ] `src/tests/defaultComponents.tsx` — imports from `default-components`, delete or rewrite
- [ ] `src/tests/testHelpers.tsx` — spreads `defaultComponents`, update accordingly

---

## 10. Verify

- [ ] `npm run type-check` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] No remaining imports of deleted files (`grep -r "default-components\|lazyDefault\|DefaultComponents"`)
