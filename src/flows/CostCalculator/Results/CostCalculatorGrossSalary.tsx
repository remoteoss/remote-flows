import React from 'react';

import { Separator } from '@/src/components/ui/separator';
import { formatCurrency } from '@/src/lib/utils';

type CostCalculatorGrossSalaryProps = {
  grossSalary: number;
  currency: string;
  includeSeparator: boolean;
};

export function CostCalculatorGrossSalary({
  grossSalary,
  currency,
  includeSeparator,
}: CostCalculatorGrossSalaryProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-primary-foreground">Gross Salary</h3>
        <span className="font-semibold text-lg">
          {formatCurrency(grossSalary, currency)}
        </span>
      </div>
      {includeSeparator && <Separator />}
    </div>
  );
}
