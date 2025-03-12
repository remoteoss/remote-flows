import { useState } from 'react';
import {
  CostCalculatorEstimateResponse,
  RemoteFlows,
  CostCalculator,
} from '@remoteoss/remote-flows';
import './App.css';

function App() {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => {
        return data.accessToken;
      })
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);

  return (
    <>
      <RemoteFlows
        auth={() =>
          fetchToken().then((access_token) => ({
            expires_in: 3600,
            access_token,
          }))
        }
      >
        <CostCalculator
          estimationParams={{
            title: 'Estimate for a new company',
            includeBenefits: true,
            includeCostBreakdowns: true,
          }}
          defaultValues={{
            country: 'PRT',
            currency: 'EUR',
            salary: '50000',
          }}
          onSubmit={(payload) => console.log({ payload })}
          onError={(error) => console.error({ error })}
          onSuccess={(response) => {
            console.log({ response });
            setEstimations(response);
          }}
        />
        {estimations && <pre>{JSON.stringify(estimations, null, 2)}</pre>}
      </RemoteFlows>
    </>
  );
}

export default App;
