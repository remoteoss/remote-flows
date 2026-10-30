import { useState } from 'react';
import {
  TimeOffDecisionError,
  TimeOffFlow,
  TimeOffRequest,
  TimeOffRequestError,
} from '@remoteoss/remote-flows';
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

const APPROVAL_ERROR_MESSAGES: Record<
  Exclude<TimeOffDecisionError['reason'], 'rejected'>,
  string
> = {
  not_found:
    'This time-off request does not exist or is not available to your company.',
  unauthorized: 'You are not allowed to approve this time-off request.',
  request_failed: 'The time-off request could not be approved.',
};

const getApprovalErrorMessage = (error: TimeOffDecisionError) =>
  error.reason === 'rejected'
    ? error.fieldErrors.map((fieldError) => fieldError.message).join(' ') ||
      error.message
    : APPROVAL_ERROR_MESSAGES[error.reason];

export function TimeOff() {
  const [approvedStatus, setApprovedStatus] = useState<
    TimeOffRequest['status'] | null
  >(null);
  const [approvalError, setApprovalError] =
    useState<TimeOffDecisionError | null>(null);

  const clearApproval = () => {
    setApprovedStatus(null);
    setApprovalError(null);
  };

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
              ApproveButton,
            },
          }) => (
            <div className='onboarding-form-container'>
              <h2 className='text-lg font-semibold mb-4'>Time off</h2>
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
                  <ReviewStep>
                    {approvedStatus && (
                      <Alert className='mb-4'>
                        <AlertDescription>
                          Approved. The request is now {approvedStatus}.
                        </AlertDescription>
                      </Alert>
                    )}
                    {approvalError && (
                      <Alert variant='destructive' className='mb-4'>
                        <AlertCircle />
                        <AlertDescription>
                          {getApprovalErrorMessage(approvalError)}
                        </AlertDescription>
                      </Alert>
                    )}
                    {timeOffBag.timeOffRequest?.status === 'requested' && (
                      <ApproveButton
                        className='submit-button'
                        approverId={null}
                        onClick={clearApproval}
                        onSuccess={(timeOffRequest) =>
                          setApprovedStatus(timeOffRequest.status)
                        }
                        onError={setApprovalError}
                      >
                        {timeOffBag.isSubmitting ? 'Approving...' : 'Approve'}
                      </ApproveButton>
                    )}
                  </ReviewStep>
                  <div className='buttons-container'>
                    <BackButton className='back-button' onClick={clearApproval}>
                      Back
                    </BackButton>
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
