import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
} from '@remoteoss/remote-flows';
import { COST_CALCULATOR_OPTIONS } from './costCalculatorOptions';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorWithDefaultValues() {
  return (
    <RemoteFlows isClientToken>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        defaultValues={{
          countryRegionSlug: '12f0ec18-5dbc-48b5-bf34-7d0fe9ee96f0',
          currencySlug: 'a9635cae-5c4b-438b-b34f-bfb80946036e',
          salary: '50000',
        }}
        options={COST_CALCULATOR_OPTIONS}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <div className='buttons-container'>
                <CostCalculatorResetButton className='reset-button'>
                  Reset
                </CostCalculatorResetButton>
                <CostCalculatorSubmitButton className='submit-button'>
                  Get estimate
                </CostCalculatorSubmitButton>
              </div>
            </div>
          );
        }}
      />
    </RemoteFlows>
  );
}
