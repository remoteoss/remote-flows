# Generic `data-component` Registry Plan

## Goal

Replace the two hand-rolled, per-`data-component`-name HTML walkers in the example app with one
shared, generic engine plus a small registry, so adding support for a new `data-component` type
is "add a registry entry," not "write a new bespoke DOM parser." Prove the abstraction works by
closing an existing, already-real gap (`HeadingIcon`) as part of the same change.

## Context

The backend embeds special markup in field descriptions/statements via a `data-component`
attribute — e.g. `<details data-component="Accordion">...</details>` (used today) and
`<h1 data-component="HeadingIcon">...</h1>` (present in the Portugal contract-details fixture,
`src/flows/Onboarding/tests/fixtures/contractDetails/v1-portugal.ts:1106`, but **currently
unhandled** — it just renders as a bare `<h1>`, silently dropping whatever icon treatment the
backend intends).

Today, two places in `example/src/utils/transformHtml.tsx` each hand-roll their own
`html-react-parser` walk to detect `data-component="Accordion"`:

- `createHtmlTransformer` → `transformHtmlToComponents` (passed to `<RemoteFlows>` in
  `example/src/flows/Onboarding/Onboarding.tsx:402`, consumed by the library's
  `BaseFormDescription` for generic field descriptions). Hardcodes tag `details` and string
  `'Accordion'`, renders a Dialog-based modal.
- `splitAccordionDescription`, used by `ForcedValue` in `example/src/Components.tsx` to merge
  the accordion's leading content with the forced-value's own `title` into a single inline
  `<Accordion>` disclosure (`example/src/components/Accordion.tsx`) instead of a modal.

Both walkers duplicate the "find the element tagged with this `data-component`, split summary
vs. body" logic, hardcoded per component name and tag. Adding `HeadingIcon` support today would
mean a third bespoke parser.

This is entirely `example/src/` (consumer) code — no library change is needed:
`transformHtmlToComponents` is just `(html: string) => ReactNode` in the type layer
(`src/types/remoteFlows.ts:252`), and `ForcedValueComponentProps.fieldData` already hands
`ForcedValue` a raw `description` string with no library-side parsing assumptions.

## Approach

### 1. New file: `example/src/utils/dataComponent.tsx` — generic engine

Knows nothing about Accordion, HeadingIcon, Dialog, or the inline `Accordion` component.

```ts
export type DataComponentEntry<TExtracted = unknown> = {
  // Pull the meaningful parts out of the matched element. `options` is the same
  // HTMLReactParserOptions closure so nested content (incl. other data-components)
  // keeps recursing through domToReact.
  extract: (element: Element, options: HTMLReactParserOptions) => TExtracted;
  // Generic in-place presentation used by replaceDataComponents.
  render: (extracted: TExtracted) => React.ReactElement;
};

export type DataComponentRegistry = Record<string, DataComponentEntry<any>>;

// Tag-agnostic: matches by data-component attribute value only (not domNode.name).
export const getDataComponentName: (domNode: DOMNode) => string | undefined;

// Replaces every element tagged data-component="<key>" for any key in `registry`
// (any tag name), in place, via registry[key].render(registry[key].extract(...)).
// Adding a type = adding a registry entry; this function never changes.
export const replaceDataComponents: (html: string, registry: DataComponentRegistry) => React.ReactNode;

// Finds the FIRST element tagged data-component="<name>", removes it, and returns
// { leading, extracted }. `fallbackRegistry` lets any OTHER data-component elsewhere
// in the html still get its normal generic treatment instead of being ignored.
// Returns null if `name` doesn't occur.
export const extractFirstDataComponent: <TExtracted>(
  html: string,
  name: string,
  extract: (element: Element, options: HTMLReactParserOptions) => TExtracted,
  fallbackRegistry?: DataComponentRegistry,
) => { leading: React.ReactNode; extracted: TExtracted } | null;
```

`replaceDataComponents` generalizes today's `createHtmlTransformer`; `extractFirstDataComponent`
generalizes today's `splitAccordionDescription` walk. `DOMPurify.sanitize` is preserved
unchanged inside both.

### 2. Rewrite `example/src/utils/transformHtml.tsx` — concrete registry

Holds the "what does each `data-component` look like in this app" knowledge and the two
existing exports call sites already use, so **no call-site changes are needed**.

```tsx
type AccordionParts = { summary: React.ReactNode; content: React.ReactNode };
const accordionEntry: DataComponentEntry<AccordionParts> = {
  extract: /* same summary/content split as today's createHtmlTransformer, moved verbatim */,
  render: ({ summary, content }) => /* today's Dialog/DialogTrigger/DialogContent modal, unchanged */,
};

type HeadingIconParts = { tagName: string; text: React.ReactNode };
const headingIconEntry: DataComponentEntry<HeadingIconParts> = {
  extract: (element, options) => ({
    tagName: element.name, // don't hardcode 'h1' — proves the mechanism isn't tag-bound
    text: domToReact((element.children ?? []) as DOMNode[], options),
  }),
  render: ({ tagName, text }) =>
    React.createElement(
      tagName,
      { className: 'heading-icon' },
      React.createElement('span', { className: 'heading-icon-glyph', 'aria-hidden': true }, 'ℹ️'),
      text,
    ),
};

export const dataComponentRegistry: DataComponentRegistry = {
  Accordion: accordionEntry,
  HeadingIcon: headingIconEntry,
};

export const transformHtmlToComponents = (html: string) =>
  replaceDataComponents(html, dataComponentRegistry);

export const splitAccordionDescription = (html: string) => {
  const match = extractFirstDataComponent(
    html,
    'Accordion',
    dataComponentRegistry.Accordion.extract,
    dataComponentRegistry, // HeadingIcon elsewhere in the same description still renders
  );
  return match ? { leading: match.leading, content: match.extracted.content } : null;
};
```

### 3. Why the two treatments (modal vs. merged-inline-accordion) stay separate

`ForcedValue`'s special case reuses `accordionEntry.extract` (same summary/content split) but
merges `title` + `leading` into its own composition around the plain `<Accordion>` disclosure —
genuinely different from the generic modal `render`. Only *extraction* is shared; nothing forces
every registry entry to support both consumption styles. `HeadingIcon` only ever goes through
`replaceDataComponents`/its own `render`, with no ForcedValue-style special case, confirming the
registry doesn't force unwanted symmetry.

### 4. No changes needed to call sites

- `example/src/Components.tsx` — `ForcedValue`/`renderDescription` keep calling
  `splitAccordionDescription(description)`; signature and `{ leading, content } | null` shape
  are preserved.
- `example/src/flows/Onboarding/Onboarding.tsx:402` — same `transformHtmlToComponents` import
  and prop wiring.

### 5. Optional CSS

Add `.heading-icon` / `.heading-icon-glyph` rules to `example/src/css/main.css` alongside the
existing `.accordion > summary` rules, for basic visual treatment of the new heading style.

## Implementation order

1. Add `example/src/utils/dataComponent.tsx` (pure engine, no Dialog/Accordion imports).
2. Rewrite `example/src/utils/transformHtml.tsx` to hold the registry + the two exports, moving
   the existing Accordion `extract`/`render` logic in verbatim (behavior-preserving — no visual
   change for Accordion).
3. Add the `HeadingIcon` entry and register it.
4. Add/adjust unit coverage for `dataComponent.tsx` (`replaceDataComponents`,
   `extractFirstDataComponent`) and for the `HeadingIcon` registry entry.
5. Optional: add the heading-icon CSS.

## Verification

- `npm run type-check` and `npm run lint` (root) after the rewrite.
- Run the example app (`npm run dev` in both root and `example/`) with `components` re-enabled
  in `example/src/flows/Onboarding/Onboarding.tsx` (currently commented out — see local diff)
  and walk the Onboarding flow to a contract-details step that renders the France Accordion
  fixture and the Portugal HeadingIcon fixture; confirm the Accordion modal/inline behavior is
  unchanged and the `HeadingIcon` heading now renders with the glyph instead of a bare `<h1>`.
- Any existing tests referencing `transformHtml.tsx`/`splitAccordionDescription` (if present in
  `example/`) should still pass unchanged given the exports are behavior-preserving.
