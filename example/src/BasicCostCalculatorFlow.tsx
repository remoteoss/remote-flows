import {
  CostCalculatorFlow,
  CostCalculatorForm,
  RemoteFlows,
} from '@remoteoss/remote-flows';
import './App.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorFlow() {
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
        onSubmit={(payload) => console.log(payload)}
        onError={(error) => console.error({ error })}
        onSuccess={(response) => console.log({ response })}
        render={(props) => {
          return (
            <div>
              <CostCalculatorForm />
            </div>
          );
        }}
      />
    </RemoteFlows>
  );
}
