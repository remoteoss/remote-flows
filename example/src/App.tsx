import { useState } from 'react';
import {
  CostCalculatorEstimateResponse,
  RemoteFlows,
  CostCalculator,
  useExportAsPdf,
  CostCalculatorEstimateParams,
} from '@remoteoss/remote-flows';
import './App.css';

function CostCalculatorForm() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] = useState<CostCalculatorEstimateParams | null>(
    null,
  );

  const estimationParams = {
    title: 'Estimate for a new company',
    includeBenefits: true,
    includeCostBreakdowns: true,
  };

  const exportPdf = useExportAsPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdf(payload)
        .then((response) => {
          const a = document.createElement('a');
          a.href = response;
          a.download = 'estimation.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
        .catch((error) => {
          console.error({ error });
        });
    }
  };

  return (
    <>
      <CostCalculator
        estimationParams={estimationParams}
        defaultValues={{
          countryRegionSlug: 'a1aea868-0e0a-4cd7-9b73-9941d92e5bbe',
          currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba',
          salary: '50000',
        }}
        onSubmit={(payload) => setPayload(payload)}
        onError={(error) => console.error({ error })}
        onSuccess={(response) => {
          setEstimations(response);
        }}
      />
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
