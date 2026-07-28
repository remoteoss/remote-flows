import { useState } from 'react';
import {
  PayrollEmployeeOnboardingFlow,
  PayrollEmployeeOnboardingRenderProps,
  TaxStepUnavailableReason,
  useEmploymentQuery,
} from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';

const EMPLOYMENT_ID = (import.meta.env.VITE_EMPLOYMENT_ID as string) || '';

const STEP_LABELS: Record<string, string> = {
  personal_details: 'Personal Details',
  home_address: 'Home Address',
  bank_account: 'Bank Account',
  federal_taxes: 'Federal Taxes (W-4)',
  state_taxes: 'State Taxes',
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  personal_details:
    'Provide your personal information for the employment record.',
  home_address: 'Enter your home address for payroll and compliance purposes.',
  bank_account: 'Add your bank account details to receive payroll payments.',
  federal_taxes:
    'Set your federal income tax withholding preferences (USA only). Becomes available after your employment is activated.',
  state_taxes:
    'Set your state tax withholding preferences for the selected jurisdiction (USA only). Becomes available after your employment is activated.',
};

type Errors = {
  apiError: string;
  fieldErrors: {
    field: string;
    messages: string[];
    userFriendlyLabel: string;
  }[];
};

const emptyErrors: Errors = { apiError: '', fieldErrors: [] };

// ── Outer-context loader ─────────────────────────────────────────────────────
//
// The employee assertion token can't fetch /v1/employments/:id (returns
// {message} only), so we read country + work jurisdiction from the employment
// here, in an outer RemoteFlows context, and hand them down to the inner
// (employee-token) context as props. This keeps consumers from having to
// hardcode VITE_GP_COUNTRY_CODE / VITE_GP_STATE_JURISDICTION.
//
// This outer context also uses authType='none': the FE doesn't hold a token
// here either — example/api/proxy.js decides the auth strategy per-path via
// getTokenType(), and today that falls through to the same refresh-token
// ('user-token') flow used by most other demos behind this dev proxy, not a
// dedicated company-manager mint.
//
// The bank substep is derived inside the flow from the bag's
// `selfOnboardingSubsteps`, so it isn't fetched here.

function useEmployeeFlowContext(employmentId: string) {
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({ employmentId });

  const countryCode = employment?.country?.code;
  // Prefer the work address state when present; fall back to the home address
  // state. State code is only meaningful for USA — the SDK ignores
  // `jurisdiction` for non-USA employments.
  const workState = (
    employment?.work_address_details as { state?: string } | undefined
  )?.state;
  const homeState = (
    employment?.address_details as { state?: string } | undefined
  )?.state;
  const jurisdiction = workState || homeState;

  return {
    countryCode,
    jurisdiction,
    isLoading: isLoadingEmployment,
  };
}

function TaxStepNotAvailable({
  reason,
  jurisdiction,
}: {
  reason: TaxStepUnavailableReason;
  jurisdiction?: string;
}) {
  let message: string;
  if (reason === 'unsupported_country') {
    message = 'Tax steps are only available for USA employments.';
  } else if (reason === 'no_jurisdiction') {
    message =
      'A US state code is required to submit state taxes — pass a `jurisdiction` prop on the flow.';
  } else if (reason === 'schema_unavailable') {
    message = jurisdiction
      ? `The backend didn't return a form schema for state_taxes (jurisdiction "${jurisdiction}"). Check that the gateway has the schema configured for this country/jurisdiction.`
      : `The backend didn't return a form schema for federal_taxes. Check that the gateway has the schema configured for USA.`;
  } else {
    message = jurisdiction
      ? `Your employment isn't active yet, so the tax_task for jurisdiction "${jurisdiction}" hasn't been created. Come back after activation.`
      : `Your employment isn't active yet, so the federal_taxes tax_task hasn't been created. Come back after activation.`;
  }
  return (
    <div
      className='alert'
      style={{ background: '#fff8e1', borderColor: '#fbc02d' }}
    >
      <p style={{ margin: 0 }}>
        <strong>Step unavailable.</strong> {message}
      </p>
    </div>
  );
}

// ── Employee form (employee-scoped token, inner context) ────────────────────

function EmployeeFlowInner({
  employmentId,
  countryCode,
  jurisdiction,
}: {
  employmentId: string;
  countryCode: string;
  jurisdiction: string | undefined;
}) {
  const [errors, setErrors] = useState<Errors>(emptyErrors);
  // `done` is set only by the explicit "Finish" action on an unavailable tax
  // step. Submit-driven completion is derived reactively from the last
  // successfully-submitted step vs the current last reachable step (below), so
  // a step that stops being last (e.g. enrollment adds tax steps after a bank
  // save) no longer marks the flow complete from a stale render.
  const [done, setDone] = useState(false);
  const [lastSubmittedStep, setLastSubmittedStep] = useState<string | null>(
    null,
  );

  const clearErrors = () => setErrors(emptyErrors);
  const handleError = (error: Error, fieldErrors: Errors['fieldErrors']) =>
    setErrors({ apiError: error.message, fieldErrors });

  const startOver = () => {
    setDone(false);
    setLastSubmittedStep(null);
    clearErrors();
  };

  const isUSA = countryCode === 'USA';

  return (
    <PayrollEmployeeOnboardingFlow
      employmentId={employmentId}
      countryCode={countryCode}
      jurisdiction={isUSA ? jurisdiction : undefined}
      render={({
        employeeBag,
        components,
      }: PayrollEmployeeOnboardingRenderProps) => {
        const {
          PersonalDetailsStep,
          HomeAddressStep,
          BankAccountStep,
          FederalTaxesStep,
          StateTaxesStep,
          SubmitButton,
          BackButton,
        } = components;

        const currentStep = employeeBag.stepState.currentStep.name;

        if (employeeBag.isLoading && !employeeBag.fields.length) {
          return <p>Loading...</p>;
        }

        // Visible steps depend on country + bank substep + jurisdiction. The
        // bank substep comes from the bag (selfOnboardingSubsteps); tax steps
        // are surfaced for USA even if not yet active — the bag exposes a
        // not-available reason so we can render a friendly state in-place.
        const hasBankAccount = employeeBag.selfOnboardingSubsteps.some(
          (s: { type: string }) => s.type === 'employee_provides_bank_details',
        );
        const visibleSteps = Object.entries(STEP_LABELS).filter(([key]) => {
          if (key === 'bank_account') return hasBankAccount;
          if (key === 'federal_taxes') return isUSA;
          if (key === 'state_taxes') return isUSA && !!jurisdiction;
          return true;
        });

        // The last *reachable* step mirrors the SDK's own step visibility: tax
        // steps only become navigable post-enrollment (employeeBag.isComplete).
        // Basing "last step" on this — not on the sidebar list above, which
        // surfaces upcoming tax steps early — is what makes Submit/completion
        // fire on the real final step (e.g. bank_account on a pre-enrollment
        // USA run).
        const reachableSteps = Object.entries(STEP_LABELS).filter(([key]) => {
          if (key === 'bank_account') return hasBankAccount;
          if (key === 'federal_taxes') return isUSA && employeeBag.isComplete;
          if (key === 'state_taxes')
            return isUSA && !!jurisdiction && employeeBag.isComplete;
          return true;
        });
        const lastStepKey = reachableSteps[reachableSteps.length - 1][0];
        const isLastStep = currentStep === lastStepKey;

        // Complete when the user explicitly finished, or when the last
        // successfully-submitted step is still the last reachable one. Deriving
        // this per-render (rather than latching in an onSuccess closure) means a
        // step that stops being last — e.g. enrollment flips isComplete and adds
        // tax steps — correctly keeps the flow going instead of completing.
        if (done || lastSubmittedStep === lastStepKey) {
          return (
            <div className='card' style={{ marginBottom: 20 }}>
              <h1 className='heading'>Self-onboarding Complete</h1>
              <p style={{ color: '#22356f', marginBottom: 16 }}>
                All your information has been submitted. Your employer will
                review and activate your employment.
              </p>
              <div className='buttons-container'>
                <button className='submit-button' onClick={startOver}>
                  Start over
                </button>
              </div>
            </div>
          );
        }

        const federalAvail = employeeBag.taxStepsAvailability.federal_taxes;
        const stateAvail = employeeBag.taxStepsAvailability.state_taxes;

        return (
          <>
            <div className='steps-navigation'>
              <ul>
                {visibleSteps.map(([key, label], index) => (
                  <li
                    key={key}
                    className={`step-item ${key === currentStep ? 'active' : ''}`}
                  >
                    <span className='step-number'>{index + 1}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className='card' style={{ marginBottom: 20 }}>
              <h1 className='heading'>{STEP_LABELS[currentStep]}</h1>
              <p style={{ fontSize: 14, color: '#71717A', marginBottom: 24 }}>
                {STEP_DESCRIPTIONS[currentStep]}
              </p>

              {currentStep === 'personal_details' && (
                <>
                  <PersonalDetailsStep
                    onError={(e) =>
                      handleError(
                        e.error,
                        e.fieldErrors.map((fe) => ({
                          ...fe,
                          userFriendlyLabel: fe.field,
                        })),
                      )
                    }
                    onSuccess={() => {
                      clearErrors();
                      setLastSubmittedStep(currentStep);
                    }}
                  />
                  <AlertError errors={errors} />
                  {employeeBag.fields.length > 0 && (
                    <div className='buttons-container'>
                      <SubmitButton
                        className='submit-button'
                        onClick={clearErrors}
                      >
                        Save &amp; Continue
                      </SubmitButton>
                    </div>
                  )}
                </>
              )}

              {currentStep === 'home_address' && (
                <>
                  <HomeAddressStep
                    onError={(e) =>
                      handleError(
                        e.error,
                        e.fieldErrors.map((fe) => ({
                          ...fe,
                          userFriendlyLabel: fe.field,
                        })),
                      )
                    }
                    onSuccess={() => {
                      clearErrors();
                      setLastSubmittedStep(currentStep);
                    }}
                  />
                  <AlertError errors={errors} />
                  <div className='buttons-container'>
                    <BackButton className='back-button' onClick={clearErrors}>
                      Previous Step
                    </BackButton>
                    <SubmitButton
                      className='submit-button'
                      onClick={clearErrors}
                    >
                      {isLastStep ? 'Submit' : 'Save & Continue'}
                    </SubmitButton>
                  </div>
                </>
              )}

              {currentStep === 'bank_account' && hasBankAccount && (
                <>
                  <BankAccountStep
                    onError={(e) =>
                      handleError(
                        e.error,
                        e.fieldErrors.map((fe) => ({
                          ...fe,
                          userFriendlyLabel: fe.field,
                        })),
                      )
                    }
                    onSuccess={() => {
                      clearErrors();
                      setLastSubmittedStep(currentStep);
                    }}
                  />
                  <AlertError errors={errors} />
                  <div className='buttons-container'>
                    <BackButton className='back-button' onClick={clearErrors}>
                      Previous Step
                    </BackButton>
                    <SubmitButton
                      className='submit-button'
                      onClick={clearErrors}
                    >
                      {isLastStep ? 'Submit' : 'Save & Continue'}
                    </SubmitButton>
                  </div>
                </>
              )}

              {currentStep === 'federal_taxes' && (
                <>
                  {federalAvail.isAvailable ? (
                    <FederalTaxesStep
                      onError={(e) =>
                        handleError(
                          e.error,
                          e.fieldErrors.map((fe) => ({
                            ...fe,
                            userFriendlyLabel: fe.field,
                          })),
                        )
                      }
                      onSuccess={() => {
                        clearErrors();
                        setLastSubmittedStep(currentStep);
                      }}
                    />
                  ) : (
                    <TaxStepNotAvailable
                      reason={federalAvail.unavailableReason!}
                    />
                  )}
                  <AlertError errors={errors} />
                  <div className='buttons-container'>
                    <BackButton className='back-button' onClick={clearErrors}>
                      Previous Step
                    </BackButton>
                    {federalAvail.isAvailable ? (
                      <SubmitButton
                        className='submit-button'
                        onClick={clearErrors}
                      >
                        {isLastStep ? 'Submit' : 'Save & Continue'}
                      </SubmitButton>
                    ) : (
                      <button
                        className='submit-button'
                        onClick={() =>
                          isLastStep ? setDone(true) : employeeBag.next()
                        }
                      >
                        {isLastStep ? 'Finish' : 'Skip'}
                      </button>
                    )}
                  </div>
                </>
              )}

              {currentStep === 'state_taxes' && (
                <>
                  {stateAvail.isAvailable ? (
                    <StateTaxesStep
                      onError={(e) =>
                        handleError(
                          e.error,
                          e.fieldErrors.map((fe) => ({
                            ...fe,
                            userFriendlyLabel: fe.field,
                          })),
                        )
                      }
                      onSuccess={() => {
                        clearErrors();
                        setLastSubmittedStep(currentStep);
                      }}
                    />
                  ) : (
                    <TaxStepNotAvailable
                      reason={stateAvail.unavailableReason!}
                      jurisdiction={employeeBag.jurisdiction}
                    />
                  )}
                  <AlertError errors={errors} />
                  <div className='buttons-container'>
                    <BackButton className='back-button' onClick={clearErrors}>
                      Previous Step
                    </BackButton>
                    {stateAvail.isAvailable ? (
                      <SubmitButton
                        className='submit-button'
                        onClick={clearErrors}
                      >
                        Submit
                      </SubmitButton>
                    ) : (
                      <button
                        className='submit-button'
                        onClick={() => setDone(true)}
                      >
                        Finish
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        );
      }}
    />
  );
}

// ── Step info loader (company manager context) then hands off to employee ctx ─

function EmployeeFlowForm({ employmentId }: { employmentId: string }) {
  const { countryCode, jurisdiction, isLoading } =
    useEmployeeFlowContext(employmentId);

  if (isLoading) return <p>Loading...</p>;
  if (!countryCode) {
    return (
      <div
        className='alert'
        style={{ background: '#fee', borderColor: '#c33' }}
      >
        <p style={{ margin: 0 }}>
          <strong>Could not determine country</strong> for employment{' '}
          <code>{employmentId}</code>. Check that the employment exists and your
          dev-proxy token (see example/api/proxy.js) has access.
        </p>
      </div>
    );
  }

  return (
    // Inner context: the proxy mints the employee-scoped JWT-bearer token
    // server-side when it sees the x-rf-employment-id header on /v1/employee/*
    // routes. The FE never holds the employee token.
    <RemoteFlows
      proxy={{
        url: window.location.origin,
        headers: { 'x-rf-employment-id': employmentId },
      }}
      authType='none'
    >
      <EmployeeFlowInner
        employmentId={employmentId}
        countryCode={countryCode}
        jurisdiction={jurisdiction}
      />
    </RemoteFlows>
  );
}

// ── Employment ID entry ──────────────────────────────────────────────────────

function GPEmployeeOnboardingInner() {
  const [employmentId, setEmploymentId] = useState(EMPLOYMENT_ID);
  const [submitted, setSubmitted] = useState(!!EMPLOYMENT_ID);

  if (!submitted) {
    return (
      <div className='card' style={{ marginBottom: 20 }}>
        <h1 className='heading'>Employee Self-onboarding</h1>
        <p style={{ fontSize: 14, color: '#71717A', marginBottom: 24 }}>
          Enter the employment ID created by the GP Admin flow to begin
          self-onboarding.
        </p>
        <div className='alert' style={{ marginBottom: 16 }}>
          <p style={{ margin: 0 }}>
            <strong>Prerequisite:</strong> The admin must complete the GP Admin
            Onboarding flow and <strong>send the invitation</strong> first. The
            employee endpoints only activate after the invitation is sent. The
            federal/state tax steps additionally require the employment to be{' '}
            <strong>active</strong>.
          </p>
        </div>
        <div className='onboarding-form-group'>
          <label className='onboarding-form-label' htmlFor='employment-id'>
            Employment ID
          </label>
          <input
            id='employment-id'
            className='onboarding-form-input'
            type='text'
            placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
            value={employmentId}
            onChange={(e) => setEmploymentId(e.target.value.trim())}
          />
        </div>
        <div className='buttons-container'>
          <button
            className='submit-button'
            disabled={!employmentId}
            onClick={() => setSubmitted(true)}
          >
            Start onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
        Employment:{' '}
        <code style={{ fontFamily: 'monospace' }}>{employmentId}</code>{' '}
        <button
          className='button-inline'
          onClick={() => setSubmitted(false)}
          style={{ fontSize: 12 }}
        >
          change
        </button>
      </p>
      <EmployeeFlowForm employmentId={employmentId} />
    </div>
  );
}

export function PayrollEmployeeOnboardingForm() {
  return (
    // Outer context: authType='none' since the FE doesn't hold a token here
    // either — see the useEmployeeFlowContext comment above for how auth is
    // actually resolved for /v1/employments/* through the dev proxy.
    <RemoteFlows proxy={{ url: window.location.origin }} authType='none'>
      <GPEmployeeOnboardingInner />
    </RemoteFlows>
  );
}
