import { domToReact, Element, DOMNode } from 'html-react-parser';
import { $TSFixMe } from '@remoteoss/remote-flows';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@remoteoss/remote-flows/internals';
import {
  DataComponentEntry,
  DataComponentRegistry,
  extractFirstDataComponent,
  replaceDataComponents,
} from './dataComponent';

type AccordionParts = { summary: React.ReactNode; content: React.ReactNode };

// Shared <details data-component="Accordion"> extraction: split the <summary> from the
// rest of the body so callers can present the two pieces however they need to.
const accordionEntry: DataComponentEntry<AccordionParts> = {
  extract: (element, options) => {
    const summaryNode = element.children?.find(
      (child: $TSFixMe) => child.type === 'tag' && child.name === 'summary',
    );

    const summary = summaryNode
      ? domToReact((summaryNode as Element).children as DOMNode[], options)
      : 'Details';

    const content = element.children?.filter(
      (child: $TSFixMe) => !(child.type === 'tag' && child.name === 'summary'),
    );

    return {
      summary,
      content: domToReact((content || []) as DOMNode[], options),
    };
  },
  // Used for regular fields: the accordion becomes a button that opens a modal with its
  // content.
  render: ({ summary, content }) => (
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
};

export const dataComponentRegistry: DataComponentRegistry = {
  Accordion: accordionEntry,
};

export const transformHtmlToComponents = (htmlContent: string) =>
  replaceDataComponents(htmlContent, dataComponentRegistry);

// Used for forced-value fields whose description embeds a
// <details data-component="Accordion">: instead of an inline accordion nested inside the
// description, the ForcedValue's own title + the description's leading content (everything
// outside the <details>) become the single accordion's summary, and the <details> body
// (minus its own <summary>) becomes the collapsible content.
export const splitAccordionDescription = (
  htmlContent: string,
): { leading: React.ReactNode; content: React.ReactNode } | null => {
  const match = extractFirstDataComponent(
    htmlContent,
    'Accordion',
    accordionEntry.extract,
    dataComponentRegistry,
  );

  return match
    ? { leading: match.leading, content: match.extracted.content }
    : null;
};
