import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cn,
} from '@remoteoss/remote-flows/internals';
import { ZendeskTriggerButton, zendeskArticles } from '@remoteoss/remote-flows';
import { Check } from 'lucide-react';

interface PricingPlanCardProps {
  title: React.ReactNode;
  description: React.ReactNode;
  features: string[];
  selected?: boolean;
  onSelect?: (value: string) => void;
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
      onClick={() => {
        onSelect?.(value);
      }}
    >
      <CardHeader className='pb-4'>
        <CardTitle className='text-xl font-bold'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div>
          <ZendeskTriggerButton zendeskId={zendeskArticles.pricingPlanOptions}>
            Read more ↗
          </ZendeskTriggerButton>
        </div>
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
        <div className='flex items-center gap-3 w-full'>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: `2px solid ${selected ? '#9AA6B2' : '#D1D5DB'}`,
              backgroundColor: selected ? '#9AA6B2' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {selected && (
              <Check
                className='text-white'
                style={{ width: '12px', height: '12px' }}
              />
            )}
          </div>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: selected ? '#364452' : '#6B7280',
            }}
          >
            Select plan
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
