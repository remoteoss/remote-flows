import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  DOMNode,
} from 'html-react-parser';
import DOMPurify from 'dompurify';
import { $TSFixMe } from '@remoteoss/remote-flows';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@remoteoss/remote-flows/internals';

// Shared <details data-component="Accordion"> detection, parameterized by how the match
// should be rendered (inline accordion vs. a button that opens a modal).
const createHtmlTransformer =
  (
    renderAccordion: (
      summary: React.ReactNode,
      content: React.ReactNode,
    ) => React.ReactElement,
  ) =>
  (htmlContent: string) => {
    // 1. Sanitize HTML first (IMPORTANT for security)
    const clean = DOMPurify.sanitize(htmlContent);

    // 2. Define transformation options
    const options: HTMLReactParserOptions = {
      replace: (domNode) => {
        // Check if it's an element node
        if (domNode.type === 'tag' && domNode.name === 'details') {
          const element = domNode as Element;
          const dataComponent = element.attribs?.['data-component'];

          // Transform <details data-component="Accordion"> per renderAccordion
          if (dataComponent === 'Accordion') {
            // Find the <summary> tag
            const summaryNode = element.children?.find(
              (child: $TSFixMe) =>
                child.type === 'tag' && child.name === 'summary',
            );

            // Extract summary content
            const summary = summaryNode
              ? domToReact(
                  (summaryNode as Element).children as DOMNode[],
                  options,
                )
              : 'Details';

            // Get all other content (not the summary)
            const content = element.children?.filter(
              (child: $TSFixMe) =>
                !(child.type === 'tag' && child.name === 'summary'),
            );

            return renderAccordion(
              summary,
              domToReact((content || []) as $TSFixMe[], options),
            );
          }
        }
      },
    };

    // 3. Parse and transform
    return parse(clean, options);
  };

// Used for regular fields: the accordion becomes a button that opens a modal with its content.
export const transformHtmlToComponents = createHtmlTransformer(
  (summary, content) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='link'>{summary}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{summary}</DialogTitle>
        </DialogHeader>
        <div className='accordion-modal-content'>{content}</div>
      </DialogContent>
    </Dialog>
  ),
);

// Used for forced-value fields whose description embeds a
// <details data-component="Accordion">: instead of an inline accordion nested inside the
// description, the ForcedValue's own title + the description's leading content (everything
// outside the <details>) become the single accordion's summary, and the <details> body
// (minus its own <summary>) becomes the collapsible content.
export const splitAccordionDescription = (
  htmlContent: string,
): { leading: React.ReactNode; content: React.ReactNode } | null => {
  const clean = DOMPurify.sanitize(htmlContent);
  let found = false;
  let accordionContent: React.ReactNode = null;

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === 'tag' && domNode.name === 'details') {
        const element = domNode as Element;

        if (element.attribs?.['data-component'] === 'Accordion') {
          found = true;

          const body = element.children?.filter(
            (child: $TSFixMe) =>
              !(child.type === 'tag' && child.name === 'summary'),
          );

          accordionContent = domToReact((body || []) as $TSFixMe[], options);

          // Drop the <details> node from the leading output — its content becomes the
          // accordion's collapsible body instead.
          return <></>;
        }
      }
    },
  };

  const leading = parse(clean, options);

  return found ? { leading, content: accordionContent } : null;
};
