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
import { Accordion } from '../components/Accordion';

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

// Used for forced-value fields: keeps the classic inline expand/collapse accordion.
export const transformHtmlToAccordion = createHtmlTransformer(
  (summary, content) => (
    <Accordion summary={summary}>{content}</Accordion>
  ),
);
