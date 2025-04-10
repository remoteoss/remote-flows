import type { CostCalculatorEstimateResponse } from '@remoteoss/remote-flows';
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorResetButton,
  CostCalculatorResults,
  CostCalculatorSubmitButton,
  RemoteFlows,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import Flag from 'react-flagpack';
import 'react-flagpack/dist/style.css';
import './App.css';

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
    <RemoteFlows
      components={{
        number: ({ field, fieldState, fieldData }) => {
          console.log(fieldData);
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label>{fieldData.label}</label>
              <input {...field} style={{ border: '1px solid pink' }} />
              {fieldState.error && (
                <span className="text-red-500">{fieldState.error.message}</span>
              )}
            </div>
          );
        },
        select: ({ field, fieldState, fieldData }) => {
          console.log('select', fieldData);
          return (
            <>
              <select
                {...field}
                onChange={(ev) => {
                  field.onChange(ev.target.value);
                }}
                style={{ border: '1px solid pink' }}
              >
                {fieldData?.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldState.error && (
                <span className="text-red-500">{fieldState.error.message}</span>
              )}
            </>
          );
        },
        text: ({ field, metadata }) => {
          return <input {...field} style={{ border: '1px solid black' }} />;
        },
      }}
      auth={() => fetchToken()}
    >
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
        <div className="mt-4 mb-2 flex gap-2">
          <Flag code={estimations.data.employments?.[0].country.alpha_2_code} />
          <label className="text-md font-bold">
            {estimations.data.employments?.[0].country.name}
          </label>
        </div>
      )}
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
    </RemoteFlows>
  );
}
