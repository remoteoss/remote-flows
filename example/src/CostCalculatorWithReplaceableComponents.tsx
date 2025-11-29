import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
} from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import { components } from './Components';
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
    <RemoteFlows components={components} isClientToken>
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
    </RemoteFlows>
  );
};
