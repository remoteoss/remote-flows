import { MinimalCountry, MinimalRegion } from '@/src/client';
import { ActionsDropdown } from '@/src/components/shared/actions-dropdown/ActionsDropdown';
import { Card } from '@/src/components/ui/card';
import { ChevronDown, Info } from 'lucide-react';
import Flag from 'react-flagpack';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { cn, formatCurrency } from '@/src/lib/utils';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';
import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';
import { BasicTooltip } from '@/src/components/ui/basic-tooltip';
import { CostCalculatorEstimation } from '@/src/flows/CostCalculator/types';

const EstimationResultsHeader = ({
  title,
  country,
  region,
  annualGrossSalary,
  onDelete,
  onExportPdf,
  onEdit,
}: {
  title: string;
  country: MinimalCountry;
  region?: MinimalRegion;
  annualGrossSalary: string;
  onDelete: () => void;
  onExportPdf: () => void;
  onEdit: () => void;
}) => {
  const actions = [
    {
      label: 'Edit',
      onClick: onEdit,
    },
    {
      label: 'Export',
      onClick: onExportPdf,
    },
    {
      label: 'Delete',
      onClick: onDelete,
    },
  ];
  return (
    <div className='RemoteFlows__EstimationResults__Header flex justify-between'>
      <div className='flex flex-row items-center gap-6'>
        <div className='RemoteFlows__EstimationResultsHeader__FlagContainer flex h-16 w-16 items-center justify-center rounded-lg bg-[#F4F4F5]'>
          <Flag code={country.alpha_2_code} />
        </div>
        <div className='space-y-1'>
          <h2
            data-testid='estimation-results-header-title'
            className='RemoteFlows__EstimationResultsHeader__Title text-lg font-medium leading-none text-[#181818]'
          >
            {title}
          </h2>
          <p className='RemoteFlows__EstimationResultsHeader__Country text-xs text-[#71717A]'>
            {country.name} {region ? ` (${region.name})` : ''}
          </p>
          <p
            data-testid='estimation-results-header-annual-gross-salary'
            className='RemoteFlows__EstimationResultsHeader__AnnualGrossSalary text-xs text-[#71717A]'
          >
            <span className='text-[#181818]'>
              Employee annual gross salary:
            </span>{' '}
            {annualGrossSalary}
          </p>
        </div>
      </div>
      <ActionsDropdown
        label='Actions'
        className='RemoteFlows__EstimationResults__ActionsDropdown'
        actions={actions}
      />
    </div>
  );
};

interface OnboardingTimelineStep {
  title: string;
  description: string;
  id: string;
}

interface OnboardingTimelineData {
  steps: OnboardingTimelineStep[];
  helpText: string;
  zendeskArticleId?: number;
}

const getOnboardingTimelineData = (): OnboardingTimelineData => {
  return {
    steps: [
      {
        id: 'add-employment-details',
        title: 'Add employment details',
        description: 'You add employee employments details.',
      },
      {
        id: 'invite-employee',
        title: 'Invite employee',
        description:
          'Hire receives an email invitation from Remote to start the self-enrollment process.',
      },
      {
        id: 'verify-information',
        title: 'Verify information',
        description:
          'Remote prepares the Employment Agreement and verifies all the information.',
      },
      {
        id: 'sign-contract',
        title: 'Sign contract',
        description:
          'All parties sign the Employment Agreement and are ready to start. 🎉',
      },
    ],
    helpText:
      'For customers who accept our Terms of Service (ToS), the employee onboarding timeline starts once the employee has been invited to the platform and completed self enrolment.',
    zendeskArticleId: zendeskArticles.employeeOnboardingTimeline,
  };
};

function OnboardingTimeline({
  minimumOnboardingDays,
  data,
  className,
}: {
  minimumOnboardingDays: number | null;
  data: OnboardingTimelineData;
  className?: string;
}) {
  return (
    <Accordion
      type='single'
      collapsible
      className={cn(
        'RemoteFlows__EstimationResults__OnboardingTimeline w-full',
        className,
      )}
    >
      <AccordionItem
        value='timeline'
        className='RemoteFlows__OnboardingTimeline__AccordionItem border-border'
      >
        <AccordionTrigger className='RemoteFlows__OnboardingTimeline__AccordionTrigger hover:no-underline px-0 py-4'>
          <div className='flex items-center justify-between w-full'>
            <span className='RemoteFlows__OnboardingTimeline__Title text-base font-medium text-[#0F172A]'>
              Onboarding timeline
            </span>
            {minimumOnboardingDays != null && (
              <span className='RemoteFlows__OnboardingTimeline__Description text-base text-muted-foreground mr-4'>
                {minimumOnboardingDays} days
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className='px-0 pb-4'>
          <ul className='RemoteFlows__OnboardingTimeline__List list-disc list-inside space-y-2'>
            {data.steps.map((step) => (
              <li key={step.id}>
                <strong className='font-medium text-[#09090B]'>
                  {step.title}
                </strong>{' '}
                - {step.description}
              </li>
            ))}
          </ul>
          <p className='RemoteFlows__OnboardingTimeline__HelpText text-xs text-muted-foreground mt-4'>
            {data.helpText}
            {data.zendeskArticleId && (
              <ZendeskTriggerButton zendeskId={data.zendeskArticleId}>
                Learn more
              </ZendeskTriggerButton>
            )}
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
  country,
}: {
  className?: string;
  countryBenefitsUrl: string;
  countryGuideUrl: string;
  country: MinimalCountry;
}) {
  return (
    <Accordion
      type='single'
      collapsible
      className={cn(
        'RemoteFlows__EstimationResults__HiringSection w-full',
        className,
      )}
    >
      <AccordionItem
        value='timeline'
        className='RemoteFlows__HiringSection__AccordionItem border-border'
      >
        <AccordionTrigger className='RemoteFlows__HiringSection__AccordionTrigger hover:no-underline px-0 py-4'>
          <div className='flex items-center justify-between w-full'>
            <span className='text-base font-medium text-[#0F172A]'>
              Hiring in {country.name}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-1'>
            {countryGuideUrl && (
              <a
                href={countryGuideUrl}
                target='_blank'
                className='RemoteFlows__Link'
              >
                Explore our complete guide ↗
              </a>
            )}
            {countryBenefitsUrl && (
              <a
                href={countryBenefitsUrl}
                target='_blank'
                className='RemoteFlows__Link'
              >
                Explore our available benefits ↗
              </a>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function EstimationHeaders({
  isMultipleCurrency,
  className,
}: {
  isMultipleCurrency: boolean;
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
      {isMultipleCurrency ? (
        <>
          <span className='RemoteFlows__EstimationResults__Headers__Label'>
            Employee currency
          </span>
          <span className='RemoteFlows__EstimationResults__Headers__Label'>
            Employer currency
          </span>
        </>
      ) : (
        <>
          <span></span>
          <span className='RemoteFlows__EstimationResults__Headers__Label'>
            Amount
          </span>
        </>
      )}
    </div>
  );
}

function EstimationRow({
  label,
  amounts,
  className,
  children,
}: {
  label: string | React.ReactNode;
  amounts: string | string[];
  className?: string;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={cn('RemoteFlows__EstimationResults__Row', className)}>
      <div className='grid grid-cols-3 items-center'>
        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'RemoteFlows__EstimationRow__Title min-w-[140px] font-medium text-[#09090B]',
            )}
          >
            {label}
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='RemoteFlows__EstimationRow__CollapseButton p-1 hover:bg-gray-100 rounded'
          >
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {Array.isArray(amounts) ? (
          amounts.map((amount, index) => (
            <span
              key={index}
              className={cn(
                'RemoteFlows__EstimationRow__RegionalAmount text-right font-medium text-[#09090B]',
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
                'RemoteFlows__EstimationRow__EmployerAmount text-right font-medium text-[#09090B]',
              )}
            >
              {amounts}
            </span>
          </>
        )}
      </div>

      {/* Collapsible content */}
      {isOpen && children && (
        <div className='RemoteFlows__EstimationRow__CollapsibleContent mt-4'>
          {children}
        </div>
      )}
    </div>
  );
}

interface BreakdownItem {
  label: string;
  tooltip?: string;
  dataSelector?: string;
  regionalAmount?: string;
  employerAmount?: string;
  description?: string;
  zendeskId?: string;
  isCollapsible?: boolean;
  children?: BreakdownItem[];
}

function BreakdownListItem({
  item,
  isMultipleCurrency,
  level = 0,
}: {
  item: BreakdownItem;
  isMultipleCurrency: boolean;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isNested = level > 0;
  const isCollapsible = item.isCollapsible || hasChildren;

  return (
    <li
      className={cn(
        'RemoteFlows__BreakdownList__Item pb-3',
        isNested && 'pb-1',
      )}
    >
      <div
        className={cn(
          isMultipleCurrency
            ? 'grid grid-cols-3 items-center justify-between'
            : 'grid grid-cols-2 items-center justify-between',
        )}
      >
        <div className={cn('flex items-center gap-2', isNested && 'pl-3')}>
          {!isNested && (
            <span
              className='RemoteFlows__BreakdownList__Bullet w-1 h-1 bg-[#09090B] rounded-full flex-shrink-0'
              aria-hidden='true'
            />
          )}

          {isCollapsible ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='flex items-center gap-2 hover:bg-gray-100 rounded p-1'
            >
              <span
                className={cn(
                  isNested
                    ? 'RemoteFlows__BreakdownList__Text--Nested text-xs text-[#71717A]'
                    : 'RemoteFlows__BreakdownList__Text--NotNested text-sm text-[#09090B]',
                )}
              >
                {item.label}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          ) : (
            <span
              className={cn(
                isNested
                  ? 'RemoteFlows__BreakdownList__Text--Nested text-xs text-[#71717A]'
                  : 'RemoteFlows__BreakdownList__Text--NotNested text-sm text-[#09090B] p-1',
              )}
            >
              {item.label}
            </span>
          )}

          {item.tooltip && (
            <BasicTooltip
              content={
                <>
                  <span>{item.tooltip}</span>{' '}
                  {item.zendeskId && (
                    <ZendeskTriggerButton zendeskId={Number(item.zendeskId)}>
                      Learn more
                    </ZendeskTriggerButton>
                  )}
                </>
              }
            >
              <button className='RemoteFlows__BreakdownList__InfoButton p-1 hover:bg-gray-100 rounded'>
                <Info
                  className={cn(
                    'text-muted-foreground',
                    isNested ? 'h-3 w-3' : 'h-4 w-4',
                  )}
                />
              </button>
            </BasicTooltip>
          )}
        </div>

        {isMultipleCurrency ? (
          <>
            <span
              data-testid={
                item.dataSelector && item.dataSelector + '-employee-amount'
              }
              className={cn(
                'RemoteFlows__BreakdownList__RegionalAmountText text-sm text-right',
                isNested
                  ? 'RemoteFlows__BreakdownList__RegionalAmountText--Nested text-[#71717A]'
                  : 'RemoteFlows__BreakdownList__RegionalAmountText--NotNested text-[#09090B]',
              )}
            >
              {item.regionalAmount || '—'}
            </span>
            <span
              data-testid={
                item.dataSelector && item.dataSelector + '-employer-amount'
              }
              className={cn(
                'RemoteFlows__BreakdownList__EmployerAmountText text-sm text-right',
                isNested
                  ? 'RemoteFlows__BreakdownList__EmployerAmountText--Nested text-[#71717A]'
                  : 'RemoteFlows__BreakdownList__EmployerAmountText--NotNested text-[#09090B]',
              )}
            >
              {item.employerAmount || '—'}
            </span>
          </>
        ) : (
          <span
            data-testid={item.dataSelector}
            className={cn(
              'RemoteFlows__BreakdownList__RegionalAmountText text-sm text-right',
              isNested
                ? 'RemoteFlows__BreakdownList__RegionalAmountText--Nested text-[#71717A]'
                : 'RemoteFlows__BreakdownList__RegionalAmountText--NotNested text-[#09090B]',
            )}
          >
            {item.regionalAmount || '—'}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className='mt-1'>
          <BreakdownList
            items={item.children!}
            isMultipleCurrency={isMultipleCurrency}
            level={level + 1}
          />
        </div>
      )}
    </li>
  );
}

interface BreakdownListProps {
  items: BreakdownItem[];
  isMultipleCurrency: boolean;
  className?: string;
  level?: number;
}

function BreakdownList({
  items,
  isMultipleCurrency,
  className,
  level,
}: BreakdownListProps) {
  return (
    <ul className={cn('RemoteFlows__BreakdownList list-none', className)}>
      {items.map((item, index) => (
        <BreakdownListItem
          key={index}
          item={item}
          isMultipleCurrency={isMultipleCurrency}
          level={level}
        />
      ))}
    </ul>
  );
}

type EstimationResultsComponents = {
  HiringSection?: React.ComponentType<{
    country: MinimalCountry;
    countryBenefitsUrl: string;
    countryGuideUrl: string;
  }>;
  OnboardingTimeline?: React.ComponentType<{
    minimumOnboardingDays: number | null;
    data: OnboardingTimelineData;
  }>;
  Header?: React.ComponentType<{
    title: string;
    region?: MinimalRegion;
    country: MinimalCountry;
    onDelete: () => void;
    onExportPdf: () => void;
  }>;
  Footer?: React.ComponentType;
};

type EstimationResultsProps = {
  estimation: CostCalculatorEstimation;
  title: string;
  components?: EstimationResultsComponents;
  onDelete: () => void;
  onExportPdf: () => void;
  onEdit: () => void;
};

export const EstimationResults = ({
  estimation,
  title,
  components,
  onDelete,
  onExportPdf,
  onEdit,
}: EstimationResultsProps) => {
  const CustomHiringSection = components?.HiringSection || HiringSection;
  const CustomOnboardingTimeline =
    components?.OnboardingTimeline || OnboardingTimeline;
  const CustomHeader = components?.Header || EstimationResultsHeader;
  const CustomFooter = components?.Footer;

  const onboardingTimelineData = getOnboardingTimelineData();

  const isMultipleCurrency =
    estimation.employer_currency_costs.currency.code !==
    estimation.regional_currency_costs.currency.code;

  const hasManagementFee =
    estimation.employer_currency_costs.monthly_management_fee;

  const hasRegion = estimation.region.code !== estimation.country.code;

  const formattedSalary = formatCurrency(
    estimation.regional_currency_costs.annual_gross_salary,
    estimation.regional_currency_costs.currency.symbol,
  );

  return (
    <Card className='RemoteFlows__EstimationResults__Card p-10'>
      <div className='RemoteFlows__Separator'>
        <CustomHeader
          title={title}
          annualGrossSalary={formattedSalary}
          region={hasRegion ? estimation.region : undefined}
          country={estimation.country}
          onDelete={onDelete}
          onExportPdf={onExportPdf}
          onEdit={onEdit}
        />
      </div>
      <div className='RemoteFlows__Separator'>
        <EstimationHeaders
          isMultipleCurrency={isMultipleCurrency}
          className='mb-3'
        />
        <EstimationRow
          label='Monthly total cost'
          amounts={
            isMultipleCurrency
              ? [
                  formatCurrency(
                    estimation.regional_currency_costs.monthly_total,
                    estimation.regional_currency_costs.currency.symbol,
                  ),
                  formatCurrency(
                    estimation.employer_currency_costs.monthly_total,
                    estimation.employer_currency_costs.currency.symbol,
                  ),
                ]
              : formatCurrency(
                  estimation.regional_currency_costs.monthly_total,
                  estimation.regional_currency_costs.currency.symbol,
                )
          }
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
                zendeskId: zendeskArticles.extraPayments.toString(),
                tooltip:
                  'This country respects extra payments on top of the gross salary.',
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
                children:
                  estimation.employer_currency_costs.monthly_contributions_breakdown?.map(
                    (item, index) => {
                      return {
                        label: item.name,
                        regionalAmount: formatCurrency(
                          estimation.regional_currency_costs
                            .monthly_contributions_breakdown?.[index]?.amount,
                          estimation.regional_currency_costs.currency.symbol,
                        ),
                        employerAmount: formatCurrency(
                          item.amount,
                          estimation.employer_currency_costs.currency.symbol,
                        ),
                        zendeskId: item.zendesk_article_id || undefined,
                        tooltip: item.description || undefined,
                      };
                    },
                  ) || [],
              },
              {
                label: 'Core benefits',
                regionalAmount: formatCurrency(
                  estimation.regional_currency_costs.monthly_benefits_total,
                  estimation.regional_currency_costs.currency.symbol,
                ),
                employerAmount: formatCurrency(
                  estimation.employer_currency_costs.monthly_benefits_total,
                  estimation.employer_currency_costs.currency.symbol,
                ),
                children:
                  estimation.employer_currency_costs.monthly_benefits_breakdown?.map(
                    (item, index) => ({
                      label: item.name,
                      regionalAmount: formatCurrency(
                        estimation.regional_currency_costs
                          .monthly_benefits_breakdown?.[index]?.amount,
                        estimation.regional_currency_costs.currency.symbol,
                      ),
                      employerAmount: formatCurrency(
                        item.amount,
                        estimation.employer_currency_costs.currency.symbol,
                      ),
                      zendeskId: item.zendesk_article_id || undefined,
                      tooltip: item.description || undefined,
                    }),
                  ) || [],
              },
              ...(hasManagementFee
                ? [
                    {
                      label: 'Management fee',
                      regionalAmount: formatCurrency(
                        estimation.regional_currency_costs
                          .monthly_management_fee,
                        estimation.regional_currency_costs.currency.symbol,
                      ),
                      employerAmount: formatCurrency(
                        estimation.employer_currency_costs
                          .monthly_management_fee,
                        estimation.employer_currency_costs.currency.symbol,
                      ),
                      tooltip:
                        'Discounts may be available based on your commitment and team size. Speak to your account or customer success manager to learn more.',
                    },
                  ]
                : []),
            ]}
            isMultipleCurrency={isMultipleCurrency}
          />
        </EstimationRow>
      </div>
      <div className='RemoteFlows__Separator'>
        <EstimationRow
          label='Annual total cost'
          amounts={
            isMultipleCurrency
              ? [
                  formatCurrency(
                    estimation.regional_currency_costs.annual_total,
                    estimation.regional_currency_costs.currency.symbol,
                  ),
                  formatCurrency(
                    estimation.employer_currency_costs.annual_total,
                    estimation.employer_currency_costs.currency.symbol,
                  ),
                ]
              : formatCurrency(
                  estimation.regional_currency_costs.annual_total,
                  estimation.regional_currency_costs.currency.symbol,
                )
          }
        >
          <BreakdownList
            items={[
              {
                label: 'Annual gross salary',
                dataSelector: 'annual-gross-salary',
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
                  estimation.regional_currency_costs.annual_contributions_total,
                  estimation.regional_currency_costs.currency.symbol,
                ),
                employerAmount: formatCurrency(
                  estimation.employer_currency_costs.annual_contributions_total,
                  estimation.employer_currency_costs.currency.symbol,
                ),
                children:
                  estimation.employer_currency_costs.annual_contributions_breakdown?.map(
                    (item, index) => ({
                      label: item.name,
                      regionalAmount: formatCurrency(
                        estimation.regional_currency_costs
                          .annual_contributions_breakdown?.[index]?.amount,
                        estimation.regional_currency_costs.currency.symbol,
                      ),
                      employerAmount: formatCurrency(
                        item.amount,
                        estimation.employer_currency_costs.currency.symbol,
                      ),
                      zendeskId: item.zendesk_article_id || undefined,
                      tooltip: item.description || undefined,
                    }),
                  ) || [],
              },
              {
                label: 'Core benefits',
                regionalAmount: formatCurrency(
                  estimation.regional_currency_costs.annual_benefits_total,
                  estimation.regional_currency_costs.currency.symbol,
                ),
                employerAmount: formatCurrency(
                  estimation.employer_currency_costs.annual_benefits_total,
                  estimation.employer_currency_costs.currency.symbol,
                ),
                children:
                  estimation.employer_currency_costs.annual_benefits_breakdown?.map(
                    (item, index) => ({
                      label: item.name,
                      regionalAmount: formatCurrency(
                        estimation.regional_currency_costs
                          .annual_benefits_breakdown?.[index]?.amount,
                        estimation.regional_currency_costs.currency.symbol,
                      ),
                      employerAmount: formatCurrency(
                        item.amount,
                        estimation.employer_currency_costs.currency.symbol,
                      ),
                      zendeskId: item.zendesk_article_id || undefined,
                      tooltip: item.description || undefined,
                    }),
                  ) || [],
              },
              {
                label: 'Extra statutory payments',
                regionalAmount: formatCurrency(
                  estimation.regional_currency_costs
                    .extra_statutory_payments_total,
                  estimation.regional_currency_costs.currency.symbol,
                ),
                employerAmount: formatCurrency(
                  estimation.employer_currency_costs
                    .extra_statutory_payments_total,
                  estimation.employer_currency_costs.currency.symbol,
                ),
                children:
                  estimation.employer_currency_costs.extra_statutory_payments_breakdown?.map(
                    (item, index) => ({
                      label: item.name,
                      regionalAmount: formatCurrency(
                        estimation.regional_currency_costs
                          .extra_statutory_payments_breakdown?.[index]?.amount,
                        estimation.regional_currency_costs.currency.symbol,
                      ),
                      employerAmount: formatCurrency(
                        item.amount,
                        estimation.employer_currency_costs.currency.symbol,
                      ),
                      zendeskId: item.zendesk_article_id || undefined,
                      tooltip: item.description || undefined,
                    }),
                  ) || [],
              },
              ...(hasManagementFee
                ? [
                    {
                      label: 'Management fee',
                      regionalAmount: formatCurrency(
                        estimation.regional_currency_costs
                          .annual_management_fee,
                        estimation.regional_currency_costs.currency.symbol,
                      ),
                      employerAmount: formatCurrency(
                        estimation.employer_currency_costs
                          .annual_management_fee,
                        estimation.employer_currency_costs.currency.symbol,
                      ),
                      tooltip:
                        'Discounts may be available based on your commitment and team size. Speak to your account or customer success manager to learn more.',
                    },
                  ]
                : []),
            ]}
            isMultipleCurrency={isMultipleCurrency}
          />
        </EstimationRow>
      </div>
      <div className='RemoteFlows__Separator'>
        <CustomOnboardingTimeline
          minimumOnboardingDays={estimation.minimum_onboarding_time}
          data={onboardingTimelineData}
        />
      </div>

      <CustomHiringSection
        countryBenefitsUrl={estimation.country_benefits_details_url as string}
        countryGuideUrl={estimation.country_guide_url as string}
        country={estimation.country}
      />

      {CustomFooter && <CustomFooter />}
    </Card>
  );
};
