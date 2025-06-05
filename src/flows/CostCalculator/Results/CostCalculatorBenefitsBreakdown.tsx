import { Info } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from '@/src/components/ui/tooltip';
import { formatCurrency } from '@/src/lib/utils';

type CostCalculatorBenefitsBreakdownProps = {
  benefitsTotal: number | undefined;
  benefitsBreakdown: {
    name: string;
    description: string | null;
    amount: number;
  }[];
  currency: string;
};

export function CostCalculatorBenefitsBreakdown({
  benefitsTotal,
  benefitsBreakdown,
  currency,
}: CostCalculatorBenefitsBreakdownProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-primary-foreground-800">Benefits</h3>
        <span className="font-semibold text-lg">
          {formatCurrency(benefitsTotal, currency)}
        </span>
      </div>
      <Separator className="mb-3" />

      <div className="space-y-3 pl-2">
        {benefitsBreakdown.map((benefit, index) => (
          <div key={index} className="flex justify-between items-start text-sm">
            <div className="flex items-start gap-2">
              <span>{benefit.name}</span>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                      <Info className="h-3 w-3 text-gray-400" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{benefit.description}</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <span>{formatCurrency(benefit.amount, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
