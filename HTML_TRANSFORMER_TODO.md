# HTML Component Transformer - Remaining Tasks

## ✅ Completed

- ✅ All core implementation done
- ✅ Types properly defined and exported
- ✅ All tests passing (737/737)
- ✅ Type checking passes
- ✅ Linting passes
- ✅ TelField types fixed and properly structured
- ✅ Test mocks updated with `useTransformer`

---

## 📝 What's Left

### 1. Create Usage Example (USER TASK)

**Priority: HIGH**  
**Estimated effort: 30-60 minutes**

Create an example in `example/src/Onboarding.tsx` demonstrating the Accordion transformation.

#### Steps:

1. **Install dependencies** (if not already installed):

```bash
npm install html-react-parser dompurify
npm install -D @types/dompurify
```

2. **Create an Accordion component** (example/src/components/Accordion.tsx):

```typescript
import React, { useState } from 'react';

export const Accordion = ({
  summary,
  children
}: {
  summary: React.ReactNode;
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="accordion border rounded-lg p-4 mb-4"
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary className="cursor-pointer font-semibold text-blue-600 hover:text-blue-800">
        {summary}
      </summary>
      <div className="mt-2 pl-4 border-l-2 border-blue-200">
        {children}
      </div>
    </details>
  );
};
```

3. **Create the transformer function** (example/src/utils/transformHtml.tsx):

```typescript
import parse, { domToReact, HTMLReactParserOptions, Element } from 'html-react-parser';
import DOMPurify from 'dompurify';
import { Accordion } from '../components/Accordion';

export const transformHtmlToComponents = (htmlContent: string) => {
  // 1. Sanitize HTML first (IMPORTANT for security)
  const clean = DOMPurify.sanitize(htmlContent);

  // 2. Define transformation options
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Check if it's an element node
      if (domNode.type === 'tag' && domNode.name === 'details') {
        const element = domNode as Element;
        const dataComponent = element.attribs?.['data-component'];

        // Transform <details data-component="Accordion"> to custom Accordion
        if (dataComponent === 'Accordion') {
          // Find the <summary> tag
          const summaryNode = element.children?.find(
            (child: any) => child.type === 'tag' && child.name === 'summary'
          );

          // Extract summary content
          const summary = summaryNode
            ? domToReact((summaryNode as Element).children, options)
            : 'Details';

          // Get all other content (not the summary)
          const content = element.children?.filter(
            (child: any) => !(child.type === 'tag' && child.name === 'summary')
          );

          return (
            <Accordion summary={summary}>
              {domToReact(content || [], options)}
            </Accordion>
          );
        }
      }
    },
  };

  // 3. Parse and transform
  return parse(clean, options);
};
```

4. **Update Onboarding.tsx to use the transformer**:

```typescript
import { transformHtmlToComponents } from './utils/transformHtml';

// In your component:
<RemoteFlows
  auth={fetchToken}
  theme={theme}
  transformHtmlToComponents={transformHtmlToComponents}
  // ... other props
>
  <OnboardingFlow {...props} />
</RemoteFlows>
```

5. **Test it**:

```bash
npm run dev
# Navigate to onboarding flow
# Look for fields with descriptions containing Accordion HTML
```

#### Expected HTML format from API:

```html
<details data-component="Accordion">
  <summary>Important information about probation periods in Germany</summary>
  <p>
    In Germany, post-probation terminations are very difficult and require a
    valid reason...
  </p>
</details>
```

---

### 2. Documentation (Optional but Recommended)

**Priority: MEDIUM**  
**Estimated effort: 1-2 hours**

Add documentation to help other developers use this feature.

#### Files to update:

1. **README.md** - Add a new section:

````markdown
## HTML Component Transformation

Transform HTML in field descriptions into custom React components.

### Basic Usage

```typescript
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

const transformHtmlToComponents = (htmlContent: string) => {
  const clean = DOMPurify.sanitize(htmlContent);
  return parse(clean, {
    replace: (domNode) => {
      // Your transformation logic
    },
  });
};

<RemoteFlows
  transformHtmlToComponents={transformHtmlToComponents}
  // ... other props
>
  {/* Your flows */}
</RemoteFlows>
```
````

### Security Note

⚠️ **The transformer receives RAW UNSANITIZED HTML**. You are responsible for sanitizing untrusted HTML before parsing. We recommend using [DOMPurify](https://www.npmjs.com/package/dompurify).

### Using in Custom Components

Custom field components can access the transformer via `fieldData.transformHtml`:

```typescript
const CustomInput = ({ fieldData }: FieldComponentProps) => {
  const renderDescription = (desc: string) => {
    if (fieldData.transformHtml) {
      return fieldData.transformHtml(desc);
    }
    return <div dangerouslySetInnerHTML={{ __html: desc }} />;
  };

  return (
    <div>
      <input />
      {fieldData.description && renderDescription(fieldData.description)}
    </div>
  );
};
```

````

2. **CHANGELOG.md** - Add to the unreleased section:
```markdown
### Added
- HTML component transformation feature via `transformHtmlToComponents` prop
  - Partners can now replace HTML patterns in field descriptions with custom React components
  - Useful for converting `<details data-component="Accordion">` to custom Accordion components
  - Available in both default and custom field components via `fieldData.transformHtml`
  - Fully backward compatible - no transformer = existing sanitized HTML behavior

### Changed
- Updated `FieldDataProps` to include optional `transformHtml` property
- Updated `TelFieldComponentProps` and `TelFieldDataProps` to follow proper export pattern
````

---

### 3. Future Enhancements (Not Required Now)

**Priority: LOW**

Ideas for future iterations:

- [ ] Add transformer for ZendeskDrawer components
- [ ] Create a library of common transformers (Accordion, Tabs, etc.)
- [ ] Add transformer performance monitoring
- [ ] Create Storybook examples
- [ ] Add E2E tests for transformed components

---

## Testing the Implementation

### Verify everything works:

```bash
# 1. All tests pass
npm test

# 2. Type checking passes
npm run type-check

# 3. Linting passes
npm run lint

# 4. Format check
npm run format

# 5. Build succeeds
npm run build

# 6. Example app runs
npm run dev
```

### Manual testing checklist:

- [ ] Navigate to onboarding flow in example app
- [ ] Find a field with Accordion HTML in description
- [ ] Verify Accordion renders and is interactive
- [ ] Verify fallback works (no transformer = sanitized HTML)
- [ ] Verify custom field components can access `fieldData.transformHtml`

---

## Files Modified in This Implementation

### Core Implementation:

- `src/types/remoteFlows.ts` - Added `transformHtmlToComponents` prop
- `src/context.ts` - Added `useTransformer` hook
- `src/RemoteFlowsProvider.tsx` - Wired up transformer to context
- `src/components/ui/form.tsx` - Updated FormDescription to use transformer
- `src/components/form/fields/FieldSetField.tsx` - Updated to use transformer
- `src/lib/transformDescription.tsx` - Internal helper (not exported)
- `src/types/fields.ts` - Added `transformHtml` to FieldDataProps, fixed TelField types
- `src/index.tsx` - Exported `TelFieldComponentProps`

### Field Components Updated (all inject `transformHtml` into fieldData):

- TextField, TextAreaField, SelectField, RadioGroupField, CheckBoxField
- NumberField, EmailField, MultiSelectField, DatePickerField
- CountryField, FileUploadField, TelField, WorkScheduleField

### Tests Updated:

- All 24 test files with context mocks updated to include `useTransformer`
- New test file: `src/components/ui/tests/form.test.tsx` (merged transformer tests)

---

## Key Architecture Decisions

1. **Transformer receives raw HTML** - Partners responsible for sanitization
2. **Available in default AND custom components** - Via FormDescription and fieldData.transformHtml
3. **Internal helper not exported** - Partners implement their own (full control)
4. **Backward compatible** - No transformer = existing behavior with sanitization
5. **Memoized in context** - Performance optimized
6. **Separate hook for internal use** - `useTransformer` vs `useFormFields` (different audiences)

---

## Questions or Issues?

If you encounter issues:

1. Check that `html-react-parser` and `dompurify` are installed
2. Verify the transformer function is properly sanitizing HTML
3. Check browser console for transformation errors
4. Verify the HTML format matches expected structure

---

**Status**: Ready for example implementation and optional documentation.  
**Last Updated**: April 29, 2026  
**Next Action**: Create Accordion example in example app
