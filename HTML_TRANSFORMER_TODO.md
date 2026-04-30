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


### 2. Add Integration Tests for Custom Components with Transformer

**Priority: MEDIUM**  
**Estimated effort: 30-45 minutes**

Add tests to verify that custom field components receive and can use `fieldData.transformHtml`.

#### Location:

`src/components/ui/tests/form.test.tsx` - Add new describe block after existing transformer tests

#### Test cases to add:

```typescript
describe('Custom field components with transformer', () => {
  it('should pass transformHtml to custom field component via fieldData', () => {
    // Test that custom TextField receives transformHtml function
    // Verify it can call it and render transformed HTML
  });

  it('should work when no transformer is provided (fallback)', () => {
    // Custom component should handle undefined transformHtml gracefully
  });

  it('should transform HTML descriptions in custom field components', () => {
    // Full integration: TextField with description containing Accordion HTML
    // Custom component uses transformHtml
    // Verify Accordion renders correctly
  });
});
```

#### What this tests:

- ✅ Custom field components receive `transformHtml` in `fieldData`
- ✅ Custom components can call transformer and render result
- ✅ Fallback behavior when transformer is undefined
- ✅ Full integration: HTML description → transformer → custom component → rendered output

#### Benefits:

- Complements existing `FormDescription` transformer tests
- Uses existing `createWrapperWithTransformer` helper
- Verifies the feature works end-to-end with custom components
- Minimal duplication, clear test organization

---

### 3. Documentation (Optional but Recommended)

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

### 4. Slice Work into Reviewable PRs

**Priority: HIGH (Once all work is complete and tested)**  
**Estimated effort: 1-2 hours**

After completing the example, tests, and documentation, split the work into small, reviewable PRs.

#### Recommended PR structure:

**PR 1: Core Infrastructure** (smallest, safest)

- `src/types/remoteFlows.ts` - Added `transformHtmlToComponents` prop
- `src/context.ts` - Added `useTransformer` hook
- `src/RemoteFlowsProvider.tsx` - Wired up transformer to context
- `src/lib/transformDescription.tsx` - Internal helper
- `src/components/ui/form.tsx` - Updated `FormDescription` to use transformer
- `src/components/ui/tests/form.test.tsx` - Tests for `FormDescription` transformer
- Test mocks updated with `useTransformer`

**Why first**: Establishes the foundation, smallest surface area, easiest to review

**PR 2: Field Components Integration**

- `src/types/fields.ts` - Added `transformHtml` to `FieldDataProps`
- All 13 field components updated to inject `transformHtml` into `fieldData`:
  - TextField, TextAreaField, SelectField, RadioGroupField, CheckBoxField
  - NumberField, EmailField, MultiSelectField, DatePickerField
  - CountryField, FileUploadField, TelField, WorkScheduleField
- `src/components/form/fields/FieldSetField.tsx` - Updated to use transformer
- `src/components/ui/tests/form.test.tsx` - Add custom component integration tests

**Why second**: Builds on PR 1, enables the feature for all field types

**PR 3: Example Implementation**

- `example/src/components/Accordion.tsx` - New component
- `example/src/utils/transformHtml.tsx` - Transformer function
- `example/src/Onboarding.tsx` - Wire up transformer
- `package.json` - Add `html-react-parser` and `dompurify` dependencies (example only)

**Why third**: Shows the feature in action, doesn't affect library code

**PR 4: Documentation**

- `README.md` - HTML transformation section
- `CHANGELOG.md` - Feature announcement
- `src/index.tsx` - Export `TelFieldComponentProps` (if not already done)

**Why last**: Documents everything that's already merged

#### Benefits of this approach:

- ✅ Each PR has a clear purpose and scope
- ✅ Core infrastructure can be reviewed and merged first
- ✅ Easier to spot issues in smaller diffs
- ✅ Can merge incrementally (feature is backward compatible)
- ✅ Reduces risk of "everything slips" in one huge PR
- ✅ Reviewers can focus on one aspect at a time

#### Alternative (if PRs are too large):

Could split PR 2 into:

- **PR 2a**: Update first 6 field components
- **PR 2b**: Update remaining 7 field components + tests

---

### 5. Future Enhancements (Not Required Now)

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
