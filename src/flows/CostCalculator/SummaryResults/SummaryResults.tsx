import { CostCalculatorEmployment } from '@/src/client';
import { Card } from '@/src/components/ui/card';
import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';

const useSummaryResults = (estimations: CostCalculatorEmployment[]) => {
  const currency = estimations[0]?.employer_currency_costs.currency;
  const costsPerCountry = estimations.map((estimation) => {
    return {
      country: estimation.country,
      monthlyCost: estimation.employer_currency_costs.monthly_total,
      annualCost: estimation.employer_currency_costs.annual_total,
    };
  });
  const employeesCost = {
    monthlyTotal: estimations.reduce((acc, estimation) => {
      return acc + estimation.employer_currency_costs.monthly_total;
    }, 0),
    annualTotal: estimations.reduce((acc, estimation) => {
      return acc + estimation.employer_currency_costs.annual_total;
    }, 0),
  };
  return { currency, costsPerCountry, employeesCost };
};

function SummaryHeader({
  title,
  currency,
}: {
  title: string;
  currency: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="RemoteFlows__SummaryResults__Header flex justify-between items-center">
      <div className="flex flex-row items-center gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F4F4F5]">
          <Globe className="h-6 w-6 text-[#000000]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-medium leading-none text-[#181818]">
            {title}
          </h2>
          <p className="text-xs text-[#71717A]">
            Employer billing currency: {currency}
          </p>
        </div>
      </div>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
}

type SummaryResultsProps = {
  estimations: CostCalculatorEmployment[];
};

export const SummaryResults = ({ estimations }: SummaryResultsProps) => {
  const { currency, costsPerCountry, employeesCost } =
    useSummaryResults(estimations);

  return (
    <Card className="p-10">
      <div className="RemoteFlows__Separator">
        <SummaryHeader title="Summary Overview" currency={currency.code} />
      </div>
    </Card>
  );
};
