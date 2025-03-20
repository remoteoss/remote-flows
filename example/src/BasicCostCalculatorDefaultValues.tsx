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
      defaultValues={{
        countryRegionSlug: 'a1aea868-0e0a-4cd7-9b73-9941d92e5bbe',
        currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba',
        salary: '50000',
      }}
      params={{
        disclaimer: {
          label: 'Remote Disclaimer',
        },
      }}
      estimationOptions={estimationOptions}
      onSubmit={(payload) => console.log(payload)}
      onError={(error) => console.error({ error })}
      onSuccess={(response) => console.log({ response })}
    />
  );
}

export function BasicCostCalculatorWithDefaultValues() {
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
      <CostCalculatorForm />
    </RemoteFlows>
  );
}
