import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@remoteoss/remote-flows/internals';
import {
  onboardingWorkflows,
  corProductIdentifier,
  contractorStandardProductIdentifier,
  contractorPlusProductIdentifier,
  pricingPlanDetails,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import { CheckIcon, ChevronRight } from 'lucide-react';

export const EngagingContractorsModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className='text-blue-600 hover:underline'>
          Guide to engaging contractors ↗
        </button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>How this plan works</DialogTitle>
          <DialogDescription>
            Here's what happens next once you select this pricing plan
          </DialogDescription>
        </DialogHeader>

        {/* Workflow steps list */}
        <div className='py-4'>
          <ol className='space-y-3'>
            {onboardingWorkflows[corProductIdentifier].map((step, index) => (
              <li key={step.id} className='flex gap-3'>
                <span className='flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-semibold'>
                  {index + 1}
                </span>
                <div className='flex-1'>
                  <p className='font-medium text-sm'>{step.title}</p>
                  {step.description && (
                    <p className='text-xs text-gray-600 mt-1'>
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <DialogFooter>
          <button className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const PricingPlanOptionsModal = () => {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(
    contractorStandardProductIdentifier,
  );

  const planIds = [
    contractorStandardProductIdentifier,
    contractorPlusProductIdentifier,
    corProductIdentifier,
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='link'>Read more</Button>
      </DialogTrigger>

      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-green-700'>
            Pricing plan options
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {planIds.map((planId: string) => {
            const plan =
              pricingPlanDetails[planId as keyof typeof pricingPlanDetails];
            const isExpanded = expandedPlan === planId;

            return (
              <div key={planId} className='border rounded-lg p-4'>
                {/* Header - always visible */}
                <button
                  onClick={() => setExpandedPlan(isExpanded ? null : planId)}
                  className='w-full flex items-start gap-3 text-left'
                >
                  {/* Chevron icon */}
                  <ChevronRight
                    className={`flex-shrink-0 w-5 h-5 mt-1 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />

                  <div className='flex-1'>
                    <div className='flex items-start justify-between gap-4'>
                      <div>
                        <h3 className='font-semibold text-gray-900'>
                          {plan.title}
                        </h3>
                        <p className='text-sm text-gray-600 mt-1'>
                          {plan.subtitle}
                        </p>
                      </div>

                      {/* Contract pill badge */}
                      <span className='flex-shrink-0 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full'>
                        {plan.contractPillText}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded content - bullet list with checkmarks */}
                {isExpanded && (
                  <div className='mt-4 ml-8 space-y-2'>
                    {plan.listItems.map((item, index) => (
                      <div key={index} className='flex gap-2'>
                        <CheckIcon className='flex-shrink-0 w-5 h-5 text-green-600 mt-0.5' />
                        <p className='text-sm text-gray-700'>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
