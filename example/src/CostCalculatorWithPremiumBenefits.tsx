import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationSubmitValues,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorResetButton,
  CostCalculatorResults,
  CostCalculatorSubmitButton,
  useCostCalculatorEstimationPdf,
} from '@remoteoss/remote-flows';
import Flag from 'react-flagpack';
import { useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { components } from './Components';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
  includePremiumBenefits: true,
  enableCurrencyConversion: true,
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationSubmitValues | null>(null);

  const onReset = () => {
    setEstimations(null);
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
    <>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        options={{
          jsfModify: {
            fields: {
              country: {
                title: 'Employee country',
              },
              currency: {
                title: 'Employer billing currency',
              },
              salary: {
                title: "Employee's annual salary",
              },
            },
          },
        }}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }

          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => setPayload(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <div className="buttons-container">
                <CostCalculatorResetButton
                  onClick={onReset}
                  className="reset-button"
                >
                  Reset
                </CostCalculatorResetButton>
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
      {estimations && (
        <div>
          <div className="mt-4 mb-2 flex gap-2">
            <Flag
              code={estimations.data.employments?.[0].country.alpha_2_code}
            />
            <label className="text-md font-bold">
              {estimations.data.employments?.[0].country.name}
            </label>
          </div>
          <CostCalculatorResults employmentData={estimations.data} />
          <div className="mt-2">
            <button className="submit-button" onClick={handleExportPdf}>
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </>
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
