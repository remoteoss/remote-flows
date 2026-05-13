import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  DOMNode,
} from 'html-react-parser';
import DOMPurify from 'dompurify';
import { $TSFixMe } from '@remoteoss/remote-flows';
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

          return (
            <Accordion summary={summary}>
              {domToReact((content || []) as $TSFixMe[], options)}
            </Accordion>
          );
        }
      }
    },
  };

  // 3. Parse and transform
  return parse(clean, options);
};
