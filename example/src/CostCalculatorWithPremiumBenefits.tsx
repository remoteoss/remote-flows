import type {
  $TSFixMe,
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationSubmitValues,
  EstimationError,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorResults,
  CostCalculatorSubmitButton,
  useCostCalculatorEstimationPdf,
  EstimationResults,
} from '@remoteoss/remote-flows';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Card,
  ZendeskTriggerButton,
} from '@remoteoss/remote-flows/internals';
import Flag from 'react-flagpack';
import { ButtonHTMLAttributes, Fragment, useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { components } from './Components';
import './css/main.css';
import './css/premium-benefits.css';
import './css/utils.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
  includePremiumBenefits: true,
  enableCurrencyConversion: true,
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="premium-benefits-wrapper">
      <div className="premium-benefits-container">{children}</div>
    </div>
  );
};

const Header = ({
  title = 'Cost calculator',
  description = 'Estimate the cost to hire someone through Remote',
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="premium-benefits-header">
      <h1>{title}</h1>
      <p>{description}</p>
      <ZendeskTriggerButton
        className="text-sm"
        zendeskId="4668194326797"
        zendeskURL="https://support.remote.com/hc/en-us/articles/4668194326797-Disclaimer-information-on-Cost-of-Employment-calculations"
      >
        Learn more ↗
      </ZendeskTriggerButton>
    </div>
  );
};

const AddEstimateButton = ({
  buttonProps,
  onSubmit,
  onError,
  onSuccess,
  isDrawerOpen,
  setIsDrawerOpen,
}: {
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimateResponse) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
}) => {
  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button
          className="premium-benefits-action-toolbar__button premium-benefits-action-toolbar__button--primary"
          {...buttonProps}
        >
          Add estimate
        </button>
      </DrawerTrigger>
      <DrawerContent showHandle={false} className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="hidden">
          <DrawerTitle className="hidden">Add estimate</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto">
          <Layout>
            <div className="mt-10 mb-8">
              <Header
                title="Add estimate"
                description="Estimate the cost of another hire through Remote"
              />
            </div>
            <AddEstimateForm
              onSubmit={onSubmit}
              onError={onError}
              onSuccess={onSuccess}
            />
          </Layout>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const ActionToolbar = ({
  onReset,
  onExportPdf,
  onCSVExport,
  onAddEstimate,
  onSavePayload,
}: {
  onReset: () => void;
  onExportPdf: () => void;
  onCSVExport: () => void;
  onAddEstimate: (estimation: CostCalculatorEstimateResponse) => void;
  onSavePayload: (estimation: CostCalculatorEstimationSubmitValues) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card direction="row" className="justify-around">
      <div>
        <button
          className="premium-benefits-action-toolbar__button"
          onClick={onReset}
        >
          Reset estimate
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className="premium-benefits-action-toolbar__button premium-benefits-action-toolbar__button--secondary"
          onClick={onCSVExport}
          disabled
        >
          Export as CSV
        </button>
        <button
          className="premium-benefits-action-toolbar__button premium-benefits-action-toolbar__button--secondary"
          onClick={onExportPdf}
        >
          Export as PDF
        </button>
        <AddEstimateButton
          isDrawerOpen={isOpen}
          setIsDrawerOpen={setIsOpen}
          onSubmit={(payload) => {
            onSavePayload(payload);
          }}
          onError={() => {}}
          onSuccess={(estimation) => {
            onAddEstimate(estimation);
            setIsOpen(false);
          }}
        />
      </div>
    </Card>
  );
};

const AddEstimateForm = ({
  onSubmit,
  onError,
  onSuccess,
}: {
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimateResponse) => void;
}) => {
  return (
    <CostCalculatorFlow
      estimationOptions={estimationOptions}
      options={{
        jsfModify: {
          fields: {
            country: {
              title: 'Employee country',
              description:
                'Select the country where the employee will primarily live and work',
            },
            currency: {
              title: 'Employer billing currency',
              description: (
                <>
                  Select the currency you want to be invoiced in for this
                  employee's services.
                  <ZendeskTriggerButton
                    className="text-sm"
                    zendeskId="4410698586893"
                    zendeskURL="https://support.remote.com/hc/en-us/articles/4410698586893-Do-you-have-international-pricing"
                  >
                    Learn more ↗
                  </ZendeskTriggerButton>
                </>
              ),
            },
            salary: {
              title: "Employee's annual salary",
              description:
                "We will use your selected billing currency, but you can also convert it to the employee's local currency.",
            },
          },
        },
      }}
      render={(props) => {
        if (props.isLoading) {
          return <div>Loading...</div>;
        }

        return (
          <Card>
            <CostCalculatorForm
              onSubmit={onSubmit}
              onError={onError}
              onSuccess={onSuccess}
            />
            <div className="flex justify-center mt-10">
              <CostCalculatorSubmitButton
                className="submit-button"
                disabled={props.isSubmitting}
              >
                Get estimate
              </CostCalculatorSubmitButton>
            </div>
          </Card>
        );
      }}
    />
  );
};

const InitialForm = ({
  onSubmit,
  onError,
  onSuccess,
}: {
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimateResponse) => void;
}) => {
  return (
    <>
      <Header />
      <AddEstimateForm
        onSubmit={onSubmit}
        onError={onError}
        onSuccess={onSuccess}
      />
    </>
  );
};

const ResultsView = ({
  estimations,
  onExportPdf,
  onReset,
  onAddEstimate,
  onSavePayload,
}: {
  estimations: CostCalculatorEstimateResponse[];
  onExportPdf: () => void;
  onReset: () => void;
  onAddEstimate: (estimation: CostCalculatorEstimateResponse) => void;
  onSavePayload: (estimation: CostCalculatorEstimationSubmitValues) => void;
}) => {
  if (!estimations) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="mb-8">
        <ActionToolbar
          onReset={onReset}
          onExportPdf={onExportPdf}
          onCSVExport={() => {}}
          onAddEstimate={onAddEstimate}
          onSavePayload={onSavePayload}
        />
      </div>
      {estimations.map((estimation, index) => {
        const primaryEmployment = estimation.data.employments?.[0];
        const country = primaryEmployment?.country;

        console.log({ estimation: estimation.data });

        return (
          <Fragment key={index}>
            {country && (
              <div className="mt-4 mb-2 flex gap-2">
                <Flag
                  code={estimation.data.employments?.[0].country.alpha_2_code}
                />
                <label className="text-md font-bold">
                  {estimation.data.employments?.[0].country.name}
                </label>
              </div>
            )}
            <CostCalculatorResults employmentData={estimation.data} />
            {Array.isArray(estimation.data.employments) &&
              estimation.data.employments.length > 0 && (
                <EstimationResults
                  estimation={estimation.data.employments?.[0]}
                  title={`Estimate #${index + 1}`}
                  hireNowLinkBtn={'#'}
                />
              )}
          </Fragment>
        );
      })}
    </>
  );
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] = useState<
    CostCalculatorEstimateResponse[]
  >([]);
  const [payload, setPayload] = useState<
    CostCalculatorEstimationSubmitValues[]
  >([]);

  const onReset = () => {
    setEstimations([]);
  };

  const onAddEstimate = (estimation: CostCalculatorEstimateResponse) => {
    setEstimations([...estimations, estimation]);
  };

  const onSavePayload = (estimation: CostCalculatorEstimationSubmitValues) => {
    setPayload([...payload, estimation]);
  };

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(
        buildCostCalculatorEstimationPayload(payload, estimationOptions),
        {
          onSuccess: (response) => {
            if (response?.data?.data?.content !== undefined) {
              const a = document.createElement('a');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              a.href = response.data.data.content as any;
              a.download = 'estimation.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          },
          onError: (error) => {
            console.error({ error });
          },
        },
      );
    }
  };
  return (
    <Layout>
      {estimations.length === 0 ? (
        <InitialForm
          onSubmit={(payload) => {
            setPayload([payload]);
          }}
          onError={(error) => console.error({ error })}
          onSuccess={(response) => {
            setEstimations([response]);
          }}
        />
      ) : (
        <ResultsView
          estimations={estimations}
          onExportPdf={handleExportPdf}
          onReset={onReset}
          onAddEstimate={onAddEstimate}
          onSavePayload={onSavePayload}
        />
      )}
    </Layout>
  );
}

export function CostCalculatorWithPremiumBenefits() {
  const estimation: $TSFixMe = {
    data: {
      employments: [
        {
          country: {
            code: 'ESP',
            name: 'Spain',
            slug: 'spain-65764d0d-94d9-49df-8c07-c9da8e757f67',
            alpha_2_code: 'ES',
          },
          region: {
            code: 'ESP',
            name: 'Spain',
            status: 'active',
            country: {
              code: 'ESP',
              name: 'Spain',
              currency: {
                code: 'EUR',
                name: 'European Euro',
                symbol: '€',
                slug: 'a9635cae-5c4b-438b-b34f-bfb80946036e',
              },
              slug: 'spain-65764d0d-94d9-49df-8c07-c9da8e757f67',
              alpha_2_code: 'ES',
            },
            slug: 'bf953194-00ea-4ebd-9655-7c2b9d73432a',
            child_regions: [],
            parent_region: null,
          },
          country_benefits_details_url:
            'https://remote.com/benefits-guide/spain',
          country_guide_url:
            'https://remote.com/country-hiring-considerations#spain',
          employer_currency_costs: {
            currency: {
              code: 'USD',
              name: 'United States Dollar',
              symbol: '$',
              slug: '1b2c181d-24c9-44ff-a8e1-2a7025ca491c',
            },
            annual_gross_salary: 5999110,
            annual_benefits_breakdown: [
              {
                name: 'Retirement Benefit',
                description:
                  'Optional retirement matching plan:\n\nBasic: Employee contributions only, no company match.\nStandard: 3% total with 2% from the company and 1% from the employee.\nPlus: 6% total with 4% from the company and 2% from the employee.\nPremium: 9% total with 6% from the company and 3% from the employee.\nPlatinum: 12% total with 8% from the company and 4% from the employee.',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Medical Insurance',
                description:
                  'Optional local health insurance is available through Sanitas, starting at €43.88/month for the Standard Plan and €62.15/month for the Premium Plan.\n\nInternational health insurance is also offered through Allianz, starting at $123.17 USD/month for the Standard Plan. Premium, Gold, and Platinum plans are also available.\n\nYou can choose coverage for the employee only or extend it to include family members.',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
            ],
            annual_benefits_total: 0,
            annual_contributions_breakdown: [
              {
                name: 'Mandatory Occupational Health Cost (incl. annual surveillance fee)',
                description:
                  'Calculated at 69EUR annually on top of the salary. The cost consists of health check fees: 58EUR and Annual surveillance fee: 11EUR',
                amount: 8280,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Cobee customer cost',
                description:
                  'Cobee has a monthly cost for the client of 4,5EUR per employee',
                amount: 6480,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 1',
                description:
                  'Calculated at 0.7672% (0.92% * 83.39% borne by the employer) of the salary exceeding the max contribution base (4,909.50 EUR per month) up to 10% above the max contribution base (5,400.45 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 2',
                description:
                  'Calculated at 0.8339% (1% * 83.39% borne by the employer) of the salary exceeding the Tier 1 (5,400.45 EUR per month) up to 50% above the max contribution base (7,364.25 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 3',
                description:
                  'Calculated at 0.9756% (1.17% * 83.39% borne by the employer) of the salary exceeding the Tier 2 (income exceeding 50% above the max contribution base, 7,364.25 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Common contingencies',
                description:
                  '23.60% of the monthly salary with ceiling of €4,909.50',
                amount: 1415784,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Occupational accident and professional disease contribution',
                description:
                  '1.65% of the monthly wage with a ceiling of €4,909.50',
                amount: 98988,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Unemployment',
                description:
                  '5.50% of the monthly salary with lower threshold of €1,050 and upper ceiling of €4,909.50',
                amount: 329952,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Vocational education and training',
                description:
                  '0.60% contributed towards professional training as part of the payroll taxation.',
                amount: 36000,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Wage guarantee fund',
                description:
                  '0.20% of the monthly salary is contributed to the insolvency state fund.',
                amount: 11988,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'MEI (mecanismo de equidad intergeneracional)',
                description: null,
                amount: 40200,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Work from home allowance (mandatory)',
                description:
                  'Calculated at 17.68EUR per month on top of the salary',
                amount: 25452,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Mandatory Safety Training',
                description:
                  'Calculated at 30EUR on top of the base annual salary.',
                amount: 3600,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
            ],
            annual_contributions_total: 1976724,
            annual_total: 7975834,
            extra_statutory_payments_breakdown: [
              {
                name: 'Paga 13 (13th cheque)',
                description:
                  'Spain has extra statutory holidays payments. These costs are typically included in the salary costs already hence do not cause any additional costs for the employer',
                amount: 0,
                zendesk_article_id: '4466822781709',
                zendesk_article_url:
                  'https://support.remote.com/hc/en-us/articles/4466822781709-What-countries-offer-13th-14th-month-salary-payments-',
              },
              {
                name: 'Paga 14 (14th cheque)',
                description:
                  'Spain has extra statutory holidays payments. These costs are typically included in the salary costs already hence do not cause any additional costs for the employer',
                amount: 0,
                zendesk_article_id: '4466822781709',
                zendesk_article_url:
                  'https://support.remote.com/hc/en-us/articles/4466822781709-What-countries-offer-13th-14th-month-salary-payments-',
              },
            ],
            extra_statutory_payments_total: 0,
            monthly_benefits_breakdown: [
              {
                name: 'Retirement Benefit',
                description:
                  'Optional retirement matching plan:\n\nBasic: Employee contributions only, no company match.\nStandard: 3% total with 2% from the company and 1% from the employee.\nPlus: 6% total with 4% from the company and 2% from the employee.\nPremium: 9% total with 6% from the company and 3% from the employee.\nPlatinum: 12% total with 8% from the company and 4% from the employee.',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Medical Insurance',
                description:
                  'Optional local health insurance is available through Sanitas, starting at €43.88/month for the Standard Plan and €62.15/month for the Premium Plan.\n\nInternational health insurance is also offered through Allianz, starting at $123.17 USD/month for the Standard Plan. Premium, Gold, and Platinum plans are also available.\n\nYou can choose coverage for the employee only or extend it to include family members.',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
            ],
            monthly_benefits_total: 0,
            monthly_contributions_breakdown: [
              {
                name: 'Mandatory Occupational Health Cost (incl. annual surveillance fee)',
                description:
                  'Calculated at 69EUR annually on top of the salary. The cost consists of health check fees: 58EUR and Annual surveillance fee: 11EUR',
                amount: 690,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Cobee customer cost',
                description:
                  'Cobee has a monthly cost for the client of 4,5EUR per employee',
                amount: 540,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 1',
                description:
                  'Calculated at 0.7672% (0.92% * 83.39% borne by the employer) of the salary exceeding the max contribution base (4,909.50 EUR per month) up to 10% above the max contribution base (5,400.45 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 2',
                description:
                  'Calculated at 0.8339% (1% * 83.39% borne by the employer) of the salary exceeding the Tier 1 (5,400.45 EUR per month) up to 50% above the max contribution base (7,364.25 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 3',
                description:
                  'Calculated at 0.9756% (1.17% * 83.39% borne by the employer) of the salary exceeding the Tier 2 (income exceeding 50% above the max contribution base, 7,364.25 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Common contingencies',
                description:
                  '23.60% of the monthly salary with ceiling of €4,909.50',
                amount: 117982,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Occupational accident and professional disease contribution',
                description:
                  '1.65% of the monthly wage with a ceiling of €4,909.50',
                amount: 8249,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Unemployment',
                description:
                  '5.50% of the monthly salary with lower threshold of €1,050 and upper ceiling of €4,909.50',
                amount: 27496,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Vocational education and training',
                description:
                  '0.60% contributed towards professional training as part of the payroll taxation.',
                amount: 3000,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Wage guarantee fund',
                description:
                  '0.20% of the monthly salary is contributed to the insolvency state fund.',
                amount: 999,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'MEI (mecanismo de equidad intergeneracional)',
                description: null,
                amount: 3350,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Work from home allowance (mandatory)',
                description:
                  'Calculated at 17.68EUR per month on top of the salary',
                amount: 2121,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Mandatory Safety Training',
                description:
                  'Calculated at 30EUR on top of the base annual salary.',
                amount: 300,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
            ],
            monthly_contributions_total: 164727,
            monthly_gross_salary: 499926,
            monthly_tce: 664653,
            monthly_total: 664653,
          },
          has_extra_statutory_payment: true,
          minimum_onboarding_time: 3,
          regional_currency_costs: {
            currency: {
              code: 'EUR',
              name: 'European Euro',
              symbol: '€',
              slug: 'a9635cae-5c4b-438b-b34f-bfb80946036e',
            },
            annual_gross_salary: 5000000,
            annual_benefits_breakdown: [
              {
                name: 'Retirement Benefit',
                description:
                  'Optional retirement matching plan:\n\nBasic: Employee contributions only, no company match.\nStandard: 3% total with 2% from the company and 1% from the employee.\nPlus: 6% total with 4% from the company and 2% from the employee.\nPremium: 9% total with 6% from the company and 3% from the employee.\nPlatinum: 12% total with 8% from the company and 4% from the employee.',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Medical Insurance',
                description:
                  'Optional local health insurance is available through Sanitas, starting at €43.88/month for the Standard Plan and €62.15/month for the Premium Plan.\n\nInternational health insurance is also offered through Allianz, starting at $123.17 USD/month for the Standard Plan. Premium, Gold, and Platinum plans are also available.\n\nYou can choose coverage for the employee only or extend it to include family members.',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
            ],
            annual_benefits_total: 0,
            annual_contributions_breakdown: [
              {
                name: 'Mandatory Occupational Health Cost (incl. annual surveillance fee)',
                description:
                  'Calculated at 69EUR annually on top of the salary. The cost consists of health check fees: 58EUR and Annual surveillance fee: 11EUR',
                amount: 6900,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Cobee customer cost',
                description:
                  'Cobee has a monthly cost for the client of 4,5EUR per employee',
                amount: 5400,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 1',
                description:
                  'Calculated at 0.7672% (0.92% * 83.39% borne by the employer) of the salary exceeding the max contribution base (4,909.50 EUR per month) up to 10% above the max contribution base (5,400.45 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 2',
                description:
                  'Calculated at 0.8339% (1% * 83.39% borne by the employer) of the salary exceeding the Tier 1 (5,400.45 EUR per month) up to 50% above the max contribution base (7,364.25 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 3',
                description:
                  'Calculated at 0.9756% (1.17% * 83.39% borne by the employer) of the salary exceeding the Tier 2 (income exceeding 50% above the max contribution base, 7,364.25 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Common contingencies',
                description:
                  '23.60% of the monthly salary with ceiling of €4,909.50',
                amount: 1179996,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Occupational accident and professional disease contribution',
                description:
                  '1.65% of the monthly wage with a ceiling of €4,909.50',
                amount: 82500,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Unemployment',
                description:
                  '5.50% of the monthly salary with lower threshold of €1,050 and upper ceiling of €4,909.50',
                amount: 275004,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Vocational education and training',
                description:
                  '0.60% contributed towards professional training as part of the payroll taxation.',
                amount: 30000,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Wage guarantee fund',
                description:
                  '0.20% of the monthly salary is contributed to the insolvency state fund.',
                amount: 9996,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'MEI (mecanismo de equidad intergeneracional)',
                description: null,
                amount: 33504,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Work from home allowance (mandatory)',
                description:
                  'Calculated at 17.68EUR per month on top of the salary',
                amount: 21216,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Mandatory Safety Training',
                description:
                  'Calculated at 30EUR on top of the base annual salary.',
                amount: 3000,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
            ],
            annual_contributions_total: 1647516,
            annual_total: 6647516,
            extra_statutory_payments_breakdown: [
              {
                name: 'Paga 13 (13th cheque)',
                description:
                  'Spain has extra statutory holidays payments. These costs are typically included in the salary costs already hence do not cause any additional costs for the employer',
                amount: 0,
                zendesk_article_id: '4466822781709',
                zendesk_article_url:
                  'https://support.remote.com/hc/en-us/articles/4466822781709-What-countries-offer-13th-14th-month-salary-payments-',
              },
              {
                name: 'Paga 14 (14th cheque)',
                description:
                  'Spain has extra statutory holidays payments. These costs are typically included in the salary costs already hence do not cause any additional costs for the employer',
                amount: 0,
                zendesk_article_id: '4466822781709',
                zendesk_article_url:
                  'https://support.remote.com/hc/en-us/articles/4466822781709-What-countries-offer-13th-14th-month-salary-payments-',
              },
            ],
            extra_statutory_payments_total: 0,
            monthly_benefits_breakdown: [
              {
                name: 'Retirement Benefit',
                description:
                  'Optional retirement matching plan:\n\nBasic: Employee contributions only, no company match.\nStandard: 3% total with 2% from the company and 1% from the employee.\nPlus: 6% total with 4% from the company and 2% from the employee.\nPremium: 9% total with 6% from the company and 3% from the employee.\nPlatinum: 12% total with 8% from the company and 4% from the employee.',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Medical Insurance',
                description:
                  'Optional local health insurance is available through Sanitas, starting at €43.88/month for the Standard Plan and €62.15/month for the Premium Plan.\n\nInternational health insurance is also offered through Allianz, starting at $123.17 USD/month for the Standard Plan. Premium, Gold, and Platinum plans are also available.\n\nYou can choose coverage for the employee only or extend it to include family members.',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
            ],
            monthly_benefits_total: 0,
            monthly_contributions_breakdown: [
              {
                name: 'Mandatory Occupational Health Cost (incl. annual surveillance fee)',
                description:
                  'Calculated at 69EUR annually on top of the salary. The cost consists of health check fees: 58EUR and Annual surveillance fee: 11EUR',
                amount: 575,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Cobee customer cost',
                description:
                  'Cobee has a monthly cost for the client of 4,5EUR per employee',
                amount: 450,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 1',
                description:
                  'Calculated at 0.7672% (0.92% * 83.39% borne by the employer) of the salary exceeding the max contribution base (4,909.50 EUR per month) up to 10% above the max contribution base (5,400.45 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 2',
                description:
                  'Calculated at 0.8339% (1% * 83.39% borne by the employer) of the salary exceeding the Tier 1 (5,400.45 EUR per month) up to 50% above the max contribution base (7,364.25 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Solidarity Surcharge Tier 3',
                description:
                  'Calculated at 0.9756% (1.17% * 83.39% borne by the employer) of the salary exceeding the Tier 2 (income exceeding 50% above the max contribution base, 7,364.25 EUR per month)',
                amount: 0,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Common contingencies',
                description:
                  '23.60% of the monthly salary with ceiling of €4,909.50',
                amount: 98333,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Occupational accident and professional disease contribution',
                description:
                  '1.65% of the monthly wage with a ceiling of €4,909.50',
                amount: 6875,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Unemployment',
                description:
                  '5.50% of the monthly salary with lower threshold of €1,050 and upper ceiling of €4,909.50',
                amount: 22917,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Vocational education and training',
                description:
                  '0.60% contributed towards professional training as part of the payroll taxation.',
                amount: 2500,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Wage guarantee fund',
                description:
                  '0.20% of the monthly salary is contributed to the insolvency state fund.',
                amount: 833,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'MEI (mecanismo de equidad intergeneracional)',
                description: null,
                amount: 2792,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Work from home allowance (mandatory)',
                description:
                  'Calculated at 17.68EUR per month on top of the salary',
                amount: 1768,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
              {
                name: 'Mandatory Safety Training',
                description:
                  'Calculated at 30EUR on top of the base annual salary.',
                amount: 250,
                zendesk_article_id: null,
                zendesk_article_url: null,
              },
            ],
            monthly_contributions_total: 137293,
            monthly_gross_salary: 416667,
            monthly_tce: 553960,
            monthly_total: 553960,
          },
        },
      ],
    },
  };
  const proxyURL = window.location.origin;
  return (
    <RemoteFlows
      components={components}
      proxy={{ url: proxyURL }}
      isClientToken
    >
      <CostCalculatorFormDemo />
      {Array.isArray(estimation.data.employments) &&
        estimation.data.employments.length > 0 && (
          <EstimationResults
            estimation={estimation.data.employments?.[0]}
            title="Estimate #01"
            hireNowLinkBtn="#"
          />
        )}
    </RemoteFlows>
  );
}
