# Fix Field Tests: Replace Removed Default Imports with Native Components

## Context

The `default/` components were removed (`remove defaults` commit). All field tests imported from
`@/src/components/form/fields/default/` which no longer exists. Each test needs an inline native
component that satisfies its assertions.

Each field component passes `{ field, fieldData, fieldState }` to the rendered component.
`field.onChange` is already wrapped by the field to call `mockOnChange`.

---

## Group 1 — Drop-in replacements (no test assertion changes)

### CheckBoxField.test.tsx

Remove: `import { CheckboxFieldDefault } from '@/src/components/form/fields/default/CheckboxFieldDefault'`

Add inline:

```tsx
const NativeCheckbox = ({ field, fieldData }) => {
  if (fieldData.multiple && fieldData.options) {
    return (
      <div>
        {fieldData.options.map((opt) => (
          <div key={opt.value}>
            <input
              type='checkbox'
              id={opt.value}
              onChange={(e) => field.onChange(e.target.checked, opt.value)}
            />
            <label htmlFor={opt.value}>{opt.label}</label>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
      <label>{fieldData.label}</label>
      <input
        type='checkbox'
        onChange={(e) => field.onChange(e.target.checked)}
      />
      <p>{fieldData.description}</p>
    </div>
  );
};
```

Use in `beforeEach`: `components: { checkbox: NativeCheckbox }`

---

### TextField.test.tsx

Remove: `import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault'`

Add inline:

```tsx
const NativeTextField = ({ field, fieldData }) => (
  <div>
    <label>{fieldData.label}</label>
    <input
      placeholder={fieldData.label}
      {...field}
      onChange={(e) => field.onChange(e)}
    />
    <p>{fieldData.description}</p>
  </div>
);
```

Use in `beforeEach`: `components: { text: NativeTextField }`

---

### NumberField.test.tsx

Remove both:

- `import { NumberFieldDefault } from '@/src/components/form/fields/default/NumberFieldDefault'`
- `import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault'`

Add the same `NativeTextField` inline (NumberField renders identically to TextField for these tests).

Use in `beforeEach`: `components: { number: NativeTextField, text: NativeTextField }`

---

### TextAreaField.test.tsx

Remove: `import { TextAreaFieldDefault } from '@/src/components/form/fields/default/TextAreaFieldDefault'`

Add inline:

```tsx
const NativeTextArea = ({ field, fieldData }) => (
  <div>
    <label>{fieldData.label}</label>
    <textarea {...field} onChange={(e) => field.onChange(e)} />
    <p>{fieldData.description}</p>
  </div>
);
```

Use in `beforeEach`: `components: { textarea: NativeTextArea }`

---

### RadioGroupField.test.tsx

Remove: `import { RadioGroupFieldDefault } from '@/src/components/form/fields/default/RadioGroupFieldDefault'`

Add inline:

```tsx
const NativeRadioGroup = ({ field, fieldData }) => (
  <div>
    <label>{fieldData.label}</label>
    <p>{fieldData.description}</p>
    {fieldData.options?.map((opt) => (
      <div key={opt.value}>
        <input
          type='radio'
          id={opt.value}
          disabled={opt.disabled}
          onChange={() => field.onChange(opt.value)}
        />
        <label htmlFor={opt.value}>{opt.label}</label>
      </div>
    ))}
  </div>
);
```

Use in `beforeEach`: `components: { radio: NativeRadioGroup }`

---

### FieldSetField.test.tsx

Remove both:

- `import { FieldsetToggleButtonDefault } from '@/src/components/form/fields/default/FieldsetToggleButtonDefault'`
- `import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault'`

Add inline:

```tsx
const NativeFieldsetToggle = ({ isExpanded, onToggle, children, ...props }) => (
  <button onClick={onToggle} {...props}>
    {children}
  </button>
);

const NativeTextField = ({ field, fieldData }) => (
  <div>
    <label>{fieldData.label}</label>
    <input {...field} onChange={(e) => field.onChange(e)} />
  </div>
);
```

Use in `beforeEach`: `components: { fieldsetToggle: NativeFieldsetToggle, text: NativeTextField }`

---

## Group 2 — Replacements requiring test updates

### SelectField.test.tsx

Remove: `import { SelectFieldDefault } from '@/src/components/form/fields/default/SelectFieldDefault'`

Add inline:

```tsx
const NativeSelect = ({ field, fieldData }) => (
  <div>
    <label htmlFor={fieldData.name}>{fieldData.label}</label>
    <select
      id={fieldData.name}
      {...field}
      onChange={(e) => field.onChange(e.target.value)}
    >
      {fieldData.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <p>{fieldData.description}</p>
  </div>
);
```

> Native `<select>` has implicit ARIA role `combobox` (single, no `multiple`, no `size > 1`),
> so `getByRole('combobox')` continues to work. Options are always in the DOM so
> `getByText('Option 1')` works without clicking.

**Test changes required** — replace the click-based interaction pattern:

```tsx
// Before (shadcn combobox pattern)
fireEvent.click(select);
const option = screen.getByText('Option 1');
fireEvent.click(option);

// After (native select pattern)
fireEvent.change(select, { target: { value: 'option1' } });
```

Affected tests:

- `'handles selection change correctly'`
- `'converts value to number when jsonType is "number" in default implementation'`
- `'keeps value as string when jsonType is "string" in default implementation'`

---

### FileUploadField.test.tsx

Remove: `import { FileUploadFieldDefault } from '@/src/components/form/fields/default/FileUploadFieldDefault'`

Add inline:

```tsx
const NativeFileUpload = ({ field, fieldData }) => (
  <div>
    <label>{fieldData.label}</label>
    <button type='button'>Upload</button>
    <input
      type='file'
      aria-label='File upload'
      onChange={(e) => field.onChange(e)}
    />
    <p>{fieldData.description}</p>
  </div>
);
```

> `getByRole('button')` matches the Upload button. `getByLabelText('File upload')` matches the
> file input. File size validation lives in `FileUploadField` itself so those tests still pass.

No test assertion changes required.

---

### DatePickerField.test.tsx

Remove: `import { DatePickerFieldDefault } from '@/src/components/form/fields/default/DatePickerFieldDefault'`

Add inline:

```tsx
const NativeDatePicker = ({ field, fieldData }) => (
  <div>
    <label>{fieldData.label}</label>
    <input
      type='date'
      aria-label={fieldData.label}
      {...field}
      onChange={(e) => field.onChange(new Date(e.target.value))}
    />
    <p>{fieldData.description}</p>
  </div>
);
```

**Test changes required** — the calendar-click pattern cannot work with a native date input:

```tsx
// Before (calendar picker pattern)
const button = screen.getByRole('button');
fireEvent.click(button);
const dateCell = screen.getByText('15');
fireEvent.click(dateCell);

// After (native input pattern)
const input = screen.getByLabelText('Test Field');
fireEvent.change(input, { target: { value: '2024-01-15' } });
```

Affected tests:

- `'renders the default implementation correctly'` — change `getByRole('button')` to `getByRole('textbox')` or use `getByLabelText`
- `'handles date selection correctly'` — replace calendar click with `fireEvent.change`

---

### CurrencyConversionField.test.tsx

This test uses `FormFieldsProvider` directly (not a mock), so it exercises the real render path.

Remove both:

- `import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault'`
- `import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault'`

Add inline:

```tsx
const NativeTextField = ({ field, fieldData }) => (
  <div>
    <label htmlFor={fieldData.name}>{fieldData.label}</label>
    <input
      id={fieldData.name}
      {...field}
      onChange={(e) => field.onChange(e.target.value)}
    />
  </div>
);

const NativeButton = ({ children, onClick, ...props }) => (
  <button onClick={onClick} {...props}>
    {children}
  </button>
);
```

Pass directly to `FormFieldsProvider`:

```tsx
<FormFieldsProvider components={{ text: NativeTextField, button: NativeButton }}>
```

> `getByLabelText('Test Salary')` requires the `htmlFor`/`id` linkage.

No test assertion changes required.

---

## Group 3 — Complex cases requiring more work

### CountryField.test.tsx

Remove: `import { CountryFieldDefault } from '@/src/components/form/fields/default/CountryFieldDefault'`

Tests expect:

- `getByRole('combobox')` — a select/combobox
- Clicking shows grouped regions: 'North America', 'Northern America', 'United States', 'Canada'
- `getByRole('option', { name: 'United States' })` — option elements
- Remove buttons: `getByRole('button', { name: /remove United States/i })`

This requires a stateful component with open/close, grouped options, and selection badges.
Recommend a minimal implementation that satisfies the assertions, or rewriting the region/subregion
tests to test `CountryField`'s data transformation logic separately.

---

### MultiSelectField.test.tsx

Remove: `import { MultiSelectFieldDefault } from '@/src/components/form/fields/default/MultiSelectFieldDefault'`

Tests expect:

- `getByRole('combobox')` — trigger button
- After clicking: `getByRole('option', { name: 'Option 1' })` — listbox options
- Selected badges with `getByLabelText('remove Option 1')` remove buttons
- "No item found." message for empty options
- CSS class `RemoteFlows__SelectField__Item__testField` on the form item wrapper

This is the most complex native replacement. Requires a stateful combobox with listbox semantics.
The class name assertion (`RemoteFlows__SelectField__Item__testField`) may be in `MultiSelectField`
itself rather than the default — check before assuming it needs to be in the native component.

---

### WorkScheduleField.test.tsx

Remove all three:

- `import { WorkScheduleFieldDefault } from '...'`
- `import { CheckboxFieldDefault } from '...'`
- `import { TextFieldDefault } from '...'`

Tests expect a rich UI: "Work hours" summary, "Edit Schedule" button, a dialog with
"Edit employee working hours", day-of-week checkboxes (Mon–Sun), time inputs, "Save Schedule"
button, and live total hours calculation.

This is essentially the full `WorkScheduleFieldDefault` UI. Options:

1. Move these tests to an integration/e2e test that provides real components
2. Create a minimal native work-schedule component that replicates the same structure and logic
3. Keep `WorkScheduleFieldDefault` (don't delete it) and only remove the others

---

## Implementation order

1. Group 1 — all simple, do together: CheckBox, Text, Number, TextArea, Radio, FieldSet
2. FileUploadField — simple native component
3. CurrencyConversionField — simple native components
4. SelectField — simple native + 3 test updates
5. DatePickerField — simple native + 2 test updates
6. CountryField — needs design decision on how complex the native component should be
7. MultiSelectField — needs design decision
8. WorkScheduleField — needs design decision (keep default or full rewrite)
