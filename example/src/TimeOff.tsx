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
import { TimeOffDeclineDialog } from './TimeOffDeclineDialog';
import './css/main.css';

const ERROR_MESSAGES: Record<TimeOffRequestError['reason'], string> = {
  not_found:
    'This time-off request does not exist or is not available to your company.',
  unauthorized: 'You are not allowed to review this time-off request.',
  request_failed: 'The time-off request could not be loaded.',
};

type RequestDecision = 'approve' | 'decline';

type Decision =
  | RequestDecision
  | 'approve_cancellation'
  | 'decline_cancellation';

const DECISION_LABELS: Record<Decision, string> = {
  approve: 'Approved',
  decline: 'Declined',
  approve_cancellation: 'Cancellation approved',
  decline_cancellation: 'Cancellation declined',
};

const DECISION_ERROR_MESSAGES: Record<
  Decision,
  Record<Exclude<TimeOffDecisionError['reason'], 'rejected'>, string>
> = {
  approve: {
    not_found:
      'This time-off request does not exist or is not available to your company.',
    unauthorized: 'You are not allowed to approve this time-off request.',
    request_failed: 'The time-off request could not be approved.',
  },
  decline: {
    not_found:
      'This time-off request does not exist or is not available to your company.',
    unauthorized: 'You are not allowed to decline this time-off request.',
    request_failed: 'The time-off request could not be declined.',
  },
  approve_cancellation: {
    not_found:
      'This time-off request does not exist or is not available to your company.',
    unauthorized: 'You are not allowed to approve this cancellation request.',
    request_failed: 'The cancellation request could not be approved.',
  },
  decline_cancellation: {
    not_found:
      'This time-off request does not exist or is not available to your company.',
    unauthorized: 'You are not allowed to decline this cancellation request.',
    request_failed: 'The cancellation request could not be declined.',
  },
};

const CANCELLATION_DECISIONS: Record<RequestDecision, Decision> = {
  approve: 'approve_cancellation',
  decline: 'decline_cancellation',
};

const isCancellationRequest = (timeOffRequest: TimeOffRequest | undefined) =>
  timeOffRequest?.status === 'cancel_requested';

const canDecide = (timeOffRequest: TimeOffRequest | undefined) =>
  timeOffRequest?.status === 'requested' ||
  isCancellationRequest(timeOffRequest);

const getDecision = (
  decision: RequestDecision,
  timeOffRequest: TimeOffRequest | undefined,
) =>
  isCancellationRequest(timeOffRequest)
    ? CANCELLATION_DECISIONS[decision]
    : decision;

const getDecisionErrorMessage = (
  decision: Decision,
  error: TimeOffDecisionError,
) =>
  error.reason === 'rejected'
    ? error.fieldErrors.map((fieldError) => fieldError.message).join(' ') ||
      error.message
    : DECISION_ERROR_MESSAGES[decision][error.reason];

export function TimeOff() {
  const [outcome, setOutcome] = useState<{
    decision: Decision;
    status: TimeOffRequest['status'];
  } | null>(null);
  const [decisionError, setDecisionError] = useState<{
    decision: Decision;
    error: TimeOffDecisionError;
  } | null>(null);

  const clearDecision = () => {
    setOutcome(null);
    setDecisionError(null);
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
              DeclineButton,
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
                    {outcome && (
                      <Alert className='mb-4'>
                        <AlertDescription>
                          {DECISION_LABELS[outcome.decision]}. The request is
                          now {outcome.status}.
                        </AlertDescription>
                      </Alert>
                    )}
                    {decisionError && (
                      <Alert variant='destructive' className='mb-4'>
                        <AlertCircle />
                        <AlertDescription>
                          {getDecisionErrorMessage(
                            decisionError.decision,
                            decisionError.error,
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                    {canDecide(timeOffBag.timeOffRequest) && (
                      <div className='buttons-container'>
                        <TimeOffDeclineDialog
                          DeclineButton={DeclineButton}
                          disabled={timeOffBag.isSubmitting}
                          isCancellationRequest={isCancellationRequest(
                            timeOffBag.timeOffRequest,
                          )}
                          onClick={clearDecision}
                          onSuccess={(timeOffRequest) =>
                            setOutcome({
                              decision: getDecision(
                                'decline',
                                timeOffBag.timeOffRequest,
                              ),
                              status: timeOffRequest.status,
                            })
                          }
                          onError={(error) =>
                            setDecisionError({
                              decision: getDecision(
                                'decline',
                                timeOffBag.timeOffRequest,
                              ),
                              error,
                            })
                          }
                        />
                        <ApproveButton
                          className='submit-button'
                          approverId={null}
                          onClick={clearDecision}
                          onSuccess={(timeOffRequest) =>
                            setOutcome({
                              decision: getDecision(
                                'approve',
                                timeOffBag.timeOffRequest,
                              ),
                              status: timeOffRequest.status,
                            })
                          }
                          onError={(error) =>
                            setDecisionError({
                              decision: getDecision(
                                'approve',
                                timeOffBag.timeOffRequest,
                              ),
                              error,
                            })
                          }
                        >
                          {isCancellationRequest(timeOffBag.timeOffRequest)
                            ? 'Approve cancellation'
                            : 'Approve'}
                        </ApproveButton>
                      </div>
                    )}
                  </ReviewStep>
                  <div className='buttons-container'>
                    <BackButton className='back-button' onClick={clearDecision}>
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
