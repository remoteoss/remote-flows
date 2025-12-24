import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@remoteoss/remote-flows/internals';
import {
  RadioGroup,
  RadioGroupItem,
  cn,
} from '@remoteoss/remote-flows/internals';
import { Check } from 'lucide-react';

interface PricingPlanCardProps {
  title: React.ReactNode;
  description: React.ReactNode;
  features: string[];
  selected?: boolean;
  onSelect?: () => void;
  value: string;
}

export function PricingPlanCard({
  title,
  description,
  features,
  onSelect,
  selected,
  value,
}: PricingPlanCardProps) {
  return (
    <Card
      className={cn(
        'px-4 py-4 border-dashed border-[#9AA6B2] cursor-pointer transition-all',
        selected && 'border-solid border-[#9AA6B2] ring-2 ring-[#9AA6B2]',
      )}
      onClick={onSelect}
    >
      <CardHeader className='pb-4'>
        <CardTitle className='text-xl font-bold'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className='border-t mt-4 pt-4'></div>
      </CardHeader>

      <CardContent>
        <ul className='space-y-3'>
          {features.map((feature, index) => (
            <li key={index} className='flex items-start gap-2'>
              <Check className='w-5 h-5 mt-0.5 shrink-0' />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className='pt-4'>
        <RadioGroup value={selected ? value : undefined} className='w-full'>
          <div className='flex items-center gap-2'>
            <RadioGroupItem value={value} id={value} />
            <label
              htmlFor={value}
              className='cursor-pointer text-sm font-medium'
            >
              Select plan
            </label>
          </div>
        </RadioGroup>
      </CardFooter>
    </Card>
  );
}
