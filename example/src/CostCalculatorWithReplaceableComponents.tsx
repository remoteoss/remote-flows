import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
} from '@remoteoss/remote-flows';
import { components } from './Components';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export const CostCalculatorWithReplaceableComponents = () => {
  const onReset = () => {
    console.log('Reset button clicked');
    // Add your reset logic here
  };

  return (
    <RemoteFlows isClientToken components={components}>
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
              <div className='buttons-container'>
                <CostCalculatorResetButton
                  className='reset-button'
                  onClick={onReset}
                >
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
};
