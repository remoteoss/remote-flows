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
        render={(props, onResetForm) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => {
                  console.log({ payload });
                  onResetForm();
                }}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <div className="buttons-container">
                <CostCalculatorResetButton
                  className="reset-button"
                  onClick={onReset}
                >
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
      />
      <CostCalculatorDisclaimer label="Disclaimer" />
    </RemoteFlows>
  );
}
