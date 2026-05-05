import { FormDescription } from '@/src/components/ui/form';
import { screen, render } from '@testing-library/react';
import { TestProviders } from '@/src/tests/testHelpers';
import { PropsWithChildren, ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { FormFieldsContext } from '@/src/context';
import { lazyDefaultComponents } from '@/src/lazy-default-components';

const wrapper = ({ children }: PropsWithChildren) => {
  const TestComponent = () => {
    const methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
  };
  return (
    <TestProviders>
      <TestComponent />
    </TestProviders>
  );
};

const createWrapperWithTransformer = (
  transformHtml?: (html: string) => ReactNode,
) => {
  return ({ children }: PropsWithChildren) => {
    const methods = useForm();
    return (
      <TestProviders>
        <FormFieldsContext.Provider
          value={{
            components: lazyDefaultComponents,
            transformHtmlToComponents: transformHtml,
          }}
        >
          <FormProvider {...methods}>{children}</FormProvider>
        </FormFieldsContext.Provider>
      </TestProviders>
    );
  };
};

describe('Form', () => {
  describe('FormDescription', () => {
    it('should render the description text when passing a normal string', () => {
      render(<FormDescription>hello this is my message</FormDescription>, {
        wrapper,
      });
      expect(screen.getByText('hello this is my message')).toBeInTheDocument();
    });

    it("should render the description text parsing the html tags if they're passed as a string", () => {
      render(
        <FormDescription>
          {'<p data-testid="parragraph">hello this is my message</p>'}
        </FormDescription>,
        {
          wrapper,
        },
      );
      expect(screen.getByTestId('parragraph')).toBeInTheDocument();
      expect(screen.getByTestId('parragraph').textContent).toBe(
        'hello this is my message',
      );
    });

    it('should render the description tag when we inline a function component', () => {
      const TestComponent = () => {
        return <span data-testid='test'>hello this is my message</span>;
      };

      const renderComponent: $TSFixMe = () => {
        return <TestComponent />;
      };
      render(<FormDescription>{renderComponent}</FormDescription>, {
        wrapper,
      });
      expect(screen.getByTestId('test')).toBeInTheDocument();
      expect(screen.getByTestId('test').textContent).toBe(
        'hello this is my message',
      );
    });

    it('adds `_blank` and `noopener noreferrer` for external links', () => {
      const htmlWithExternalLink = `<a href="https://example.com" target="_blank">link</a>`;
      render(<FormDescription>{htmlWithExternalLink}</FormDescription>, {
        wrapper,
      });

      const link = screen.getByText('link');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('does not update `rel` values when target is not `_blank` ', () => {
      const htmlWithoutBlankTarget = `<a href="https://example.com" target="_self" rel="help">internal</a>`;
      render(<FormDescription>{htmlWithoutBlankTarget}</FormDescription>, {
        wrapper,
      });
      const link = screen.getByText('internal');
      expect(link.getAttribute('target')).toBe('_self');
      expect(link.getAttribute('rel')).toBe('help');
    });

    it('does not apply target or rel values to non-anchor tags', () => {
      const htmlWithTargetOnNonAnchor = `<button>button</button>`;
      render(<FormDescription>{htmlWithTargetOnNonAnchor}</FormDescription>, {
        wrapper,
      });

      const button = screen.getByText('button');
      expect(button.getAttribute('target')).toBeNull();
    });

    it('it does not duplicate noopener/noreferrer `rel` values if already present', () => {
      const htmlWithExistingRel = `<a href="https://example.com" target="_blank" rel="noreferrer noopener">link with rel</a>`;
      render(<FormDescription>{htmlWithExistingRel}</FormDescription>, {
        wrapper,
      });

      const linkWithRel = screen.getByText('link with rel');
      expect(linkWithRel.getAttribute('target')).toBe('_blank');
      expect(linkWithRel.getAttribute('rel')).toBe('noreferrer noopener');
    });
  });

  describe('FormDescription with HTML transformer', () => {
    it('should use the custom transformer when provided', () => {
      const customTransformer = (html: string) => {
        if (html.includes('<strong>')) {
          return <b data-testid='custom-bold'>Important text</b>;
        }
        return <span>{html}</span>;
      };

      render(
        <FormDescription>{'<strong>Important text</strong>'}</FormDescription>,
        {
          wrapper: createWrapperWithTransformer(customTransformer),
        },
      );

      expect(screen.getByTestId('custom-bold')).toBeInTheDocument();
      expect(screen.getByTestId('custom-bold').textContent).toBe(
        'Important text',
      );
    });

    it('should transform complex HTML with details element (Accordion pattern)', () => {
      const accordionTransformer = (html: string) => {
        if (html.includes('data-component="Accordion"')) {
          return (
            <div data-testid='custom-accordion'>
              <div data-testid='accordion-summary'>Accordion Title</div>
              <div data-testid='accordion-content'>Accordion Content</div>
            </div>
          );
        }
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      };

      render(
        <FormDescription>
          {
            '<details data-component="Accordion"><summary>Title</summary><p>Content</p></details>'
          }
        </FormDescription>,
        {
          wrapper: createWrapperWithTransformer(accordionTransformer),
        },
      );

      expect(screen.getByTestId('custom-accordion')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-summary')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-content')).toBeInTheDocument();
    });

    it('should not invoke transformer for non-string children', () => {
      const transformerSpy = vi.fn((html: string) => html);

      const CustomComponent = () => (
        <span data-testid='custom-component'>Custom React Component</span>
      );

      render(
        <FormDescription>
          <CustomComponent />
        </FormDescription>,
        {
          wrapper: createWrapperWithTransformer(transformerSpy),
        },
      );

      expect(transformerSpy).not.toHaveBeenCalled();
      expect(screen.getByTestId('custom-component')).toBeInTheDocument();
    });

    it('should pass sanitized HTML to transformer', () => {
      let receivedHtml = '';
      const capturingTransformer = (html: string) => {
        receivedHtml = html;
        return <div data-testid='captured'>{html}</div>;
      };

      const rawHtml = '<script>alert("test")</script><p>Content</p>';
      render(<FormDescription>{rawHtml}</FormDescription>, {
        wrapper: createWrapperWithTransformer(capturingTransformer),
      });

      expect(receivedHtml).toBe('<p>Content</p>');
      expect(screen.getByTestId('captured')).toBeInTheDocument();
    });

    it('should sanitize dangerous HTML when no transformer is provided', () => {
      render(
        <FormDescription>
          {
            '<script>alert("xss")</script><p data-testid="safe">Safe content</p>'
          }
        </FormDescription>,
        {
          wrapper: createWrapperWithTransformer(undefined),
        },
      );

      expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument();
      expect(screen.getByTestId('safe')).toBeInTheDocument();
    });
  });
});
