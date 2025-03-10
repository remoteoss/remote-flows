import React, { lazy, useState } from 'react';
import { Euro, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { cn, formatCurrency } from '@/src/lib/utils';
import type { EmploymentData } from '@/src/types';

const VisualBreakDown = lazy(() => import('./CostCalculatorResultsChart'));

interface CostCalculatorProps {
  employmentData: EmploymentData;
  options?: {
    showChart?: boolean;
  };
}

export function CostCalculatorResults({
  employmentData,
  options,
}: CostCalculatorProps) {
  const [view, setView] = useState<'monthly' | 'annual'>('monthly');

  const employment = employmentData.employments[0];
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
    { name: 'Gross Salary', value: grossSalary, color: '#3b82f6' },
    { name: 'Contributions', value: contributionsTotal, color: '#f59e0b' },
  ];

  if (benefitsBreakdown) {
    chartData.push({
      name: 'Benefits',
      value: benefitsTotal,
      color: '#10b981',
    });
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Euro className="h-5 w-5 text-gray-600" />
              Cost Calculator
            </span>
            <Badge className="ml-2">{employment.country.name}</Badge>
          </h2>
          <p className="text-primary-foreground font-medium mt-1">
            Total cost of employment in {employment.country.name}
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
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of all employer costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Salary Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary-foreground">
                    Gross Salary
                  </h3>
                  <span className="font-semibold text-lg">
                    {formatCurrency(grossSalary, currency)}
                  </span>
                </div>
                {benefitsBreakdown ? <Separator /> : null}
              </div>

              {/* Benefits Section */}
              {benefitsBreakdown ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-primary-foreground-800">
                      Benefits
                    </h3>
                    <span className="font-semibold text-lg">
                      {formatCurrency(benefitsTotal, currency)}
                    </span>
                  </div>
                  <Separator className="mb-3" />

                  <div className="space-y-3 pl-2">
                    {benefitsBreakdown.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <span>{benefit.name}</span>
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0"
                                >
                                  <Info className="h-3 w-3 text-gray-400" />
                                  <span className="sr-only">Info</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  {benefit.description}
                                </p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </div>
                        <span>{formatCurrency(benefit.amount, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Contributions Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary-foreground">
                    Employer Contributions
                  </h3>
                  <span className="font-semibold text-lg">
                    {formatCurrency(contributionsTotal, currency)}
                  </span>
                </div>
                {contributionsBreakdown ? (
                  <>
                    <Separator className="mb-3" />
                    <div className="space-y-3 pl-2">
                      {contributionsBreakdown.map((contribution, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start text-sm"
                        >
                          <div className="flex items-start gap-2">
                            <span>{contribution.name}</span>
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0"
                                  >
                                    <Info className="h-3 w-3 text-gray-400" />
                                    <span className="sr-only">Info</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    {contribution.description}
                                  </p>
                                  {contribution.zendesk_article_url && (
                                    <a
                                      href={contribution.zendesk_article_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline block mt-1 text-xs"
                                    >
                                      Learn more
                                    </a>
                                  )}
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </div>
                          <span>
                            {formatCurrency(contribution.amount, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              {/* Total */}
              <div className="pt-2 mt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-primary-foreground-800">
                    Total Cost
                  </h3>
                  <span className="font-bold text-xl">
                    {formatCurrency(totalCost, currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {options?.showChart && (
          <VisualBreakDown chartData={chartData} currency={currency} />
        )}
      </div>
    </>
  );
}
