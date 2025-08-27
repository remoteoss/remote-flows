import { formatCurrency } from '@/src/lib/utils';

type CostCalculatorTotalCostProps = {
  totalCost: number;
  currency: string;
};

export function CostCalculatorTotalCost({
  totalCost,
  currency,
}: CostCalculatorTotalCostProps) {
  return (
    <div className='pt-2 mt-4 border-t-2 border-gray-200'>
      <div className='flex justify-between items-center'>
        <h3 className='font-bold text-primary-foreground-800'>Total Cost</h3>
        <span className='font-bold text-xl'>
          {formatCurrency(totalCost, currency)}
        </span>
      </div>
    </div>
  );
}
