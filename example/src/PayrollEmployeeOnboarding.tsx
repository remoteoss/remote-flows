import { useState, useMemo } from 'react';
import {
  PayrollEmployeeOnboardingFlow,
  PayrollEmployeeOnboardingRenderProps,
} from '@remoteoss/remote-flows';
import { useGPOnboardingSteps } from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';

const COUNTRY_CODE = (import.meta.env.VITE_GP_COUNTRY_CODE as string) || 'AUS';
const EMPLOYMENT_ID = (import.meta.env.VITE_EMPLOYMENT_ID as string) || '';

const STEP_LABELS: Record<string, string> = {
  personal_details: 'Personal Details',
  home_address: 'Home Address',
  bank_account: 'Bank Account',
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  personal_details:
    'Provide your personal information for the employment record.',
  home_address: 'Enter your home address for payroll and compliance purposes.',
  bank_account: 'Add your bank account details to receive payroll payments.',
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

// Fetches an employee-scoped token via the JWT assertion grant.
function buildEmployeeAuth(employmentId: string) {
  return () =>
    fetch(`/api/fetch-employee-token/${employmentId}`)
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token as string,
        expiresIn: (data.expires_in as number) ?? 300,
      }));
}

// ── Step status fetcher (company manager token, outer context) ──────────────

function useEmployeeStepInfo(employmentId: string) {
  const { data: apiSteps, isLoading } = useGPOnboardingSteps(employmentId);
  const selfOnboarding = apiSteps?.find(
    (s: { type: string }) => s.type === 'self_onboarding',
  );
  const substeps = (selfOnboarding?.sub_steps ?? []) as { type: string }[];
  const hasBankAccount = substeps.some(
    (s: { type: string }) => s.type === 'employee_provides_bank_details',
  );
  return { substeps, hasBankAccount, isLoading };
}

// ── Employee form (employee-scoped token, inner context) ────────────────────

function EmployeeFlowInner({
  employmentId,
  hasBankAccount,
}: {
  employmentId: string;
  hasBankAccount: boolean;
}) {
  const [errors, setErrors] = useState<Errors>(emptyErrors);
  const [done, setDone] = useState(false);

  const clearErrors = () => setErrors(emptyErrors);
  const handleError = (error: Error, fieldErrors: Errors['fieldErrors']) =>
    setErrors({ apiError: error.message, fieldErrors });

  const allSteps = Object.entries(STEP_LABELS);
  const visibleSteps = hasBankAccount
    ? allSteps
    : allSteps.filter(([key]) => key !== 'bank_account');
  const lastStepKey = visibleSteps[visibleSteps.length - 1][0];

  if (done) {
    return (
      <div className='card' style={{ marginBottom: 20 }}>
        <h1 className='heading'>Self-onboarding Complete</h1>
        <p style={{ color: '#22356f', marginBottom: 16 }}>
          All your information has been submitted. Your employer will review and
          activate your employment.
        </p>
        <div className='buttons-container'>
          <button
            className='submit-button'
            onClick={() => {
              setDone(false);
              clearErrors();
            }}
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <PayrollEmployeeOnboardingFlow
      employmentId={employmentId}
      countryCode={COUNTRY_CODE}
      render={({
        employeeBag,
        components,
      }: PayrollEmployeeOnboardingRenderProps) => {
        const {
          PersonalDetailsStep,
          HomeAddressStep,
          BankAccountStep,
          SubmitButton,
          BackButton,
        } = components;

        const currentStep = employeeBag.stepState.currentStep.name;

        if (employeeBag.isLoading && !employeeBag.fields.length) {
          return <p>Loading...</p>;
        }

        const isLastStep = currentStep === lastStepKey;

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
                    onSuccess={clearErrors}
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
                      if (isLastStep) setDone(true);
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
                      setDone(true);
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
                      Submit
                    </SubmitButton>
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
  const { hasBankAccount, isLoading } = useEmployeeStepInfo(employmentId);
  const employeeAuth = useMemo(
    () => buildEmployeeAuth(employmentId),
    [employmentId],
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    // Inner RemoteFlows uses the employee-scoped token for all mutations
    <RemoteFlows proxy={{ url: window.location.origin }} auth={employeeAuth}>
      <EmployeeFlowInner
        employmentId={employmentId}
        hasBankAccount={hasBankAccount}
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
            employee endpoints only activate after the invitation is sent.
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
    // Outer RemoteFlows uses company manager token to fetch step status
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <GPEmployeeOnboardingInner />
    </RemoteFlows>
  );
}
