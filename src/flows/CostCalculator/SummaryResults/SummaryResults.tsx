import { Currency } from '@/src/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { Card } from '@/src/components/ui/card';
import { CostCalculatorEstimation } from '@/src/flows/CostCalculator/types';
import { cn, formatCurrency } from '@/src/lib/utils';
import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';

const useSummaryResults = (estimations: CostCalculatorEstimation[]) => {
  if (estimations.length < 2) {
    return {
      currency: null,
      costsPerCountry: [],
      employeesCost: null,
    };
  }
  const currency = estimations[0]?.employer_currency_costs.currency;
  const costsPerCountry = estimations.reduce(
    (acc, estimation) => {
      const countryName = estimation.country.name;

      acc[countryName] = {
        country: estimation.country,
        monthlyTotal:
          (acc[countryName]?.monthlyTotal || 0) +
          estimation.employer_currency_costs.monthly_total,
        annualTotal:
          (acc[countryName]?.annualTotal || 0) +
          estimation.employer_currency_costs.annual_total,
      };

      return acc;
    },
    {} as Record<
      string,
      {
        country: (typeof estimations)[0]['country'];
        monthlyTotal: number;
        annualTotal: number;
      }
    >,
  );

  const groupedCostsPerCountry = Object.values(costsPerCountry).map(
    ({ country, monthlyTotal, annualTotal }) => ({
      country,
      monthlyCost: formatCurrency(monthlyTotal, currency.symbol),
      annualCost: formatCurrency(annualTotal, currency.symbol),
    }),
  );

  const employeesCost = {
    monthlyTotal: formatCurrency(
      estimations.reduce((acc, estimation) => {
        return acc + estimation.employer_currency_costs.monthly_total;
      }, 0),
      currency.symbol,
    ),
    annualTotal: formatCurrency(
      estimations.reduce((acc, estimation) => {
        return acc + estimation.employer_currency_costs.annual_total;
      }, 0),
      currency.symbol,
    ),
  };
  return { currency, costsPerCountry: groupedCostsPerCountry, employeesCost };
};

const SummaryHeader = ({
  currency,
  title,
}: {
  currency: Currency;
  title: string;
}) => {
  return (
    <div className='flex items-center justify-between w-full'>
      <div className='flex flex-row items-center gap-6'>
        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#F4F4F5]'>
          <Globe className='h-6 w-6 text-[#000000]' />
        </div>
        <div className='space-y-1'>
          <h2 className='text-lg font-medium leading-none text-[#181818]'>
            {title}
          </h2>
          <p className='text-xs text-[#71717A]'>
            Employer billing currency: {currency.code}
          </p>
        </div>
      </div>
    </div>
  );
};

const MultiColumnAccordion = ({
  label,
  columns,
  rows,
  defaultValue = 'accordion',
  className,
}: {
  label: React.ReactNode;
  columns: string[];
  rows: Array<{
    label: React.ReactNode;
    values: string[];
  }>;
  defaultValue?: string;
  className?: string;
}) => {
  const gridCols = columns.length === 1 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue={defaultValue}
      className={cn('w-full', className)}
    >
      <AccordionItem value={defaultValue} className='border-none'>
        <AccordionTrigger className='hover:no-underline px-0 py-3 [&>svg]:hidden group'>
          <div className={cn('grid items-center w-full', gridCols)}>
            <div className='flex items-center gap-2'>
              {label}
              <ChevronDown className='h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180' />
            </div>
            {columns.length === 1 ? (
              <span className='text-xs text-[#27272A] text-right'>
                {columns[0]}
              </span>
            ) : (
              columns.map((column, index) => (
                <span key={index} className='text-xs text-[#27272A] text-right'>
                  {column}
                </span>
              ))
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent className='px-0 pb-4'>
          <div className='space-y-3'>
            {rows.map((row, index) => (
              <div key={index} className={cn('grid items-center', gridCols)}>
                <div className='flex items-center gap-2'>{row.label}</div>
                {columns.length === 1 ? (
                  <span className='text-sm text-[#09090B] text-right'>
                    {row.values[0]}
                  </span>
                ) : (
                  row.values.map((value, valueIndex) => (
                    <span
                      key={valueIndex}
                      className='text-sm text-[#09090B] text-right'
                    >
                      {value}
                    </span>
                  ))
                )}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const CostForAllEmployees = ({
  employeesCost,
}: {
  employeesCost: { monthlyTotal: string; annualTotal: string };
}) => {
  return (
    <MultiColumnAccordion
      label={
        <span className='text-sm font-medium text-[#0F172A]'>
          Cost for all employees
        </span>
      }
      columns={['Total cost']}
      rows={[
        {
          label: (
            <>
              <span className='w-1 h-1 bg-[#09090B] rounded-full flex-shrink-0' />
              <span className='text-sm text-[#09090B]'>Monthly cost</span>
            </>
          ),
          values: [employeesCost.monthlyTotal],
        },
        {
          label: (
            <>
              <span className='w-1 h-1 bg-[#09090B] rounded-full flex-shrink-0' />
              <span className='text-sm text-[#09090B]'>Annual cost</span>
            </>
          ),
          values: [employeesCost.annualTotal],
        },
      ]}
      defaultValue='cost-breakdown'
    />
  );
};

const CostsPerCountry = ({
  costsPerCountry,
}: {
  costsPerCountry: Array<{
    country: { name: string };
    monthlyCost: string;
    annualCost: string;
  }>;
}) => {
  return (
    <MultiColumnAccordion
      label={
        <span className='text-sm font-medium text-[#0F172A]'>
          Cost per country
        </span>
      }
      columns={['Monthly cost', 'Annual cost']}
      rows={costsPerCountry.map((cost) => ({
        label: (
          <>
            <span className='w-1 h-1 bg-[#09090B] rounded-full flex-shrink-0' />
            <span className='text-sm text-[#09090B]'>{cost.country.name}</span>
          </>
        ),
        values: [cost.monthlyCost, cost.annualCost],
      }))}
      defaultValue='country-breakdown'
    />
  );
};

type SummaryResultsProps = {
  /**
   * Array of employments to compare costs for.
   * 2 estimations required for the component to render
   */
  estimations: CostCalculatorEstimation[];
};

/**
 * Displays a summary comparison of costs across multiple estimations.
 * The component will return null if you pass less than 2 estimations.
 */
export const SummaryResults = ({ estimations }: SummaryResultsProps) => {
  const { currency, costsPerCountry, employeesCost } =
    useSummaryResults(estimations);

  const [accordionValue, setAccordionValue] = useState('summary');

  if (
    !currency ||
    costsPerCountry.length === 0 ||
    Object.keys(employeesCost).length === 0
  ) {
    return null;
  }

  return (
    <Card className='RemoteFlows__SummaryResults__Card p-10'>
      <Accordion
        type='single'
        collapsible
        defaultValue={accordionValue}
        onValueChange={setAccordionValue}
        className='RemoteFlows__SummaryResults__Accordion w-full'
      >
        <AccordionItem value='summary' className='border-border'>
          <div
            className={cn({
              RemoteFlows__Separator: accordionValue === 'summary',
            })}
          >
            <AccordionTrigger
              iconClassName='size-6'
              className='hover:no-underline px-0 py-4'
            >
              <SummaryHeader currency={currency} title='Summary Overview' />
            </AccordionTrigger>
          </div>
          <AccordionContent className='px-0 pb-4 mt-6'>
            <div className='RemoteFlows__Separator'>
              <CostForAllEmployees employeesCost={employeesCost} />
            </div>
            <div className='mt-6'>
              <CostsPerCountry costsPerCountry={costsPerCountry} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
