import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorDisclaimer,
} from '@remoteoss/remote-flows';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorLabels() {
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
