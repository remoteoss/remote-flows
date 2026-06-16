import { useState } from 'react';
import {
  PayrollAdminOnboardingFlow,
  PayrollAdminOnboardingRenderProps,
  useGPLegalEntities,
} from '@remoteoss/remote-flows';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';

const COMPANY_ID = import.meta.env.VITE_COMPANY_ID as string;

const STEP_LABELS: Record<string, string> = {
  select_country: 'Country & Basic Info',
  contract_details: 'Contract Details',
  administrative_details: 'Administrative Details',
  invite: 'Send Invitation',
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  select_country:
    "Select the employee's country and fill in their basic information.",
  contract_details:
    'Define the employment contract terms for this Global Payroll employee.',
  administrative_details:
    'Provide administrative details required for payroll processing.',
  invite:
    'Send the invitation email so the employee can complete their self-onboarding.',
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

function AdminFlowForm({ legalEntityId }: { legalEntityId: string }) {
  const [errors, setErrors] = useState<Errors>(emptyErrors);
  const [done, setDone] = useState(false);

  const clearErrors = () => setErrors(emptyErrors);

  const handleError = (error: Error, fieldErrors: Errors['fieldErrors']) => {
    setErrors({ apiError: error.message, fieldErrors });
  };

  if (done) {
    return (
      <div className='card' style={{ marginBottom: 20 }}>
        <h1 className='heading'>Invitation Sent</h1>
        <p style={{ color: '#22356f', marginBottom: 16 }}>
          The employee will receive an email to complete their self-onboarding.
        </p>
        <div className='buttons-container'>
          <button
            className='submit-button'
            onClick={() => {
              setDone(false);
              clearErrors();
            }}
          >
            Start a new onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <PayrollAdminOnboardingFlow
      companyId={COMPANY_ID}
      legalEntityId={legalEntityId}
      render={({ adminBag, components }: PayrollAdminOnboardingRenderProps) => {
        const {
          SelectCountryStep,
          ContractDetailsStep,
          AdministrativeDetailsStep,
          InvitationStep,
          SubmitButton,
          BackButton,
        } = components;

        const currentStep = adminBag.stepState.currentStep.name;
        const allSteps = Object.entries(STEP_LABELS);

        if (adminBag.isLoading && !adminBag.countryCode) {
          return <p>Loading...</p>;
        }

        const onStepError = (e: {
          error: Error;
          fieldErrors: { field: string; messages: string[] }[];
        }) =>
          handleError(
            e.error,
            e.fieldErrors.map((fe) => ({
              ...fe,
              userFriendlyLabel: fe.field,
            })),
          );

        const renderStep = () => {
          switch (currentStep) {
            case 'select_country': {
              const isFormReady =
                !!adminBag.countryCode && adminBag.fields.length > 0;
              return (
                <>
                  <SelectCountryStep
                    onError={onStepError}
                    onSuccess={clearErrors}
                  />
                  <AlertError errors={errors} />
                  {isFormReady && (
                    <div className='buttons-container'>
                      <SubmitButton
                        className='submit-button'
                        onClick={clearErrors}
                      >
                        Create Employment & Continue
                      </SubmitButton>
                    </div>
                  )}
                </>
              );
            }
            case 'contract_details':
              return (
                <>
                  <ContractDetailsStep
                    onError={onStepError}
                    onSuccess={clearErrors}
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
                      Save & Continue
                    </SubmitButton>
                  </div>
                </>
              );
            case 'administrative_details':
              return (
                <>
                  <AdministrativeDetailsStep
                    onError={onStepError}
                    onSuccess={clearErrors}
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
                      Save & Continue
                    </SubmitButton>
                  </div>
                </>
              );
            case 'invite':
              return (
                <>
                  <AlertError errors={errors} />
                  <div className='buttons-container'>
                    <BackButton className='back-button' onClick={clearErrors}>
                      Previous Step
                    </BackButton>
                    <InvitationStep
                      onSuccess={() => {
                        clearErrors();
                        setDone(true);
                      }}
                      onError={onStepError}
                    >
                      Send Invitation
                    </InvitationStep>
                  </div>
                </>
              );
            default:
              return null;
          }
        };

        return (
          <>
            <div className='steps-navigation'>
              <ul>
                {allSteps.map(([key, label], index) => (
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
              {renderStep()}
            </div>
          </>
        );
      }}
    />
  );
}

function GPAdminOnboardingInner() {
  const { data: legalEntities, isLoading } = useGPLegalEntities(COMPANY_ID);

  if (isLoading) {
    return <p>Loading…</p>;
  }

  if (!legalEntities || legalEntities.length === 0) {
    return (
      <div className='alert'>
        <p>
          <strong>No GP-enabled legal entity found.</strong> The company{' '}
          <code>{COMPANY_ID}</code> has no legal entity with Global Payroll
          enabled.
        </p>
      </div>
    );
  }

  return <AdminFlowForm legalEntityId={legalEntities[0].id} />;
}

export function PayrollAdminOnboardingForm() {
  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <GPAdminOnboardingInner />
    </RemoteFlows>
  );
}
