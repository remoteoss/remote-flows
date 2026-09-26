import {
  ContractDocumentFlow,
  ContractDocumentForm,
  ContractDocumentPreviewForm,
  ContractDocumentReviewButton,
  ContractDocumentSubmitButton,
  NormalizedFieldError,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import { AlertError } from './AlertError';
import { EmploymentIdForm } from './components/EmploymentIdForm';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

function CreateContractDocument({ employmentId }: { employmentId: string }) {
  const [errors, setErrors] = useState<{
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }>({ apiError: '', fieldErrors: [] });

  return (
    <ContractDocumentFlow
      employmentId={employmentId}
      render={(contractDocumentBag) => {
        if (contractDocumentBag.isLoading) {
          return <div>Loading contract document...</div>;
        }

        const { steps, stepState } = contractDocumentBag;

        return (
          <>
            <div className='steps-navigation'>
              <ul>
                {steps.map((step) => (
                  <li
                    key={step.name}
                    className={`step-item ${step.name === stepState.currentStep.name ? 'active' : ''}`}
                  >
                    {step.index + 1}. {step.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className='card' style={{ marginBottom: '20px' }}>
              <h1 className='heading'>
                {stepState.currentStep.name === 'contract_details'
                  ? 'Contract Details'
                  : 'Contract Preview'}
              </h1>
              {stepState.currentStep.name === 'contract_details' ? (
                <>
                  <ContractDocumentForm
                    onError={({ error, fieldErrors }) =>
                      setErrors({ apiError: error.message, fieldErrors })
                    }
                  />
                  <AlertError errors={errors} />
                  {contractDocumentBag.canSkipAiValidation && (
                    <p className='mt-3'>
                      AI validation detected potential compliance issues. Edit
                      the Services and Deliverables field above, or continue at
                      your own risk by submitting again.
                    </p>
                  )}
                  <ContractDocumentSubmitButton
                    className='submit-button mt-3'
                    onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
                  >
                    {contractDocumentBag.canSkipAiValidation
                      ? 'Continue anyway'
                      : 'Next Step'}
                  </ContractDocumentSubmitButton>
                </>
              ) : (
                <>
                  <ContractDocumentPreviewForm />
                  <div className='buttons-container'>
                    <button
                      type='button'
                      className='back-button'
                      onClick={contractDocumentBag.back}
                    >
                      Back
                    </button>
                    <ContractDocumentReviewButton
                      className='submit-button'
                      render={({ reviewCompleted }) =>
                        reviewCompleted ? 'Review again' : 'Review contract'
                      }
                    />
                  </div>
                  <p className='mt-3'>Signing: to be continued…</p>
                </>
              )}
            </div>
          </>
        );
      }}
    />
  );
}

export function ContractDocument() {
  const [employmentId, setEmploymentId] = useState<string | null>(null);

  if (employmentId) {
    return (
      <RemoteFlows proxy={{ url: window.location.origin }}>
        <CreateContractDocument employmentId={employmentId} />
      </RemoteFlows>
    );
  }

  return (
    <EmploymentIdForm
      defaultValue={import.meta.env.VITE_CONTRACT_DOCUMENT_EMPLOYMENT_ID}
      submitLabel='Create contract document'
      onSubmit={setEmploymentId}
    />
  );
}
