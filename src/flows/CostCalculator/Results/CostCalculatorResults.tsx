import { Euro } from 'lucide-react';
import React, { lazy, useState } from 'react';

import { CostCalculatorEstimateResponse } from '@/src/client';
import { Badge } from '@/src/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { cn } from '@/src/lib/utils';
import { CostCalculatorBenefitsBreakdown } from './CostCalculatorBenefitsBreakdown';
import { CostCalculatorContributionsBreakdown } from './CostCalculatorContributionsBreakdown';
import { CostCalculatorGrossSalary } from './CostCalculatorGrossSalary';
import { CostCalculatorTotalCost } from './CostCalculatorTotalCost';

const CostCalculatorResultsChart = lazy(
  () => import('./CostCalculatorResultsChart'),
);

interface CostCalculatorResultProps {
  employmentData: CostCalculatorEstimateResponse['data'];
  options?: Partial<{
    title: string;
    description: string;
    showChart: boolean;
    chartColors: {
      grossSalary: string;
      contributions: string;
      benefits: string;
    };
  }>;
}

export function CostCalculatorResults({
  employmentData,
  options,
}: CostCalculatorResultProps) {
  const [view, setView] = useState<'monthly' | 'annual'>('monthly');
  const employment = employmentData.employments?.[0];

  if (!employment) {
    return null;
  }

  const costs =
    view === 'monthly'
      ? employment.employer_currency_costs
      : employment.employer_currency_costs;

  const currency = costs.currency.symbol;
  const grossSalary =
    view === 'monthly' ? costs.monthly_gross_salary : costs.annual_gross_salary;
  const benefitsTotal =
    view === 'monthly'
      ? costs.monthly_benefits_total
      : costs.annual_benefits_total;
  const contributionsTotal =
    view === 'monthly'
      ? costs.monthly_contributions_total
      : costs.annual_contributions_total;
  const totalCost =
    view === 'monthly' ? costs.monthly_total : costs.annual_total;

  const benefitsBreakdown =
    view === 'monthly'
      ? costs.monthly_benefits_breakdown
      : costs.annual_benefits_breakdown;
  const contributionsBreakdown =
    view === 'monthly'
      ? costs.monthly_contributions_breakdown
      : costs.annual_contributions_breakdown;

  const chartData = [
    {
      name: 'Gross Salary',
      value: grossSalary,
      color: options?.chartColors?.grossSalary ?? '#3b82f6',
    },
    {
      name: 'Contributions',
      value: contributionsTotal,
      color: options?.chartColors?.contributions ?? '#f59e0b',
    },
  ];

  if (benefitsBreakdown) {
    chartData.push({
      name: 'Benefits',
      value: benefitsTotal ?? 0,
      color: options?.chartColors?.benefits ?? '#10b981',
    });
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Euro className="h-5 w-5 text-gray-600" />
              {options?.title ?? 'Cost Calculator'}
            </span>
            <Badge className="ml-2">{employment.country.name}</Badge>
          </h2>
          <p className="text-primary-foreground font-medium mt-1">
            {options?.description ??
              `Total cost of employment in ${employment.country.name}`}
          </p>
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as 'monthly' | 'annual')}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full md:w-[200px] grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-6',
          options?.showChart ? 'md:grid-cols-3' : '',
        )}
      >
        <Card className="md:col-span-2 rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of all employer costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Salary Section */}
              <CostCalculatorGrossSalary
                grossSalary={grossSalary}
                currency={currency}
              />
              {/* Benefits Section */}
              {benefitsBreakdown ? (
                <CostCalculatorBenefitsBreakdown
                  benefitsBreakdown={benefitsBreakdown}
                  benefitsTotal={benefitsTotal}
                  currency={currency}
                />
              ) : null}
              {/* Contributions Section */}
              <CostCalculatorContributionsBreakdown
                contributionsBreakdown={contributionsBreakdown}
                contributionsTotal={contributionsTotal}
                currency={currency}
              />
              {/* Total */}
              <CostCalculatorTotalCost
                totalCost={totalCost}
                currency={currency}
              />
            </div>
          </CardContent>
        </Card>

        {options?.showChart && (
          <CostCalculatorResultsChart
            chartData={chartData}
            currency={currency}
          />
        )}
      </div>
    </>
  );
}
