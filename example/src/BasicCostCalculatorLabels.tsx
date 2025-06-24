import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorLabels() {
  return (
    <RemoteFlows>
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
                onSuccess={(response) => console.log({ response })}
              />
              <div className="buttons-container">
                <CostCalculatorResetButton className="reset-button">
                  Reset
                </CostCalculatorResetButton>
                <CostCalculatorSubmitButton
                  className="submit-button"
                  disabled={props.isSubmitting}
                >
                  Get estimate
                </CostCalculatorSubmitButton>
              </div>
            </div>
          );
        }}
        options={{
          jsfModify: {
            fields: {
              country: {
                title: 'Select your country',
              },
              age: {
                title: 'Enter your age',
              },
            },
          },
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}
