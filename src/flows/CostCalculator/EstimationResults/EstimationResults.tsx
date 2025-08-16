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
import { Button } from '@/src/components/ui/button';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';

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
  hireNowLinkBtn: string;
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
            platform and completed self enrolment. 
            <ZendeskTriggerButton
              zendeskId="4411262104589"
              zendeskURL="https://support.remote.com/hc/en-us/articles/4411262104589-Employee-Onboarding-Timeline"
            >
              Learn more
            </ZendeskTriggerButton>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function HiringSection({
  className,
  countryBenefitsUrl,
  countryGuideUrl,
  hireNowLinkBtn,
}: {
  className?: string;
  countryBenefitsUrl: string;
  countryGuideUrl: string;
  hireNowLinkBtn: string;
}) {
  return (
    <Accordion type="single" collapsible className={cn('w-full', className)}>
      <AccordionItem value="timeline" className="border-border">
        <AccordionTrigger className="hover:no-underline px-0 py-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-base font-medium text-[#0F172A]">
              Hiring in France
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-1">
            <a
              href={countryGuideUrl}
              target="_blank"
              className="RemoteFlows__Link"
            >
              Explore our complete guide ↗
            </a>
            <a
              href={countryBenefitsUrl}
              target="_blank"
              className="RemoteFlows__Link"
            >
              Explore our available benefits ↗
            </a>
          </div>

          <Button
            variant="secondary"
            asChild
            className="RemoteFlows__EstimationResults__HireNowBtn mt-4"
          >
            <a href={hireNowLinkBtn}>Hire now</a>
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export const EstimationResults = ({
  estimation,
  title,
  hireNowLinkBtn,
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

        <HiringSection
          countryBenefitsUrl={estimation.country_benefits_details_url as string}
          countryGuideUrl={estimation.country_guide_url as string}
          className="RemoteFlows__EstimationResults__HiringSection"
          hireNowLinkBtn={hireNowLinkBtn}
        />
      </Card>
    </>
  );
};
