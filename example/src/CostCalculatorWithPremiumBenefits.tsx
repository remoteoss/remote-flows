import type {
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
  EstimationError,
  CostCalculatorFlowProps,
  CostCalculatorEstimationResponse,
  CostCalculatorEstimation,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  useCostCalculatorEstimationPdf,
  EstimationResults,
  zendeskArticles,
  SummaryResults,
  convertFromCents,
} from '@remoteoss/remote-flows';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Card,
  ZendeskTriggerButton,
  cn,
} from '@remoteoss/remote-flows/internals';
import { ButtonHTMLAttributes, useState, isValidElement } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { components } from './Components';
import 'react-flagpack/dist/style.css';
import './css/main.css';
import './css/premium-benefits.css';
import './css/utils.css';
import { downloadPdf } from './utils';

const estimationOptions: CostCalculatorEstimationOptions = {
  includeBenefits: true,
  includeCostBreakdowns: true,
  includePremiumBenefits: true,
  includeManagementFee: true,
  showManagementFee: true,
  includeEstimationTitle: true,
  enableCurrencyConversion: true,
  managementFees: {
    USD: 594,
    CAD: 803.25,
    NZD: 981.75,
    AUD: 908.65,
    EUR: 548.25,
    GBP: 475.15,
  },
};

const Layout = ({
  children,
  width,
}: {
  children: React.ReactNode;
  width: 'initialForm' | 'results';
}) => {
  return (
    <div className='premium-benefits-wrapper'>
      <div
        className={cn({
          'premium-benefits-container': true,
          'premium-benefits-wrapper--initial': width === 'initialForm',
          'premium-benefits-wrapper--results': width === 'results',
        })}
      >
        {children}
      </div>
    </div>
  );
};

const Header = ({
  title = 'Cost calculator',
  description = 'Estimate the cost to hire someone through Remote',
  'data-testid': dataSelector = 'premium-benefits-header',
}: {
  title?: string;
  description?: string;
  'data-testid'?: string;
}) => {
  return (
    <div className='premium-benefits-header'>
      <h1 data-testid={`${dataSelector}-header-title`}>{title}</h1>
      <p data-testid={`${dataSelector}-header-description`}>{description}</p>
      <ZendeskTriggerButton
        className='text-sm'
        zendeskId={zendeskArticles.disclaimerCostCalculator}
      >
        Disclaimer ↗
      </ZendeskTriggerButton>
    </div>
  );
};

const DrawerEstimationForm = ({
  isDrawerOpen,
  setIsDrawerOpen,
  Trigger,
  options,
  header,
  defaultValues,
  'data-testid': dataSelector,
  onSubmit,
  onError,
  onSuccess,
}: {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  Trigger?: React.ReactElement;
  options: {
    title: string;
    hideCurrency?: boolean;
  };
  defaultValues?: CostCalculatorFlowProps['defaultValues'] & {
    selectedCurrency?: string;
  };
  header: {
    title: string;
    description: string;
  };
  'data-testid'?: string;
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimationResponse) => void;
}) => {
  const triggerElement = isValidElement(Trigger) ? (
    Trigger
  ) : (
    <div>{Trigger}</div>
  );
  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      {Trigger && <DrawerTrigger asChild>{triggerElement}</DrawerTrigger>}
      <DrawerContent showHandle={false} className='max-h-[90vh] flex flex-col'>
        <DrawerHeader className='hidden'>
          <DrawerTitle className='hidden'>{header.title}</DrawerTitle>
        </DrawerHeader>
        <div className='flex-1 overflow-y-auto'>
          <Layout width='initialForm'>
            <div className='mt-10 mb-8'>
              <Header
                data-testid={dataSelector}
                title={header.title}
                description={header.description}
              />
            </div>
            <AddEstimateForm
              options={options}
              defaultValues={defaultValues}
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

const EditEstimationForm = ({
  isDrawerOpen,
  estimationIndex,
  payload,
  selectedEstimation,
  setIsDrawerOpen,
  onSubmit,
  onError,
  onSuccess,
}: {
  isDrawerOpen: boolean;
  estimationIndex: number;
  payload: CostCalculatorEstimationSubmitValues | null;
  selectedEstimation: CostCalculatorEstimation | null;
  setIsDrawerOpen: (isOpen: boolean) => void;
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimationResponse) => void;
}) => {
  const paddedIndex = (estimationIndex + 1).toString().padStart(2, '0');
  return (
    <DrawerEstimationForm
      options={{ title: `Estimate #${paddedIndex}`, hideCurrency: true }}
      data-testid='drawer-edit-estimation-form'
      header={{
        title: 'Edit estimate',
        description: `Estimate #${estimationIndex + 1}`,
      }}
      defaultValues={{
        countryRegionSlug: payload?.country,
        hiringBudget: payload?.hiring_budget,
        currencySlug: payload?.currency,
        salary: convertFromCents(payload?.salary)?.toString() ?? '',
        benefits: payload?.benefits,
        selectedCurrency:
          selectedEstimation?.employer_currency_costs.currency.code ?? '',
        age: payload?.age,
        contractDurationType: payload?.contract_duration_type,
      }}
      isDrawerOpen={isDrawerOpen}
      setIsDrawerOpen={setIsDrawerOpen}
      onSubmit={onSubmit}
      onError={onError}
      onSuccess={onSuccess}
    />
  );
};

const AddEstimateButton = ({
  options,
  buttonProps,
  defaultValues,
  onSubmit,
  onError,
  onSuccess,
  isDrawerOpen,
  setIsDrawerOpen,
}: {
  options: {
    title: string;
    hideCurrency?: boolean;
  };
  defaultValues?: CostCalculatorFlowProps['defaultValues'] & {
    selectedCurrency?: string;
  };
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimationResponse) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
}) => {
  return (
    <DrawerEstimationForm
      data-testid='drawer-add-estimation-form'
      defaultValues={defaultValues}
      options={options}
      isDrawerOpen={isDrawerOpen}
      setIsDrawerOpen={setIsDrawerOpen}
      Trigger={
        <button
          className='premium-benefits-action-toolbar__button premium-benefits-action-toolbar__button--primary'
          {...buttonProps}
        >
          Add estimate
        </button>
      }
      header={{
        title: 'Add estimate',
        description: 'Estimate the cost of another hire through Remote',
      }}
      onSubmit={onSubmit}
      onError={onError}
      onSuccess={onSuccess}
    />
  );
};

const ActionToolbar = ({
  estimations,
  onReset,
  onExportPdf,
  onCSVExport,
  onAddEstimate,
  onSavePayload,
}: {
  estimations: CostCalculatorEstimation[];
  onReset: () => void;
  onExportPdf: () => void;
  onCSVExport: () => void;
  onAddEstimate: (estimation: CostCalculatorEstimationResponse) => void;
  onSavePayload: (estimation: CostCalculatorEstimationSubmitValues) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card direction='row' className='justify-around'>
      <div>
        <button
          className='premium-benefits-action-toolbar__button'
          onClick={onReset}
        >
          Reset estimate
        </button>
      </div>
      <div className='flex gap-2'>
        <button
          className='premium-benefits-action-toolbar__button premium-benefits-action-toolbar__button--secondary'
          onClick={onCSVExport}
          disabled
        >
          Export as CSV
        </button>
        <button
          className='premium-benefits-action-toolbar__button premium-benefits-action-toolbar__button--secondary'
          onClick={onExportPdf}
        >
          Export as PDF
        </button>
        <AddEstimateButton
          options={{
            title: `Estimate #${(estimations.length + 1).toString().padStart(2, '0')}`,
            hideCurrency: true,
          }}
          defaultValues={{
            currencySlug:
              estimations[estimations.length - 1].employer_currency_costs
                .currency.slug,
            selectedCurrency:
              estimations[estimations.length - 1].employer_currency_costs
                .currency.code,
          }}
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
  defaultValues,
  options,
}: {
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimationResponse) => void;
  defaultValues?: CostCalculatorFlowProps['defaultValues'] & {
    selectedCurrency?: string;
  };
  options: {
    title: string;
    hideCurrency?: boolean;
  };
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  return (
    <CostCalculatorFlow
      estimationOptions={{ ...estimationOptions, title: options.title }}
      defaultValues={defaultValues}
      options={{
        onValidation: () => setErrorMessage(null),
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
                    className='text-sm'
                    zendeskId={zendeskArticles.internationalPricing}
                  >
                    Learn more ↗
                  </ZendeskTriggerButton>
                </>
              ),
              'x-jsf-presentation': {
                hidden: options.hideCurrency,
              },
            },
            currency_statement: {
              'x-jsf-presentation': {
                hidden: !options.hideCurrency,
                statement: {
                  title:
                    'The billing currency will appear as the one you picked earlier',
                  description: `Your billing currency will be shown as ${defaultValues?.selectedCurrency}, based on your earlier selection`,
                  inputType: 'statement',
                  severity: 'warning',
                },
              },
            },
            salary: {
              description:
                "We will use your selected billing currency, but you can also convert it to the employee's local currency.",
            },
            benefits: {
              'x-jsf-presentation': {
                variant: 'inset',
              },
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
              onError={(error) => {
                setErrorMessage(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (error as any)?.error?.error?.message || 'An error occurred',
                );
                onError(error);
              }}
              onSuccess={onSuccess}
            />
            {errorMessage && (
              <div className='flex justify-center mt-10 text-red-600 text-center mb-4'>
                {errorMessage}
              </div>
            )}

            <div className='flex justify-center mt-10'>
              <CostCalculatorSubmitButton
                className='submit-button'
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
  options,
  onSubmit,
  onError,
  onSuccess,
}: {
  options: {
    title: string;
  };
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimationResponse) => void;
}) => {
  return (
    <>
      <Header />
      <AddEstimateForm
        options={options}
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
  onDeleteEstimate,
  onExportEstimate,
  onEditEstimate,
}: {
  estimations: CostCalculatorEstimation[];
  onExportPdf: () => void;
  onReset: () => void;
  onAddEstimate: (estimation: CostCalculatorEstimationResponse) => void;
  onSavePayload: (estimation: CostCalculatorEstimationSubmitValues) => void;
  onDeleteEstimate: (index: number) => void;
  onExportEstimate: (index: number) => void;
  onEditEstimate: (index: number) => void;
}) => {
  if (!estimations) {
    return null;
  }

  return (
    <>
      <Header />
      <div className='mb-8'>
        <ActionToolbar
          estimations={estimations}
          onReset={onReset}
          onExportPdf={onExportPdf}
          onCSVExport={() => {}}
          onAddEstimate={onAddEstimate}
          onSavePayload={onSavePayload}
        />
      </div>
      {estimations.length >= 2 && (
        <div className='mb-6'>
          <SummaryResults estimations={estimations} />
        </div>
      )}
      {estimations.map((estimation, index) => {
        return (
          <div
            className={cn({
              'mb-6': index < estimations.length - 1,
            })}
            key={index}
          >
            <EstimationResults
              estimation={estimation}
              title={estimation.title ?? 'My first estimate'}
              onDelete={() => onDeleteEstimate(index)}
              onExportPdf={() => onExportEstimate(index)}
              onEdit={() => onEditEstimate(index)}
            />
          </div>
        );
      })}
    </>
  );
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] = useState<CostCalculatorEstimation[]>(
    [],
  );
  const [payload, setPayload] = useState<
    CostCalculatorEstimationSubmitValues[]
  >([]);

  const [editProps, setEditProps] = useState<{
    isDrawerOpen: boolean;
    estimationIndex: number;
    payload: CostCalculatorEstimationSubmitValues | null;
  }>({
    isDrawerOpen: false,
    estimationIndex: -1,
    payload: null,
  });

  const onReset = () => {
    setEstimations([]);
  };

  const onAddEstimate = (estimation: CostCalculatorEstimationResponse) => {
    const payload = estimation.data.employments?.[0];
    if (payload) {
      setEstimations([...estimations, payload]);
    }
  };

  const onDeleteEstimate = (index: number) => {
    setEstimations(estimations.filter((_, i) => i !== index));
  };

  const onSavePayload = (estimation: CostCalculatorEstimationSubmitValues) => {
    setPayload([...payload, estimation]);
  };

  const onEditPayload = (
    estimation: CostCalculatorEstimationSubmitValues,
    index: number,
  ) => {
    const newPayload = [...payload];
    newPayload[index] = estimation;
    setPayload(newPayload);
  };

  const onEditSuccess = (
    response: CostCalculatorEstimationResponse,
    index: number,
  ) => {
    if (response.data.employments?.[0]) {
      const newEstimations = [...estimations];
      newEstimations[index] = response.data.employments?.[0];
      setEstimations(newEstimations);
    }

    setEditProps({
      isDrawerOpen: false,
      estimationIndex: -1,
      payload: null,
    });
  };

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  function exportPdf(
    payloadToExport:
      | CostCalculatorEstimationSubmitValues
      | CostCalculatorEstimationSubmitValues[],
  ) {
    exportPdfMutation.mutate(
      buildCostCalculatorEstimationPayload(payloadToExport, estimationOptions),
      {
        onSuccess: (response) => {
          if (response?.data?.data?.content !== undefined) {
            downloadPdf(
              response.data.data.content as unknown as string,
              'estimation.pdf',
            );
          }
        },
        onError: (error) => {
          console.error({ error });
        },
      },
    );
  }

  const handleExportPdf = () => {
    if (payload) {
      exportPdf(payload);
    }
  };

  const onExportEstimate = (index: number) => {
    const pdfPayload = payload[index];

    if (pdfPayload) {
      exportPdf(pdfPayload);
    }
  };

  const onEditEstimate = (index: number) => {
    const savedPayload = payload[index];
    setEditProps({
      isDrawerOpen: true,
      estimationIndex: index,
      payload: savedPayload,
    });
  };

  const setIsDrawerOpen = (isOpen: boolean) => {
    setEditProps({ ...editProps, isDrawerOpen: isOpen });
  };

  return (
    <Layout width={estimations.length === 0 ? 'initialForm' : 'results'}>
      {estimations.length === 0 ? (
        <InitialForm
          options={{ title: 'Estimate #01' }}
          onSubmit={(payload) => {
            setPayload([payload]);
          }}
          onError={(error) => console.error({ error })}
          onSuccess={(response) => {
            onAddEstimate(response);
          }}
        />
      ) : (
        <>
          <ResultsView
            estimations={estimations}
            onExportPdf={handleExportPdf}
            onReset={onReset}
            onAddEstimate={onAddEstimate}
            onSavePayload={onSavePayload}
            onDeleteEstimate={onDeleteEstimate}
            onExportEstimate={onExportEstimate}
            onEditEstimate={onEditEstimate}
          />
          <EditEstimationForm
            isDrawerOpen={editProps.isDrawerOpen}
            estimationIndex={editProps.estimationIndex}
            payload={editProps.payload}
            selectedEstimation={estimations[editProps.estimationIndex]}
            setIsDrawerOpen={setIsDrawerOpen}
            onSubmit={(payload) =>
              onEditPayload(payload, editProps.estimationIndex)
            }
            onError={() => {}}
            onSuccess={(response) =>
              onEditSuccess(response, editProps.estimationIndex)
            }
          />
        </>
      )}
    </Layout>
  );
}

export function CostCalculatorWithPremiumBenefits() {
  const proxyURL = window.location.origin;

  return (
    <RemoteFlows
      components={components}
      proxy={{ url: proxyURL }}
      isClientToken
    >
      <CostCalculatorFormDemo />
    </RemoteFlows>
  );
}
