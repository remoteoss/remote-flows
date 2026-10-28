import { TimeOffFlow } from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

export function TimeOff() {
  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <TimeOffFlow
          render={({
            timeOffBag,
            components: { RequestIdStep, NextButton, TimeOffStep },
          }) => (
            <div className='onboarding-form-container'>
              <h2>Time off</h2>
              {timeOffBag.stepState.currentStep.name === 'request_id' && (
                <>
                  <RequestIdStep />
                  <NextButton className='submit-button mt-3'>Next</NextButton>
                </>
              )}
              {timeOffBag.stepState.currentStep.name === 'time_off' && (
                <TimeOffStep />
              )}
            </div>
          )}
        />
      </div>
    </RemoteFlows>
  );
}
