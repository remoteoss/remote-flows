# Plan: Duplicate Basic Default Components to Example Folder

## Goal

Validate the headless approach with `text`, `textarea`, `select`, `date`, `radio`,
`checkbox`. The example owns complete copies of all UI components. Minimal library
surface change — only context primitives and utilities exported.

---

## Key Constraint — React Context Sharing

`FormField` (library) sets `FormFieldContext`. The example's `FormItem`, `FormControl`,
etc. must read from the **same** React context object or they see empty context and break.

This is the only reason we touch the library: export the context primitives from
`src/index.tsx` so the example's copied `form.tsx` can import and reuse them.

---

## Step 1 — Rename `Components.tsx`

| Action        | File                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Rename        | `example/src/Components.tsx` → `example/src/CostCalculatorComponents.tsx`                        |
| Update import | `CostCalculatorWithReplaceableComponents.tsx`: `'./Components'` → `'./CostCalculatorComponents'` |

---

## Step 2 — Library: minimal additions

### `src/index.tsx` — add

```ts
export {
  FormFieldContext,
  FormItemContext,
  useFormField,
} from '@/src/components/ui/form';
```

### `src/internals.ts` — add

`cn` is already exported. Only add:

```ts
export { sanitizeHtml } from './lib/utils';
```

---

## Step 3 — Copy UI components to `example/src/components/ui/`

Copy from `src/components/ui/`. Replace in every file:

- `@/src/lib/utils` → `@remoteoss/remote-flows/internals` (for `cn`)
- `@/src/components/ui/X` → `./X`

| File              | External packages required                    |
| ----------------- | --------------------------------------------- |
| `label.tsx`       | _(pure HTML, none)_                           |
| `input.tsx`       | _(pure HTML, none)_                           |
| `textarea.tsx`    | _(pure HTML, none)_                           |
| `button.tsx`      | `class-variance-authority`                    |
| `checkbox.tsx`    | `@radix-ui/react-checkbox`, `lucide-react`    |
| `radio-group.tsx` | `@radix-ui/react-radio-group`, `lucide-react` |
| `select.tsx`      | `@radix-ui/react-select`, `lucide-react`      |
| `popover.tsx`     | `@radix-ui/react-popover`                     |
| `calendar.tsx`    | `react-day-picker`, `lucide-react`            |

### `form.tsx` — written from scratch (not a verbatim copy)

Imports the shared context objects from the library so contexts are the same React
reference. Does NOT include `FormField` (stays in library). Does NOT import
`react-hook-form` — consumers should not need to install it.

```ts
import {
  FormFieldContext,
  FormItemContext,
  useFormField,
} from '@remoteoss/remote-flows';
import { cn, sanitizeHtml } from '@remoteoss/remote-flows/internals';
import { Label } from './label';

export { useFormField };
// + FormItem, FormControl, FormLabel, FormDescription, FormMessage
// identical logic to src/components/ui/form.tsx using the imported shared contexts
```

---

## Step 4 — Copy HelpCenter to `example/src/components/shared/`

Copy `src/components/shared/zendesk-drawer/HelpCenter.tsx`. Replace:

- `@/src/types/fields` → `@remoteoss/remote-flows`
- `ZendeskTriggerButton` → `@remoteoss/remote-flows` (already exported from library)

---

## Step 5 — Copy field defaults to `example/src/components/defaults/`

Copy from `src/components/form/fields/default/`. Import mapping for every file:

| Old                                                 | New                                      |
| --------------------------------------------------- | ---------------------------------------- |
| `@/src/components/ui/*`                             | `../ui/*`                                |
| `@/src/lib/utils`                                   | `@remoteoss/remote-flows/internals` (cn) |
| `@/src/types/fields`                                | `@remoteoss/remote-flows`                |
| `@/src/types/remoteFlows`                           | `@remoteoss/remote-flows`                |
| `@/src/components/shared/zendesk-drawer/HelpCenter` | `../shared/HelpCenter`                   |
| `CheckedState` from `@radix-ui/react-checkbox`      | inline as `boolean \| 'indeterminate'`   |

Files to copy:

- `TextFieldDefault.tsx`
- `TextAreaFieldDefault.tsx`
- `SelectFieldDefault.tsx`
- `CheckboxFieldDefault.tsx`
- `RadioGroupFieldDefault.tsx`
- `DatePickerFieldDefault.tsx`

---

## Step 6 — Install packages in `example/package.json`

```json
"@radix-ui/react-checkbox": "^1.3.3",
"@radix-ui/react-radio-group": "^1.3.8",
"@radix-ui/react-select": "^2.2.6",
"@radix-ui/react-popover": "^1.1.15",
"class-variance-authority": "^0.7.1",
"date-fns": "^3.6.0",
"lucide-react": "0.477.0",
"react-day-picker": "^8.10.1"
```

No `clsx`, `tailwind-merge`, `dompurify`, or `react-hook-form` needed —
`cn` and `sanitizeHtml` come from `@remoteoss/remote-flows/internals`.

---

## Step 7 — Create `example/src/DefaultComponents.tsx`

```ts
import { Components } from '@remoteoss/remote-flows';
import { TextFieldDefault } from './components/defaults/TextFieldDefault';
import { TextAreaFieldDefault } from './components/defaults/TextAreaFieldDefault';
import { SelectFieldDefault } from './components/defaults/SelectFieldDefault';
import { CheckboxFieldDefault } from './components/defaults/CheckboxFieldDefault';
import { RadioGroupFieldDefault } from './components/defaults/RadioGroupFieldDefault';
import { DatePickerFieldDefault } from './components/defaults/DatePickerFieldDefault';

export const defaultComponents: Components = {
  text: TextFieldDefault,
  textarea: TextAreaFieldDefault,
  select: SelectFieldDefault,
  checkbox: CheckboxFieldDefault,
  radio: RadioGroupFieldDefault,
  date: DatePickerFieldDefault,
};
```

---

## Final folder structure (new files only)

```
example/src/
  CostCalculatorComponents.tsx        (renamed from Components.tsx)
  DefaultComponents.tsx               (new)
  components/
    ui/
      form.tsx                        (new — uses shared contexts from library)
      label.tsx                       (copied)
      input.tsx                       (copied)
      textarea.tsx                    (copied)
      button.tsx                      (copied)
      checkbox.tsx                    (copied)
      radio-group.tsx                 (copied)
      select.tsx                      (copied)
      popover.tsx                     (copied)
      calendar.tsx                    (copied)
    shared/
      HelpCenter.tsx                  (copied)
    defaults/
      TextFieldDefault.tsx            (copied)
      TextAreaFieldDefault.tsx        (copied)
      SelectFieldDefault.tsx          (copied)
      CheckboxFieldDefault.tsx        (copied)
      RadioGroupFieldDefault.tsx      (copied)
      DatePickerFieldDefault.tsx      (copied)
```

---

## What does NOT change

- All originals in `src/` stay untouched
- `src/internals.ts` gets only `sanitizeHtml` added
- `src/index.tsx` gets only the 3 form context exports added
- Existing example demos are untouched
- Remaining field types (country, multi-select, file, work-schedule, statement, button)
  are deferred to the next iteration
