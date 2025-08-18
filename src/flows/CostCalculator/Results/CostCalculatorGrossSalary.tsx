import { Separator } from '@/src/components/ui/separator';
import { formatCurrency } from '@/src/lib/utils';
import { BasicTooltip } from '@/src/components/ui/basic-tooltip';
import { Button } from '@/src/components/ui/button';
import { Info } from 'lucide-react';
import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';

type CostCalculatorGrossSalaryProps = {
  grossSalary: number;
  currency: string;
  hasExtraStatutoryPayment?: boolean;
};

export function CostCalculatorGrossSalary({
  grossSalary,
  currency,
  hasExtraStatutoryPayment = false,
}: CostCalculatorGrossSalaryProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-primary-foreground">Gross Salary</h3>
          {hasExtraStatutoryPayment && (
            <BasicTooltip
              content={
                <>
                  <span>
                    This country respects extra payments on top of the gross
                    salary.
                  </span>{' '}
                  <ZendeskTriggerButton
                    zendeskId={zendeskArticles.extraPayments}
                  >
                    Learn more
                  </ZendeskTriggerButton>
                </>
              }
            >
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 mt-2">
                <Info className="h-3 w-3 text-gray-400" />
                <span className="sr-only">Info</span>
              </Button>
            </BasicTooltip>
          )}
        </div>
        <span className="font-semibold text-lg">
          {formatCurrency(grossSalary, currency)}
        </span>
      </div>
      <Separator />
    </div>
  );
}
