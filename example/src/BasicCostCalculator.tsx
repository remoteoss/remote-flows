import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';
import './App.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

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

export function BasicCostCalculator() {
  const onReset = () => {
    console.log('Reset button clicked');
    // Add your reset logic here
  };

  return (
    <RemoteFlows auth={fetchToken}>
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
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton onClick={onReset}>
                Reset
              </CostCalculatorResetButton>
            </div>
          );
        }}
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}
