import {
  CostCalculatorFlow,
  useCostCalculatorFormValues,
} from '@remoteoss/remote-flows';
import type {
  CostCalculatorEmployment,
  CostCalculatorRenderBag,
} from '@remoteoss/remote-flows';
import { useEffect, useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

const MIN_SALARY = 20_000;
const MAX_SALARY = 200_000;
const DEFAULT_SALARY = 91_000;

type Option = { value: string; label: string };

const getOptions = (bag: CostCalculatorRenderBag, name: string) =>
  (bag.fields.find((field) => field.name === name)?.options ?? []) as Option[];

const formatUSD = (cents?: number) =>
  cents == null
    ? '-'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(cents / 100);

function LiveCostCalculator({ bag }: { bag: CostCalculatorRenderBag }) {
  const { form } = bag;
  const country = useCostCalculatorFormValues(form, 'country');
  const region = useCostCalculatorFormValues(form, 'region');
  const salary = useCostCalculatorFormValues(form, 'salary_conversion');
  const [employment, setEmployment] = useState<CostCalculatorEmployment>();
  const [error, setError] = useState<string | null>(null);

  const countries = getOptions(bag, 'country');
  const regionField = bag.fields.find((field) => field.name === 'region');
  const usd = getOptions(bag, 'currency').find(
    (option) => option.label === 'USD',
  );

  useEffect(() => {
    if (usd && !form.getValues().currency) {
      form.setValues({
        currency: usd.value,
        salary_conversion: String(DEFAULT_SALARY),
        salary_converted: 'salary_conversion',
      });
    }
  }, [form, usd]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let latestRequest = 0;

    const estimate = async () => {
      const requestId = ++latestRequest;
      const result = await form.submit();
      if (requestId !== latestRequest) return;

      if (result.status === 'success') {
        setEmployment(result.data.data.employments?.[0]);
        setError(null);
      } else if (result.status === 'error') {
        setError(result.error.message);
      }
    };

    const unsubscribe = form.subscribe((values) => {
      clearTimeout(timeout);
      if (values.country && values.currency) {
        timeout = setTimeout(estimate, 400);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [form]);

  const costs = employment?.employer_currency_costs;
  const employerCosts = costs && costs.annual_total - costs.annual_gross_salary;

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <div className='space-y-6'>
        <p className='text-sm text-gray-600'>
          Select a country you're interested in, then use the salary slider to
          review estimated employer costs and total compensation.
        </p>

        <select
          aria-label='Country'
          className='w-full rounded-full border px-4 py-2'
          value={country ?? ''}
          onChange={(event) => form.setValue('country', event.target.value)}
        >
          <option value='' disabled>
            Select a country
          </option>
          {countries.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {regionField?.isVisible ? (
          <select
            aria-label='Region'
            className='w-full rounded-full border px-4 py-2'
            value={region ?? ''}
            onChange={(event) => form.setValue('region', event.target.value)}
          >
            <option value='' disabled>
              Select a region
            </option>
            {(regionField.options as Option[]).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        <div>
          <div className='flex justify-between text-sm font-semibold'>
            <label htmlFor='salary-slider'>Gross Annual Salary (USD):</label>
            <span className='text-green-700'>
              {formatUSD(Number(salary) * 100)}
            </span>
          </div>
          <input
            id='salary-slider'
            type='range'
            className='mt-3 w-full'
            min={MIN_SALARY}
            max={MAX_SALARY}
            step={1000}
            value={Number(salary) || MIN_SALARY}
            onChange={(event) =>
              form.setValues({
                salary_conversion: event.target.value,
                salary_converted: 'salary_conversion',
              })
            }
          />
          <div className='flex justify-between text-xs text-gray-500'>
            <span>$20K</span>
            <span>$200K</span>
          </div>
        </div>
      </div>

      <div className='space-y-4 rounded-2xl border p-6'>
        {error ? <p className='text-sm text-red-600'>{error}</p> : null}
        <div className='flex justify-between border-b pb-3'>
          <span>Base Salary</span>
          <span>{formatUSD(costs?.annual_gross_salary)}</span>
        </div>
        <div className='flex justify-between border-b pb-3'>
          <span>Estimated Employer Costs</span>
          <span>+{formatUSD(employerCosts)}</span>
        </div>
        <div className='flex justify-between text-xl font-semibold'>
          <span>Estimated Total</span>
          <span>{formatUSD(costs?.annual_total)}</span>
        </div>
      </div>
    </div>
  );
}

export function CostCalculatorLiveSlider() {
  return (
    <RemoteFlows isClientToken>
      <CostCalculatorFlow
        version='marketing'
        render={(bag) =>
          bag.isLoading ? (
            <div>Loading...</div>
          ) : (
            <LiveCostCalculator bag={bag} />
          )
        }
      />
    </RemoteFlows>
  );
}
