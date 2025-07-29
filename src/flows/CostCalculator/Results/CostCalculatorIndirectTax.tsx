import { Separator } from '@/src/components/ui/separator';
import { formatCurrency } from '@/src/lib/utils';

type CostCalculatorIndirectTaxProps = {
  indirectTax: number;
  currency: string;
};

export function CostCalculatorIndirectTax({
  indirectTax,
  currency,
}: CostCalculatorIndirectTaxProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-primary-foreground">Indirect Tax</h3>
        <span className="font-semibold text-lg">
          {formatCurrency(indirectTax, currency)}
        </span>
      </div>
      <Separator />
    </div>
  );
}
