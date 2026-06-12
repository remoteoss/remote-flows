import { useState, useMemo } from 'react';
import {
  PayrollEmployeeFederalTaxesFlow,
  PayrollEmployeeFederalTaxesRenderProps,
} from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';

const COUNTRY_CODE = (import.meta.env.VITE_GP_COUNTRY_CODE as string) || 'USA';
const EMPLOYMENT_ID = (import.meta.env.VITE_EMPLOYMENT_ID as string) || '';

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

function NotAvailableState({
  reason,
}: {
  reason: 'unsupported_country' | 'pending_enrollment';
}) {
  return (
    <div className='card' style={{ marginBottom: 20 }}>
      <h1 className='heading'>Federal taxes not available</h1>
      {reason === 'unsupported_country' ? (
        <p style={{ color: '#22356f' }}>
          The federal taxes (W-4) step is only available for USA employments.
        </p>
      ) : (
        <p style={{ color: '#22356f' }}>
          Your employment isn&apos;t active yet. Once your employer marks your
          employment as active, the federal taxes form will become available
          here.
        </p>
      )}
    </div>
  );
}

function FederalTaxesFlowInner({ employmentId }: { employmentId: string }) {
  const [errors, setErrors] = useState<Errors>(emptyErrors);
  const [done, setDone] = useState(false);

  const clearErrors = () => setErrors(emptyErrors);
  const handleError = (error: Error, fieldErrors: Errors['fieldErrors']) =>
    setErrors({ apiError: error.message, fieldErrors });

  if (done) {
    return (
      <div className='card' style={{ marginBottom: 20 }}>
        <h1 className='heading'>W-4 preferences saved</h1>
        <p style={{ color: '#22356f', marginBottom: 16 }}>
          Your federal tax withholding preferences have been submitted.
        </p>
        <div className='buttons-container'>
          <button
            className='submit-button'
            onClick={() => {
              setDone(false);
              clearErrors();
            }}
          >
            Edit again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PayrollEmployeeFederalTaxesFlow
      employmentId={employmentId}
      countryCode={COUNTRY_CODE}
      render={({
        flowBag,
        components,
      }: PayrollEmployeeFederalTaxesRenderProps) => {
        const { FederalTaxesStep, SubmitButton } = components;

        if (flowBag.isLoading) {
          return <p>Loading...</p>;
        }

        if (!flowBag.isAvailable && flowBag.unavailableReason) {
          return <NotAvailableState reason={flowBag.unavailableReason} />;
        }

        return (
          <div className='card' style={{ marginBottom: 20 }}>
            <h1 className='heading'>Federal Taxes (W-4)</h1>
            <p style={{ fontSize: 14, color: '#71717A', marginBottom: 24 }}>
              Set your federal income tax withholding preferences. These values
              are used to compute the federal tax withheld from your paychecks.
            </p>

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
                setDone(true);
              }}
            />
            <AlertError errors={errors} />
            {flowBag.fields.length > 0 && (
              <div className='buttons-container'>
                <SubmitButton className='submit-button' onClick={clearErrors}>
                  Save preferences
                </SubmitButton>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}

function FederalTaxesFlowForm({ employmentId }: { employmentId: string }) {
  const employeeAuth = useMemo(
    () => buildEmployeeAuth(employmentId),
    [employmentId],
  );

  return (
    // Employee-scoped token for schema fetch + PUT /v1/employee/federal-taxes.
    // The onboarding-steps probe inside the flow uses this same token; for
    // step status only (no writes), the gateway accepts the employee token.
    <RemoteFlows proxy={{ url: window.location.origin }} auth={employeeAuth}>
      <FederalTaxesFlowInner employmentId={employmentId} />
    </RemoteFlows>
  );
}

function GPEmployeeFederalTaxesInner() {
  const [employmentId, setEmploymentId] = useState(EMPLOYMENT_ID);
  const [submitted, setSubmitted] = useState(!!EMPLOYMENT_ID);

  if (!submitted) {
    return (
      <div className='card' style={{ marginBottom: 20 }}>
        <h1 className='heading'>Federal Taxes (W-4)</h1>
        <p style={{ fontSize: 14, color: '#71717A', marginBottom: 24 }}>
          Enter the employment ID to set W-4 federal tax preferences.
        </p>
        <div className='alert' style={{ marginBottom: 16 }}>
          <p style={{ margin: 0 }}>
            <strong>Prerequisite:</strong> The employment must be{' '}
            <strong>active</strong> (post-enrollment) and the country must be{' '}
            <strong>USA</strong>. If either condition isn&apos;t met,
            you&apos;ll see a not-available state.
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
            Continue
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
      <FederalTaxesFlowForm employmentId={employmentId} />
    </div>
  );
}

export function PayrollEmployeeFederalTaxesForm() {
  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <GPEmployeeFederalTaxesInner />
    </RemoteFlows>
  );
}
