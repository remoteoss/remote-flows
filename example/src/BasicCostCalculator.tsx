import { CostCalculator, RemoteFlows } from '@remoteoss/remote-flows';
import './App.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

function CostCalculatorForm() {
  return (
    <CostCalculator
      estimationOptions={estimationOptions}
      onSubmit={(payload) => console.log(payload)}
      onError={(error) => console.error({ error })}
      onSuccess={(response) => console.log({ response })}
    />
  );
}

export function BasicCostCalculator() {
  const refreshToken = import.meta.env.VITE_REFRESH_TOKEN;
  const fetchToken = () => {
    return fetch(`/api/token?refresh_token=${refreshToken}`)
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
