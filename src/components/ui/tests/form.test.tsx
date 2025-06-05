import { FormDescription } from '@/src/components/ui/form';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, render } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => {
  const TestComponent = () => {
    const methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
  };
  return (
    <QueryClientProvider client={queryClient}>
      <FormFieldsProvider components={{}}>
        <TestComponent />
      </FormFieldsProvider>
    </QueryClientProvider>
  );
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
        return <span data-testid="test">hello this is my message</span>;
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const renderComponent: any = () => {
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
});
