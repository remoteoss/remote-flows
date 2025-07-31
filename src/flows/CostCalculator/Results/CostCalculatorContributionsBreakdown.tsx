import { Info } from 'lucide-react';

import { BasicTooltip } from '@/src/components/ui/basic-tooltip';

import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { formatCurrency } from '@/src/lib/utils';
import { ZendeskDrawer } from '@/src/flows/CostCalculator/components/ZendeskDrawer';
import { useRouter } from '@/src/lib/router';

type CostCalculatorContributionsBreakdownProps = {
  contributionsTotal: number;
  currency: string;
  contributionsBreakdown:
    | {
        name: string;
        description: string | null;
        amount: number;
        zendesk_article_url: string | null;
      }[]
    | undefined;
};

export function CostCalculatorContributionsBreakdown({
  contributionsTotal,
  currency,
  contributionsBreakdown,
}: CostCalculatorContributionsBreakdownProps) {
  const router = useRouter();
  return (
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
                  <BasicTooltip
                    content={
                      <>
                        <span>{contribution.description}</span>
                        {contribution.zendesk_article_url && (
                          <ZendeskDrawer
                            zendeskId={contribution.zendesk_article_url
                              ?.split('/')
                              .pop()}
                            zendeskURL={contribution.zendesk_article_url}
                            Trigger={
                              <button
                                onClick={() => {
                                  const articleId =
                                    contribution.zendesk_article_url
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
                <span>{formatCurrency(contribution.amount, currency)}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
