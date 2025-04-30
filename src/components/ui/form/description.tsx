import { useFormField } from '@/src/components/ui/form';
import { cn } from '@/src/lib/utils';
import DOMPurify from 'dompurify';
import * as React from 'react';

// Deduplicates rel values if necessary and appends noopener and noreferrer
const appendSecureRelValue = (rel: string | null) => {
  const attributes = new Set(rel ? rel.toLowerCase().split(' ') : []);

  attributes.add('noopener');
  attributes.add('noreferrer');

  return Array.from(attributes).join(' ');
};

if (DOMPurify.isSupported) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const target = node.getAttribute('target');

    console.log({
      target,
      nod: node.tagName === 'A',
      anchor: node.getAttribute('href'),
      anchorTarget: node.getAttribute('target'), // Changed from getAttributes() to getAttribute('href')
    });

    // set value of target to be _blank with rel, or keep as _self if already set
    if (node.tagName === 'A' && (!target || target !== '_self')) {
      node.setAttribute('target', '_blank');
      const rel = node.getAttribute('rel');
      node.setAttribute('rel', appendSecureRelValue(rel));
    }
  });
}

export function FormDescription({
  className,
  children,
  ...props
}: React.ComponentProps<'p'> & {
  children?: React.ReactNode | (() => React.ReactNode);
}) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-base-color text-xs', className)}
      {...(typeof children === 'string'
        ? {
            dangerouslySetInnerHTML: {
              __html: DOMPurify.sanitize(children, { ADD_ATTR: ['target'] }),
            },
          }
        : {})} // Only add dangerouslySetInnerHTML when children is a string
      {...props}
    >
      {typeof children === 'function' ? children() : null}
    </p>
  );
}
