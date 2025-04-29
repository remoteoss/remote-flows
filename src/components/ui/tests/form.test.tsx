import { FormDescription } from '@/src/components/ui/form';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, render } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
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
  });
});
