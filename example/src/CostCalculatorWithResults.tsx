import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  CostCalculatorResults,
} from '@remoteoss/remote-flows';
import type { CostCalculatorEstimateResponse } from '@remoteoss/remote-flows';
import Flag from 'react-flagpack';
import { useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';
import 'react-flagpack/dist/style.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function CostCalculatorWithResults() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);

  return (
    <RemoteFlows isClientToken>
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
                resetFields={['country']}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <div className='buttons-container'>
                <CostCalculatorResetButton className='reset-button'>
                  Reset
                </CostCalculatorResetButton>
                <CostCalculatorSubmitButton
                  className='submit-button'
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
        <>
          <div className='mt-4 mb-2 flex gap-2'>
            <Flag
              code={estimations.data.employments?.[0].country.alpha_2_code}
            />
            <label className='text-md font-bold'>
              {estimations.data.employments?.[0].country.name}
            </label>
          </div>
          <CostCalculatorResults employmentData={estimations.data} />
        </>
      )}
    </RemoteFlows>
  );
}
