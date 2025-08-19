import { CostCalculatorEmployment, Currency } from '@/src/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { Card } from '@/src/components/ui/card';
import { cn, formatCurrency } from '@/src/lib/utils';
import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';

const useSummaryResults = (estimations: CostCalculatorEmployment[]) => {
  const currency = estimations[0]?.employer_currency_costs.currency;
  const costsPerCountry = estimations.map((estimation) => {
    return {
      country: estimation.country,
      monthlyCost: formatCurrency(
        estimation.employer_currency_costs.monthly_total,
        currency.symbol,
      ),
      annualCost: formatCurrency(
        estimation.employer_currency_costs.annual_total,
        currency.symbol,
      ),
    };
  });
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
  return { currency, costsPerCountry, employeesCost };
};

const SummaryHeader = ({
  currency,
  title,
}: {
  currency: Currency;
  title: string;
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-row items-center gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F4F4F5]">
          <Globe className="h-6 w-6 text-[#000000]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium leading-none text-[#181818]">
            {title}
          </h2>
          <p className="text-xs text-[#71717A]">
            Employer billing currency: {currency.code}
          </p>
        </div>
      </div>
    </div>
  );
};

const AccordionInlineTrigger = ({
  label,
  rightContent,
}: {
  label: React.ReactNode;
  rightContent: React.ReactNode;
}) => {
  return (
    <AccordionTrigger className="hover:no-underline px-0 py-3 [&>svg]:hidden group">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {label}
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </div>
        {rightContent}
      </div>
    </AccordionTrigger>
  );
};

const CostForAllEmployees = ({
  employeesCost,
}: {
  employeesCost: { monthlyTotal: string; annualTotal: string };
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="cost-breakdown"
      className="w-full"
    >
      <AccordionItem value="cost-breakdown" className="border-none">
        <AccordionInlineTrigger
          label={
            <span className="text-sm font-medium text-[#0F172A]">
              Cost for all employees
            </span>
          }
          rightContent={
            <span className="text-xs text-[#27272A]">Total cost</span>
          }
        />

        <AccordionContent className="px-0 pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-1 h-1 bg-[#09090B] rounded-full flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm text-[#09090B]">Monthly cost</span>
              </div>
              <span className="text-sm text-[#09090B]">
                {employeesCost.monthlyTotal}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-1 h-1 bg-[#09090B] rounded-full flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm text-[#09090B]">Annual cost</span>
              </div>
              <span className="text-sm text-[#09090B]">
                {employeesCost.annualTotal}
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

type SummaryResultsProps = {
  estimations: CostCalculatorEmployment[];
};

export const SummaryResults = ({ estimations }: SummaryResultsProps) => {
  const { currency, costsPerCountry, employeesCost } =
    useSummaryResults(estimations);

  const [accordionValue, setAccordionValue] = useState('summary');

  return (
    <Card className="RemoteFlows__SummaryResults__Card p-10">
      <Accordion
        type="single"
        collapsible
        defaultValue={accordionValue}
        onValueChange={setAccordionValue}
        className="RemoteFlows__SummaryResults__Accordion w-full"
      >
        <AccordionItem value="summary" className="border-border">
          <div
            className={cn({
              RemoteFlows__Separator: accordionValue === 'summary',
            })}
          >
            <AccordionTrigger
              iconClassName="size-6"
              className="hover:no-underline px-0 py-4"
            >
              <SummaryHeader currency={currency} title="Summary Overview" />
            </AccordionTrigger>
          </div>
          <AccordionContent className="px-0 pb-4 mt-6">
            <div className="RemoteFlows__Separator">
              <CostForAllEmployees employeesCost={employeesCost} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
