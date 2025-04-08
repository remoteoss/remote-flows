import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorResults,
} from '@remoteoss/remote-flows';
import type { CostCalculatorEstimateResponse } from '@remoteoss/remote-flows';
import Flag from 'react-flagpack';
import './App.css';
import 'react-flagpack/dist/style.css';
import { useState } from 'react';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function CostCalculatorWithResults() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
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
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => setEstimations(response)}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
      {estimations && (
        <div className="mt-2">
          <Flag code={estimations.data.employments?.[0].country.alpha_2_code} />
        </div>
      )}
    </RemoteFlows>
  );
}
