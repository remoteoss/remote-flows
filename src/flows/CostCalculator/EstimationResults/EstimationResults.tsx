import { CostCalculatorEmployment } from '@/src/client';
import { ActionsDropdown } from '@/src/components/shared/actions-dropdown/ActionsDropdown';
import { Card } from '@/src/components/ui/card';
import { ChevronDown, User } from 'lucide-react';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { cn, formatCurrency } from '@/src/lib/utils';
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

function EstimationHeaders({
  moreThanOneCurrency,
  className,
}: {
  moreThanOneCurrency: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'RemoteFlows__EstimationResults__Headers grid grid-cols-3 items-center',
        className,
      )}
    >
      <span aria-hidden />
      {moreThanOneCurrency ? (
        <>
          <span className="text-sm text-[#27272A] text-right">
            Employee currency
          </span>
          <span className="text-sm text-[#27272A] text-right">
            Employer currency
          </span>
        </>
      ) : (
        <>
          <span></span>
          <span className="text-sm text-[#27272A] text-right">Amount</span>
        </>
      )}
    </div>
  );
}

function EstimationRow({
  label,
  amounts,
  className,
  isHeader = false,
  isCollapsible = false,
  children,
}: {
  label: string | React.ReactNode;
  amounts: string | string[];
  className?: string;
  isHeader?: boolean;
  isCollapsible?: boolean;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={cn('RemoteFlows__EstimationResults__Row', className)}>
      <div className="grid grid-cols-3 items-center">
        <div className="flex items-center gap-2">
          <span className={cn('min-w-[140px]', isHeader ? 'font-medium' : '')}>
            {label}
          </span>
          {isCollapsible && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>

        {Array.isArray(amounts) ? (
          amounts.map((amount, index) => (
            <span
              key={index}
              className={cn(
                'text-right',
                isHeader ? 'font-medium text-[#09090B]' : '',
              )}
            >
              {amount}
            </span>
          ))
        ) : (
          <>
            <span></span>
            <span
              className={cn(
                'text-right',
                isHeader ? 'font-medium text-[#09090B]' : '',
              )}
            >
              {amounts}
            </span>
          </>
        )}
      </div>

      {/* Collapsible content */}
      {isCollapsible && isOpen && children && (
        <div className="mt-4">{children}</div>
      )}
    </div>
  );
}

interface BreakdownItem {
  label: string;
  regionalAmount?: string;
  employerAmount?: string;
  amount?: string; // For single currency
  description?: string;
  zendeskId?: string;
  zendeskURL?: string;
  isCollapsible?: boolean;
  children?: BreakdownItem[]; // Nested breakdown items
}

function BreakdownListItem({
  item,
  moreThanOneCurrency,
  level = 0,
}: {
  item: BreakdownItem;
  moreThanOneCurrency: boolean;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const indentClass = level > 0 ? `pl-${6 + level * 4}` : '';

  return (
    <li className="pb-3">
      <div
        className={cn(
          moreThanOneCurrency
            ? 'grid grid-cols-3 items-center justify-between'
            : 'grid grid-cols-2 items-center justify-between',
          indentClass,
        )}
      >
        {/* Bullet + Label + Buttons - takes remaining space */}
        <div className="flex items-center gap-2">
          <span
            className="w-1 h-1 bg-[#09090B] rounded-full flex-shrink-0"
            aria-hidden="true"
          ></span>
          <span className="text-sm text-[#09090B]">{item.label}</span>

          {/* Zendesk trigger if available */}
          {item.zendeskId && item.zendeskURL && (
            <ZendeskTriggerButton
              zendeskId={item.zendeskId}
              zendeskURL={item.zendeskURL}
              className="text-xs"
            />
          )}

          {/* Collapsible chevron for nested items */}
          {(item.isCollapsible || hasChildren) && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* Amounts - separate columns for dual currency */}
        {moreThanOneCurrency ? (
          <>
            <span className="text-sm text-right text-[#09090B]">
              {item.regionalAmount || '—'}
            </span>
            <span className="text-sm text-right text-[#09090B]">
              {item.employerAmount || '—'}
            </span>
          </>
        ) : (
          <span className="text-sm text-right text-[#09090B]">
            {item.amount || '—'}
          </span>
        )}
      </div>

      {/* Nested breakdown items */}
      {hasChildren && isOpen && (
        <div className="mt-2">
          <BreakdownList
            items={item.children!}
            moreThanOneCurrency={moreThanOneCurrency}
            level={level + 1}
          />
        </div>
      )}

      {/* Description if available */}
      {item.description && isOpen && (
        <div
          className={cn('mt-1 text-xs text-muted-foreground ml-6', indentClass)}
        >
          {item.description}
        </div>
      )}
    </li>
  );
}

interface BreakdownListProps {
  items: BreakdownItem[];
  moreThanOneCurrency: boolean;
  className?: string;
  level?: number; // For nested indentation
}

function BreakdownList({
  items,
  moreThanOneCurrency,
  className,
  level,
}: BreakdownListProps) {
  return (
    <ul className={cn('list-none', className)}>
      {items.map((item, index) => (
        <BreakdownListItem
          key={index}
          item={item}
          moreThanOneCurrency={moreThanOneCurrency}
          level={level}
        />
      ))}
    </ul>
  );
}

export const EstimationResults = ({
  estimation,
  title,
  hireNowLinkBtn,
}: EstimationResultsProps) => {
  const moreThanOneCurrency =
    estimation.employer_currency_costs.currency.code !==
    estimation.regional_currency_costs.currency.code;

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
          <EstimationHeaders
            moreThanOneCurrency={moreThanOneCurrency}
            className="mb-3"
          />
          <EstimationRow
            label="Monthly total cost"
            amounts={[
              formatCurrency(
                estimation.regional_currency_costs.monthly_total,
                estimation.regional_currency_costs.currency.symbol,
              ),
              formatCurrency(
                estimation.employer_currency_costs.monthly_total,
                estimation.employer_currency_costs.currency.symbol,
              ),
            ]}
            isHeader
            isCollapsible
          >
            <BreakdownList
              items={[
                {
                  label: 'Gross monthly salary',
                  regionalAmount: formatCurrency(
                    estimation.regional_currency_costs.monthly_gross_salary,
                    estimation.regional_currency_costs.currency.symbol,
                  ),
                  employerAmount: formatCurrency(
                    estimation.employer_currency_costs.monthly_gross_salary,
                    estimation.employer_currency_costs.currency.symbol,
                  ),
                },
                {
                  label: 'Mandatory employer costs',
                  regionalAmount: formatCurrency(
                    estimation.regional_currency_costs
                      .monthly_contributions_total,
                    estimation.regional_currency_costs.currency.symbol,
                  ),
                  employerAmount: formatCurrency(
                    estimation.employer_currency_costs
                      .monthly_contributions_total,
                    estimation.employer_currency_costs.currency.symbol,
                  ),
                },
              ]}
              moreThanOneCurrency={moreThanOneCurrency}
            />
          </EstimationRow>
        </div>
        <div className="border-b border-[#E4E4E7] pb-6">
          <EstimationRow
            label="Annual total cost"
            amounts={[
              formatCurrency(
                estimation.regional_currency_costs.annual_total,
                estimation.regional_currency_costs.currency.symbol,
              ),
              formatCurrency(
                estimation.employer_currency_costs.annual_total,
                estimation.employer_currency_costs.currency.symbol,
              ),
            ]}
            isHeader
            isCollapsible
          >
            <BreakdownList
              items={[
                {
                  label: 'Annual gross salary',
                  regionalAmount: formatCurrency(
                    estimation.regional_currency_costs.annual_gross_salary,
                    estimation.regional_currency_costs.currency.symbol,
                  ),
                  employerAmount: formatCurrency(
                    estimation.employer_currency_costs.annual_gross_salary,
                    estimation.employer_currency_costs.currency.symbol,
                  ),
                },
                {
                  label: 'Mandatory employer costs',
                  regionalAmount: formatCurrency(
                    estimation.regional_currency_costs
                      .monthly_contributions_total,
                    estimation.regional_currency_costs.currency.symbol,
                  ),
                  employerAmount: formatCurrency(
                    estimation.employer_currency_costs
                      .monthly_contributions_total,
                    estimation.employer_currency_costs.currency.symbol,
                  ),
                },
              ]}
              moreThanOneCurrency={moreThanOneCurrency}
            />
          </EstimationRow>
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
