import type {
  CostCalculatorEmployment,
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
  EstimationError,
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

const estimationOptions: CostCalculatorEstimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
  includePremiumBenefits: true,
  includeManagementFee: true,
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
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className='premium-benefits-header'>
      <h1>{title}</h1>
      <p>{description}</p>
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
  header,
  onSubmit,
  onError,
  onSuccess,
}: {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  Trigger?: React.ReactElement;
  header: {
    title: string;
    description: string;
  };
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimateResponse) => void;
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
              <Header title={header.title} description={header.description} />
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

const EditEstimationForm = ({
  isDrawerOpen,
  estimationIndex,
  estimation,
  setIsDrawerOpen,
  onSubmit,
  onError,
  onSuccess,
}: {
  isDrawerOpen: boolean;
  estimationIndex: number;
  estimation: CostCalculatorEmployment | null;
  setIsDrawerOpen: (isOpen: boolean) => void;
  onSubmit: (payload: CostCalculatorEstimationSubmitValues) => void;
  onError: (error: EstimationError) => void;
  onSuccess: (response: CostCalculatorEstimateResponse) => void;
}) => {
  return (
    <DrawerEstimationForm
      header={{
        title: 'Edit estimate',
        description: `Estimate #${estimationIndex + 1}`,
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
    <DrawerEstimationForm
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
                    className='text-sm'
                    zendeskId={zendeskArticles.internationalPricing}
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
            benefits: {
              'x-jsf-presentation': {
                variant: 'inset',
              },
            },
            management: {
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
              onError={onError}
              onSuccess={onSuccess}
            />
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
  onDeleteEstimate,
  onExportEstimate,
  onEditEstimate,
}: {
  estimations: CostCalculatorEmployment[];
  onExportPdf: () => void;
  onReset: () => void;
  onAddEstimate: (estimation: CostCalculatorEstimateResponse) => void;
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
              title={`Estimate #${index + 1}`}
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
  const [estimations, setEstimations] = useState<CostCalculatorEmployment[]>(
    [],
  );
  const [payload, setPayload] = useState<
    CostCalculatorEstimationSubmitValues[]
  >([]);

  const [editProps, setEditProps] = useState<{
    isDrawerOpen: boolean;
    estimationIndex: number;
    estimation: CostCalculatorEmployment | null;
  }>({
    isDrawerOpen: false, // TODO: probably we can get rid of this later and rely on the estimationIndex or estimation
    estimationIndex: -1,
    estimation: null,
  });

  const onReset = () => {
    setEstimations([]);
  };

  const onAddEstimate = (estimation: CostCalculatorEstimateResponse) => {
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
            const a = document.createElement('a');
            a.href = response.data.data.content as unknown as string;
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
    const estimation = estimations[index];
    setEditProps({
      isDrawerOpen: true,
      estimationIndex: index,
      estimation,
    });
  };

  const setIsDrawerOpen = (isOpen: boolean) => {
    setEditProps({ ...editProps, isDrawerOpen: isOpen });
  };

  return (
    <Layout width={estimations.length === 0 ? 'initialForm' : 'results'}>
      {estimations.length === 0 ? (
        <InitialForm
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
            estimation={editProps.estimation}
            setIsDrawerOpen={setIsDrawerOpen}
            onSubmit={(payload) => console.log(payload)}
            onError={(error) => console.error({ error })}
            onSuccess={(response) => console.log({ response })}
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
