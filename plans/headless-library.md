# Headless Library Plan

## Goal

Decouple all Radix UI (and other visual) dependencies from the library core, making it fully headless. Consumers bring their own UI components. All current default/example implementations move to an `examples/` folder.

## Current State

### Radix packages in use (11 total)

- `@radix-ui/react-accordion` — `ui/accordion.tsx`
- `@radix-ui/react-checkbox` — `ui/checkbox.tsx`
- `@radix-ui/react-collapsible` — `ui/collapsible.tsx`
- `@radix-ui/react-dialog` — `ui/dialog.tsx`
- `@radix-ui/react-label` — `ui/label.tsx`, `ui/form.tsx`
- `@radix-ui/react-popover` — `ui/popover.tsx`
- `@radix-ui/react-radio-group` — `ui/radio-group.tsx`
- `@radix-ui/react-scroll-area` — `ui/scroll-area.tsx`
- `@radix-ui/react-select` — `ui/select.tsx`
- `@radix-ui/react-slot` — `ui/form.tsx` (`FormControl`)
- `@radix-ui/react-tabs` — `ui/tabs.tsx`

### Visual components embedded in flows/shared (must be made overridable or moved)

- `EstimationResults` — uses `Accordion`
- `SummaryResults` — uses `Accordion`

---

## Phases

### Phase 1 — Simplify `src/components/ui/form.tsx`

Remove the two Radix dependencies while keeping the helper pattern intact.

**Changes:**

- `FormLabel`: replace `@radix-ui/react-label` + `Label` with a plain `<label>` element.
- `FormControl`: replace `@radix-ui/react-slot` `Slot` with a lightweight wrapper that clones the child and merges `id` + `aria-*` props using `React.cloneElement`, keeping accessibility intact.
- Remove imports: `@radix-ui/react-label`, `@radix-ui/react-slot`, `Label`.

`FormField`, `FormItem`, `FormDescription`, `FormMessage` require no changes (no Radix).

---

### Phase 2 — Move all Default components to `examples/`

All files in `src/components/form/fields/default/` are reference implementations that depend on Radix-backed `ui/` components. Move them to `examples/fields/`.

**Files to move:**

```
src/components/form/fields/default/ButtonDefault.tsx
src/components/form/fields/default/CheckboxFieldDefault.tsx
src/components/form/fields/default/CountryFieldDefault.tsx
src/components/form/fields/default/DatePickerFieldDefault.tsx
src/components/form/fields/default/EmailFieldDefault.tsx
src/components/form/fields/default/FieldsetToggleButtonDefault.tsx
src/components/form/fields/default/FileUploadFieldDefault.tsx
src/components/form/fields/default/MultiSelectFieldDefault.tsx
src/components/form/fields/default/NumberFieldDefault.tsx
src/components/form/fields/default/RadioGroupFieldDefault.tsx
src/components/form/fields/default/SelectFieldDefault.tsx
src/components/form/fields/default/StatementDefault.tsx
src/components/form/fields/default/TextAreaFieldDefault.tsx
src/components/form/fields/default/TextFieldDefault.tsx
src/components/form/fields/default/WorkScheduleFieldDefault.tsx
```

Also move shared defaults:

```
src/components/shared/drawer/DrawerDefault.tsx
src/components/shared/zendesk-drawer/ZendeskDrawerDefault.tsx
src/components/shared/pdf-preview/PDFPreviewDefault.tsx
src/components/shared/table/TableFieldDefault.tsx
```

Target structure:

```
examples/
  fields/
    CheckboxFieldDefault.tsx
    TextFieldDefault.tsx
    ... (all field defaults)
  shared/
    DrawerDefault.tsx
    ZendeskDrawerDefault.tsx
    PDFPreviewDefault.tsx
    TableFieldDefault.tsx
  ui/
    accordion.tsx   (moved from src/components/ui/)
    button.tsx
    checkbox.tsx
    ... (all Radix-backed ui primitives)
```

---

### Phase 3 — Remove `src/components/ui/` Radix components from the library

Move all Radix-backed UI primitives to `examples/ui/`. These become reference implementations consumers can copy or replace.

**Files to move to `examples/ui/`:**

```
src/components/ui/accordion.tsx
src/components/ui/badge.tsx
src/components/ui/basic-tooltip.tsx
src/components/ui/button.tsx
src/components/ui/calendar.tsx
src/components/ui/checkbox.tsx
src/components/ui/collapsible.tsx
src/components/ui/command.tsx
src/components/ui/dialog.tsx
src/components/ui/drawer.tsx
src/components/ui/file-uploader.tsx
src/components/ui/label.tsx
src/components/ui/multi-select.tsx
src/components/ui/popover.tsx
src/components/ui/radio-group.tsx
src/components/ui/scroll-area.tsx
src/components/ui/select.tsx
src/components/ui/tabs.tsx
```

**Files that use only native HTML (no Radix) — can stay or move to examples:**

```
src/components/ui/alert.tsx    — pure HTML, no Radix
src/components/ui/card.tsx     — pure HTML, no Radix
src/components/ui/input.tsx    — pure HTML, no Radix
src/components/ui/table.tsx    — pure HTML, no Radix
src/components/ui/textarea.tsx — pure HTML, no Radix
```

These pure-HTML components have no Radix dependency but are still visual. Move them to `examples/ui/` as well so `src/components/ui/` is fully removed from core.

---

### Phase 4 — Make flows with embedded visual components headless

For each flow component that directly renders visual elements (Card, Button, Alert, Accordion), replace the hardcoded component with either:

- **Component override slot** via a `components` prop (preferred for public-facing output components).
- **Native HTML equivalent** where the component is simple enough (e.g., `Button` → `<button>`, `Card` → `<div>`).

#### 4a. `EstimationResults`

Currently accepts a partial `components` prop. Extend it to cover all internal visual dependencies:

```ts
type EstimationResultsComponents = {
  Accordion?: React.ComponentType<...>;
  Tooltip?: React.ComponentType<{ content: React.ReactNode; children: React.ReactNode }>;
  ActionsDropdown?: React.ComponentType<ActionsDropdownProps>;
  HiringSection?: React.ComponentType<...>;     // already exists
  OnboardingTimeline?: React.ComponentType<...>; // already exists
  Header?: React.ComponentType<...>;             // already exists
  Footer?: React.ComponentType;                  // already exists
};
```

The default for each slot is a plain HTML fallback (no Radix).

# <<<<<<< HEAD

#### 4b. `SummaryResults`

Same approach — accept `Card` and `Accordion` overrides. Provide plain HTML defaults.

#### 4d. `Termination/PaidTimeOff`

Replace `Button` import with a `components?.button` override or a plain `<button>`.

#### 4f. `ActionsDropdown`

Replace `Button` from `ui/button` with a native `<button>` element directly. `ActionsDropdown` is already a plain dropdown with no Radix — only the `Button` wrapper is Radix-backed.

> > > > > > > main

---

### Phase 5 — Remove all `@radix-ui/*` from `package.json`

After phases 1–4, verify no file in `src/` imports from `@radix-ui/*`. Then remove all 11 Radix entries from `package.json` dependencies.

Run a final audit:

```bash
grep -r "@radix-ui" src/
```

Expected result: zero matches.

---

## File structure after completion

```
src/
  components/
    form/
      fields/         # field controllers (no Radix — use react-hook-form only)
        CheckBoxField.tsx
        TextField.tsx
        ...
      ui/
        form.tsx      # simplified — no Radix (FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage)
    shared/
      actions-dropdown/
        ActionsDropdown.tsx   # uses native <button>, no Radix
      drawer/
        Drawer.tsx            # headless — delegates to components context
      table/
        Table.tsx
      zendesk-drawer/
        ZendeskDrawer.tsx

examples/
  ui/
    accordion.tsx
    button.tsx
    card.tsx
    checkbox.tsx
    ...
  fields/
    CheckboxFieldDefault.tsx
    TextFieldDefault.tsx
    ...
  shared/
    DrawerDefault.tsx
    ZendeskDrawerDefault.tsx
    TableFieldDefault.tsx
    PDFPreviewDefault.tsx
```

---

## What does NOT change

- react-hook-form is kept — it has no visual opinion and is core to how fields work.
- `FormField` (Controller wrapper) stays in `form.tsx`.
- All hooks, contexts, API client code, and type definitions stay untouched.
- The `components` prop pattern on field controllers stays — consumers still pass their own implementations the same way.
- CSS class names (`RemoteFlows__*`) stay on all components.

---

## Open questions before starting

1. **`form.tsx` `FormControl` replacement**: Use `React.cloneElement` or remove entirely? Since Default components move to examples and those are the only `FormControl` consumers, we could remove `FormControl` from the core export and let examples bring their own version.

2. **`EstimationResults` plain HTML defaults**: When no `Card`/`Accordion` override is given, should the component render plain `<div>` fallbacks (keeping it functional but unstyled), or should it throw (forcing the consumer to provide all slots)? Recommendation: plain `<div>` fallbacks so the component works out-of-the-box without any Radix.

3. **Naming the examples folder**: `examples/` vs `packages/ui/` vs keeping it in the repo as a separate package. TBD with team.
