import { CostCalculatorEmployment } from '@/src/client';
import { ActionsDropdown } from '@/src/components/shared/actions-dropdown/ActionsDropdown';
import { Card } from '@/src/components/ui/card';
import { User } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { cn } from '@/src/lib/utils';

const EstimationResultsHeader = ({
  title,
  country,
}: {
  title: string;
  country: string;
}) => {
  return (
    <div className="RemoteFlows__EstimationResults__Header flex justify-between">
      <div className="flex flex-row items-center gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F4F4F5]">
          <User className="h-6 w-6 text-[#000000]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium leading-none text-[#181818]">
            {title}
          </h2>
          <p className="text-xs text-[#71717A]">{country}</p>
        </div>
      </div>
      <ActionsDropdown
        className="RemoteFlows__EstimationResults__ActionsDropdown"
        actions={[
          {
            label: 'Edit',
            onClick: () => {},
            disabled: true,
          },
          {
            label: 'Export',
            onClick: () => {},
            disabled: true,
          },
          {
            label: 'Delete',
            onClick: () => {},
            disabled: true,
          },
        ]}
      />
    </div>
  );
};

type EstimationResultsProps = {
  estimation: CostCalculatorEmployment;
  title: string;
};

function OnboardingTimeline({
  minimumOnboardingDays,
  className,
}: {
  minimumOnboardingDays: number | null;
  className?: string;
}) {
  return (
    <Accordion type="single" collapsible className={cn('w-full', className)}>
      <AccordionItem value="timeline" className="border-border">
        <AccordionTrigger className="hover:no-underline px-0 py-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-base font-medium text-[#0F172A]">
              Onboarding timeline
            </span>
            <span className="text-base text-muted-foreground mr-4">
              {minimumOnboardingDays} days
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-0 pb-4">
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="font-medium text-[#09090B]">
                Add employment details
              </strong>{' '}
              - You add employee employments details.
            </li>
            <li>
              <strong className="font-medium text-[#09090B]">
                Invite employee 
              </strong>{' '}
              - Hire receives an email invitation from Remote to start the
              self-enrollment process.
            </li>
            <li>
              <strong className="font-medium text-[#09090B]">
                Verify information 
              </strong>{' '}
              - Remote prepares the Employment Agreement and verifies all the
              information.
            </li>
            <li>
              <strong className="font-medium text-[#09090B]">
                Sign contract 
              </strong>{' '}
              - All parties sign the Employment Agreement and are ready to
              start. 🎉
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            For customers who accept our Terms of Service (ToS), the employee
            onboarding timeline starts once the employee has been invited to the
            platform and completed self enrolment. <a href="#">Learn more</a>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export const EstimationResults = ({
  estimation,
  title,
}: EstimationResultsProps) => {
  return (
    <>
      <Card className="RemoteFlows__EstimationResults__Card p-10">
        <div className="border-b border-[#E4E4E7] pb-6">
          <EstimationResultsHeader
            title={title}
            country={estimation.country.name}
          />
        </div>
        <div className="border-b border-[#E4E4E7] pb-6">
          <OnboardingTimeline
            className="RemoteFlows__EstimationResults__OnboardingTimeline"
            minimumOnboardingDays={estimation.minimum_onboarding_time}
          />
        </div>
      </Card>
    </>
  );
};
