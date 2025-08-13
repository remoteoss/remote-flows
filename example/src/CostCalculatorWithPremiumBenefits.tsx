import type {
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
} from '@remoteoss/remote-flows';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@remoteoss/remote-flows/internal';
import Flag from 'react-flagpack';
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
      {/** TODO: Add a zendesk link that opens a Zendesk drawer */}
      {/* <a href="https://remote.com/premium-benefits">Learn more</a> */}
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
      <DrawerContent>
        <DrawerHeader className="hidden">
          <DrawerTitle className="hidden">Add estimate</DrawerTitle>
        </DrawerHeader>
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
      </DrawerContent>
    </Drawer>
  );
};

const ActionToolbar = ({
  onReset,
  onExportPdf,
  onCSVExport,
  onAddEstimate,
}: {
  onReset: () => void;
  onExportPdf: () => void;
  onCSVExport: () => void;
  onAddEstimate: (estimation: CostCalculatorEstimateResponse) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="premium-benefits-action-toolbar">
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
          onSubmit={() => {}}
          onError={() => {}}
          onSuccess={(estimation) => {
            onAddEstimate(estimation);
            setIsOpen(false);
          }}
        />
      </div>
    </div>
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
              description:
                "Select the currency you want to be invoiced in for this employee's services.",
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
          <div className="premium-benefits-form-container">
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
          </div>
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
}: {
  estimations: CostCalculatorEstimateResponse[];
  onExportPdf: () => void;
  onReset: () => void;
  onAddEstimate: (estimation: CostCalculatorEstimateResponse) => void;
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
        />
      </div>
      {estimations.map((estimation) => {
        const primaryEmployment = estimation.data.employments?.[0];
        const country = primaryEmployment?.country;

        return (
          <>
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
          </>
        );
      })}
    </>
  );
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] = useState<
    CostCalculatorEstimateResponse[]
  >([]);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationSubmitValues | null>(null);

  const onReset = () => {
    setEstimations([]);
  };

  const onAddEstimate = (estimation: CostCalculatorEstimateResponse) => {
    setEstimations([...estimations, estimation]);
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
            setPayload(payload);
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
