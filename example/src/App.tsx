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
  const [includeBenefits, setIncludeBenefits] = useState<boolean>(true);
  const [includePremiumBenefits, setIncludePremiumBenefits] =
    useState<boolean>(true);
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationFormValues | null>(null);

  const estimationOptions = {
    title: 'Estimate for a new company',
    includeBenefits: includeBenefits,
    includeCostBreakdowns: true,
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
      <input
        type="checkbox"
        checked={includeBenefits}
        onChange={(event) => {
          setIncludeBenefits(event.target.checked);
        }}
      />
      <label>Include Benefits</label>
      <input
        type="checkbox"
        checked={includePremiumBenefits}
        onChange={(event) => {
          setIncludePremiumBenefits(event.target.checked);
        }}
      />
      <label>Include Premium Benefits</label>
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
        <CostCalculatorResults employmentData={estimations.data} />
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
    <RemoteFlows auth={() => fetchToken()}>
      <CostCalculatorForm />
    </RemoteFlows>
  );
}

export default App;
