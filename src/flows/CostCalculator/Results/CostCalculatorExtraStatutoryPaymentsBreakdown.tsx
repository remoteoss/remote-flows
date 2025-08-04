import { Info } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { formatCurrency } from '@/src/lib/utils';
import { BasicTooltip } from '@/src/components/ui/basic-tooltip';
import { ZendeskDrawer } from '@/src/flows/CostCalculator/components/ZendeskDrawer';
import { useRouter } from '@/src/lib/router';

type CostCalculatorExtraStatutoryPaymentsBreakdownProps = {
  extraStatutoryPaymentsTotal: number | null;
  extraStatutoryPaymentsBreakdown: {
    name: string;
    description: string | null;
    zendesk_article_url: string | null;
    amount: number;
  }[];
  currency: string;
};

export function CostCalculatorExtraStatutoryPaymentsBreakdown({
  extraStatutoryPaymentsTotal,
  extraStatutoryPaymentsBreakdown,
  currency,
}: CostCalculatorExtraStatutoryPaymentsBreakdownProps) {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-primary-foreground-800">
          Extra Statutory Payments
        </h3>
        <span className="font-semibold text-lg">
          {formatCurrency(extraStatutoryPaymentsTotal, currency)}
        </span>
      </div>
      <Separator className="mb-3" />

      <div className="space-y-3 pl-2">
        {extraStatutoryPaymentsBreakdown.map((payment, index) => (
          <div key={index} className="flex justify-between items-start text-sm">
            <div className="flex items-start gap-2">
              <span>{payment.name}</span>
              <BasicTooltip
                content={
                  <>
                    <span>{payment.description}</span>
                    {payment.zendesk_article_url && (
                      <ZendeskDrawer
                        zendeskId={payment.zendesk_article_url
                          ?.split('/')
                          .pop()}
                        zendeskURL={payment.zendesk_article_url}
                        Trigger={
                          <button
                            onClick={() => {
                              const articleId = payment.zendesk_article_url
                                ?.split('/')
                                .pop();
                              router.setSearchParams({
                                articleId: articleId || '',
                              });
                            }}
                            className="text-blue-500 hover:underline block mt-1 text-xs bg-transparent border-none cursor-pointer p-0"
                          >
                            Learn more
                          </button>
                        }
                      />
                    )}
                  </>
                }
              >
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                  <Info className="h-3 w-3 text-gray-400" />
                  <span className="sr-only">Info</span>
                </Button>
              </BasicTooltip>
            </div>
            <span>{formatCurrency(payment.amount, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
