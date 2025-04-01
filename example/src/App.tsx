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
  const [includeBenefits, setIncludeBenefits] = useState(true);
  const [includeCostBreakdowns, setIncludeCostBreakdowns] = useState(true);
  const [includePremiumBenefits, setIncludePremiumBenefits] = useState(true);
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationFormValues | null>(null);

  const estimationOptions = {
    title: 'Estimate for a new company',
    includeBenefits: includeBenefits,
    includeCostBreakdowns: includeCostBreakdowns,
    includePremiumBenefits: includePremiumBenefits,
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
      <div className="grid gap-2 mb-2">
        <div className="flex gap-2">
          <input
            type="checkbox"
            checked={includeBenefits}
            onChange={(evt) => setIncludeBenefits(evt.target.checked)}
          />
          <label>Include Benefits</label>
        </div>
        <div className="flex gap-2">
          <input
            type="checkbox"
            checked={includeCostBreakdowns}
            onChange={(evt) => setIncludeCostBreakdowns(evt.target.checked)}
          />
          <label>Include Cost Breakdown</label>
        </div>
        <div className="flex gap-2">
          <input
            type="checkbox"
            checked={includePremiumBenefits}
            onChange={(evt) => setIncludePremiumBenefits(evt.target.checked)}
          />
          <label>Include Premium Benefits</label>
        </div>
      </div>
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

function App() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <div className="cost-calculator__container">
      <RemoteFlows auth={() => fetchToken()}>
        <CostCalculatorForm />
      </RemoteFlows>
    </div>
  );
}

export default App;
