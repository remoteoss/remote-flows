import type { CostCalculatorEstimateResponse } from '@remoteoss/remote-flows';
import {
  CostCalculator,
  CostCalculatorResults,
  RemoteFlows,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function CostCalculatorForm() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);

  const estimationOptions = {
    title: 'Estimate for a new company',
    includeBenefits: true,
    includeCostBreakdowns: true,
  };

  return (
    <>
      <CostCalculator
        estimationOptions={estimationOptions}
        onError={(error) => console.error({ error })}
        onSuccess={(response) => {
          setEstimations(response);
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
    </>
  );
}

export function CostCalculatoWithResults() {
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
