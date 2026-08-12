import parse, {
  HTMLReactParserOptions,
  Element,
  DOMNode,
} from 'html-react-parser';
import DOMPurify from 'dompurify';

export type DataComponentEntry<TExtracted = unknown> = {
  // Pull the meaningful parts out of the matched element. `options` is the same
  // HTMLReactParserOptions closure so nested content (incl. other data-components)
  // keeps recursing through domToReact.
  extract: (element: Element, options: HTMLReactParserOptions) => TExtracted;
  // Generic in-place presentation used by replaceDataComponents.
  render: (extracted: TExtracted) => React.ReactElement;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataComponentRegistry = Record<string, DataComponentEntry<any>>;

// Tag-agnostic: matches by data-component attribute value only (not domNode.name).
export const getDataComponentName = (domNode: DOMNode): string | undefined => {
  if (domNode.type !== 'tag') {
    return undefined;
  }
  return (domNode as Element).attribs?.['data-component'];
};

// Replaces every element tagged data-component="<key>" for any key in `registry`
// (any tag name), in place, via registry[key].render(registry[key].extract(...)).
// Adding a type = adding a registry entry; this function never changes.
export const replaceDataComponents = (
  html: string,
  registry: DataComponentRegistry,
): React.ReactNode => {
  const clean = DOMPurify.sanitize(html);

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      const name = getDataComponentName(domNode);
      if (name && registry[name]) {
        const entry = registry[name];
        return entry.render(entry.extract(domNode as Element, options));
      }
    },
  };

  return parse(clean, options);
};

// Finds the FIRST element tagged data-component="<name>", removes it, and returns
// { leading, extracted }. `fallbackRegistry` lets any OTHER data-component elsewhere
// in the html still get its normal generic treatment instead of being ignored.
// Returns null if `name` doesn't occur.
export const extractFirstDataComponent = <TExtracted,>(
  html: string,
  name: string,
  extract: (element: Element, options: HTMLReactParserOptions) => TExtracted,
  fallbackRegistry?: DataComponentRegistry,
): { leading: React.ReactNode; extracted: TExtracted } | null => {
  const clean = DOMPurify.sanitize(html);
  let found = false;
  let extracted: TExtracted | undefined;

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      const componentName = getDataComponentName(domNode);

      if (!found && componentName === name) {
        found = true;
        extracted = extract(domNode as Element, options);
        // Drop the matched node from the leading output — its content is returned
        // separately via `extracted` instead.
        return <></>;
      }

      if (
        componentName &&
        componentName !== name &&
        fallbackRegistry?.[componentName]
      ) {
        const entry = fallbackRegistry[componentName];
        return entry.render(entry.extract(domNode as Element, options));
      }
    },
  };

  const leading = parse(clean, options);

  return found ? { leading, extracted: extracted as TExtracted } : null;
};
