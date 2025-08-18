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
  cn,
} from '@remoteoss/remote-flows/internals';
import { ButtonHTMLAttributes, useState } from 'react';
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
        return (
          <div
            className={cn({
              'mb-6': index < estimations.length - 1,
            })}
            key={index}
          >
            {Array.isArray(estimation.data.employments) &&
              estimation.data.employments.length > 0 && (
                <EstimationResults
                  estimation={estimation.data.employments?.[0]}
                  title={`Estimate #${index + 1}`}
                  hireNowLinkBtn={'#'}
                />
              )}
          </div>
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
