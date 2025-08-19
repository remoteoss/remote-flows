import { CostCalculatorEmployment } from '@/src/client';
import { Card } from '@/src/components/ui/card';

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

type SummaryResultsProps = {
  estimations: CostCalculatorEmployment[];
};

export const SummaryResults = ({ estimations }: SummaryResultsProps) => {
  const { currency, costsPerCountry, employeesCost } =
    useSummaryResults(estimations);

  return (
    <Card className="p-10">
      {JSON.stringify(
        {
          currency,
          costsPerCountry,
          employeesCost,
        },
        null,
        2,
      )}
    </Card>
  );
};
