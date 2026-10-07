import { ReactNode, useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import {
  CostCalculatorFlow,
  CostCalculatorRenderBag,
} from '@/src/flows/CostCalculator/CostCalculatorFlow';
import { CostCalculatorForm } from '@/src/flows/CostCalculator/CostCalculatorForm';
import {
  CostCalculatorSubmitResult,
  useCostCalculatorFormValues,
} from '@/src/flows/CostCalculator/formController';
import { server } from '@/src/tests/server';
import { TestProviders } from '@/src/tests/testHelpers';
import { countries, currencies, estimation, regionFields } from './fixtures';

const defaultValues = {
  countryRegionSlug: 'POL',
  hiringBudget: 'my_hiring_budget',
  currencySlug: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
  salary: '50000',
};

function SalaryReadout({ bag }: { bag: CostCalculatorRenderBag }) {
  const salary = useCostCalculatorFormValues(bag.form, 'salary');
  return <p data-testid='salary-readout'>{salary}</p>;
}

function renderFlow(
  renderContent: (bag: CostCalculatorRenderBag) => ReactNode,
) {
  let latestBag: CostCalculatorRenderBag | undefined;
  render(
    <CostCalculatorFlow
      defaultValues={defaultValues}
      render={(bag) => {
        latestBag = bag;
        if (bag.isLoading) {
          return <div data-testid='loading'>Loading...</div>;
        }
        return renderContent(bag);
      }}
    />,
    { wrapper: TestProviders },
  );
  return () => latestBag as CostCalculatorRenderBag;
}

describe('CostCalculatorFlow form controller', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v1/cost-calculator/countries', () =>
        HttpResponse.json(countries),
      ),
      http.get('*/v1/company-currencies', () => HttpResponse.json(currencies)),
      http.get('*/v1/cost-calculator/regions/*/fields', () =>
        HttpResponse.json(regionFields),
      ),
      http.post('*/v1/cost-calculator/estimation', () =>
        HttpResponse.json(estimation),
      ),
    );
  });

  it('exposes the current values and re-renders subscribers when one changes', async () => {
    const getBag = renderFlow((bag) => <SalaryReadout bag={bag} />);

    await waitFor(() => {
      expect(screen.getByTestId('salary-readout')).toHaveTextContent('50000');
    });
    expect(getBag().form.getValues().country).toBe('POL');

    getBag().form.setValue('salary', '91000');

    await waitFor(() => {
      expect(screen.getByTestId('salary-readout')).toHaveTextContent('91000');
    });
  });

  it('notifies subscribers when the user types in the form', async () => {
    const listener = vi.fn();
    const getBag = renderFlow(() => <CostCalculatorForm />);

    await screen.findByText(/Show PLN conversion/i);
    getBag().form.subscribe(listener);
    const salaryInput = screen.getByRole('textbox', { name: /salary/i });

    fireEvent.change(salaryInput, { target: { value: '75000' } });

    await waitFor(() => {
      expect(listener.mock.lastCall?.[0].salary_conversion).toBe('75000');
    });
  });

  it("runs the field's side effects when setting a value, like a user would", async () => {
    const getBag = renderFlow(() => <CostCalculatorForm />);

    await screen.findByRole('textbox', { name: /salary/i });
    expect(
      screen.queryByRole('combobox', { name: /region/i }),
    ).not.toBeInTheDocument();

    getBag().form.setValue('country', 'ESP');

    expect(
      await screen.findByRole('combobox', { name: /region/i }),
    ).toBeInTheDocument();
  });

  it('requests an estimation without rendering CostCalculatorForm', async () => {
    const getBag = renderFlow((bag) => <SalaryReadout bag={bag} />);

    await waitFor(() => {
      expect(screen.getByTestId('salary-readout')).toHaveTextContent('50000');
    });

    let result: CostCalculatorSubmitResult | undefined;
    await waitFor(async () => {
      result = await getBag().form.submit();
      expect(result).toEqual({ status: 'success', data: estimation });
    });

    expect(result).toEqual({ status: 'success', data: estimation });
  });

  it('reports validation errors instead of requesting an estimation', async () => {
    const estimationRequest = vi.fn();
    server.use(
      http.post('*/v1/cost-calculator/estimation', () => {
        estimationRequest();
        return HttpResponse.json(estimation);
      }),
    );
    const getBag = renderFlow((bag) => <SalaryReadout bag={bag} />);

    await waitFor(() => {
      expect(screen.getByTestId('salary-readout')).toHaveTextContent('50000');
    });

    getBag().form.setValue('salary', '');
    const result = await getBag().form.submit();

    expect(result.status).toBe('invalid');
    expect(estimationRequest).not.toHaveBeenCalled();
  });

  it('reads values that fields set while the flow first mounts', async () => {
    let latestBag: CostCalculatorRenderBag | undefined;
    function SetsTitleOnMount({ bag }: { bag: CostCalculatorRenderBag }) {
      useEffect(() => {
        bag.form.setValue('estimation_title', 'Set on mount');
      }, [bag.form]);
      return null;
    }
    render(
      <CostCalculatorFlow
        defaultValues={defaultValues}
        render={(bag) => {
          latestBag = bag;
          return <SetsTitleOnMount bag={bag} />;
        }}
      />,
      { wrapper: TestProviders },
    );

    expect(latestBag?.form.getValues().estimation_title).toBe('Set on mount');
  });

  it('reports a failed request instead of throwing', async () => {
    server.use(
      http.post('*/v1/cost-calculator/estimation', () => HttpResponse.error()),
    );
    const getBag = renderFlow((bag) => <SalaryReadout bag={bag} />);

    await waitFor(() => {
      expect(screen.getByTestId('salary-readout')).toHaveTextContent('50000');
    });

    let result: CostCalculatorSubmitResult | undefined;
    await waitFor(async () => {
      result = await getBag().form.submit();
      expect(result.status).not.toBe('invalid');
    });

    expect(result?.status).toBe('error');
  });
});
