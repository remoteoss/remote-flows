import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationFormValues,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  CostCalculator,
  CostCalculatorResults,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function CostCalculatorForm() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationFormValues | null>(null);

  const estimationOptions = {
    title: 'Estimate for a new company',
    includeBenefits: false,
    includeCostBreakdowns: false,
    includePremiumBenefits: false,
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
      <CostCalculator
        estimationOptions={estimationOptions}
        options={{
          disclaimer: {
            label: 'Remote Disclaimer',
          },
        }}
        onSubmit={(payload) => setPayload(payload)}
        onError={(error) => console.error({ error })}
        onSuccess={(response) => {
          setEstimations(response);
        }}
      />
      {estimations && (
        <div className="cost-calculator__results">
          <CostCalculatorResults employmentData={estimations.data} />
        </div>
      )}
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

function MarketingCostCalculator() {
  return (
    <div className="cost-calculator__container">
      <RemoteFlows useProxy>
        <CostCalculatorForm />
      </RemoteFlows>
    </div>
  );
}

export default MarketingCostCalculator;
