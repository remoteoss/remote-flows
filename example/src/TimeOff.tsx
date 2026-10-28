import { TimeOffFlow, TimeOffRequestError } from '@remoteoss/remote-flows';
import { Alert, AlertDescription } from '@remoteoss/remote-flows/internals';
import { AlertCircle } from 'lucide-react';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

const ERROR_MESSAGES: Record<TimeOffRequestError['reason'], string> = {
  not_found:
    'This time-off request does not exist or is not available to your company.',
  unauthorized: 'You are not allowed to review this time-off request.',
  request_failed: 'The time-off request could not be loaded.',
};

export function TimeOff() {
  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <TimeOffFlow
          render={({
            timeOffBag,
            components: {
              RequestIdStep,
              NextButton,
              ReviewStep,
              RetryButton,
              BackButton,
            },
          }) => (
            <div className='onboarding-form-container'>
              <h2>Time off</h2>
              {timeOffBag.stepState.currentStep.name === 'request_id' && (
                <>
                  <RequestIdStep />
                  <NextButton className='submit-button mt-3'>Next</NextButton>
                </>
              )}
              {timeOffBag.stepState.currentStep.name === 'review' && (
                <>
                  {timeOffBag.isLoading && <p>Loading time-off request...</p>}
                  {timeOffBag.timeOffRequestError && (
                    <Alert variant='destructive' className='mb-4'>
                      <AlertCircle />
                      <AlertDescription>
                        {ERROR_MESSAGES[timeOffBag.timeOffRequestError.reason]}
                      </AlertDescription>
                    </Alert>
                  )}
                  <ReviewStep />
                  <div className='buttons-container'>
                    <BackButton className='back-button'>Back</BackButton>
                    {timeOffBag.timeOffRequestError &&
                      timeOffBag.timeOffRequestError.reason !== 'not_found' && (
                        <RetryButton className='submit-button'>
                          Try again
                        </RetryButton>
                      )}
                  </div>
                </>
              )}
            </div>
          )}
        />
      </div>
    </RemoteFlows>
  );
}
