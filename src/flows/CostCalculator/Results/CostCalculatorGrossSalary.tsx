import { Separator } from '@/src/components/ui/separator';
import { formatCurrency } from '@/src/lib/utils';
import { BasicTooltip } from '@/src/components/ui/basic-tooltip';
import { Button } from '@/src/components/ui/button';
import { useRouter } from '@/src/lib/router';
import { Info } from 'lucide-react';
import { ZendeskDrawer } from '@/src/components/shared/zendesk-drawer/ZendeskDrawer';
import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';

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
  const router = useRouter();
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
                  </span>
                  <ZendeskDrawer
                    zendeskId={zendeskArticles.extraPayments.toString()}
                    zendeskURL={'#'}
                    Trigger={
                      <button
                        onClick={() => {
                          const articleId = zendeskArticles.extraPayments;
                          router.setSearchParams({
                            articleId: articleId.toString() || '',
                          });
                        }}
                        className="text-blue-500 hover:underline block mt-1 text-xs bg-transparent border-none cursor-pointer p-0"
                      >
                        Learn more
                      </button>
                    }
                  />
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
