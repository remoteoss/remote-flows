import React, { useState } from 'react';
import {
  ContractorContractCreationFlow,
  ContractorContractCreationRenderProps,
  ContractorContractCreationFormPayload,
  ContractorContractCreationResponse,
  NormalizedFieldError,
} from '@remoteoss/remote-flows';
import { Card } from '@remoteoss/remote-flows/internals';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';
import './css/contractor-onboarding.css';

type ContractorContractCreationFormProps = {
  contractorContractCreationBag: ContractorContractCreationRenderProps['flowBag'];
  components: ContractorContractCreationRenderProps['components'];
};

const ContractorContractCreationFormView = ({
  contractorContractCreationBag,
  components,
}: ContractorContractCreationFormProps) => {
  const { Form, SubmitButton } = components;
  const [errors, setErrors] = useState<{
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }>({
    apiError: '',
    fieldErrors: [],
  });

  return (
    <>
      <Header />
      <Card className='px-0 py-0'>
        {contractorContractCreationBag.isLoading ? (
          <div className='contractor-onboarding-form-layout'>
            <p>Loading...</p>
          </div>
        ) : (
          <div className='contractor-onboarding-form-layout'>
            <div className='mb-6'>
              <h2 className='text-xl font-bold mb-2'>Contract Details</h2>
              <p className='text-sm text-gray-600'>
                Create a new contract for this contractor
              </p>
            </div>

            <Form
              defaultValues={contractorContractCreationBag.initialValues}
              onSubmit={async (payload: ContractorContractCreationFormPayload) => {
                // onSubmit callback is called before API call
              }}
            />

            <AlertError errors={errors} />

            {contractorContractCreationBag.canSkipAiValidation && (
              <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-yellow-400'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-yellow-700'>
                      AI validation detected potential compliance issues. You can
                      edit the Services and Deliverables field above or continue at
                      your own risk by clicking Submit again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className='contractor-onboarding-buttons-container mt-6'>
              <SubmitButton
                className='submit-button'
                onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
              >
                {contractorContractCreationBag.canSkipAiValidation
                  ? 'Continue Anyway'
                  : 'Create Contract'}
              </SubmitButton>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

const Header = () => {
  return (
    <div className='contractor-onboarding-header'>
      <h1>Contractor Contract Creation</h1>
      <p>Create a new contract for an existing contractor.</p>
    </div>
  );
};

type ContractorContractCreationFormData = {
  employmentId?: string;
};

export const ContractorContractCreationWithProps = ({
  employmentId,
}: ContractorContractCreationFormData) => {
  return (
    <div className='contractor-onboarding-container'>
      <RemoteFlows
        authType='company-manager'
        proxy={{ url: window.location.origin }}
      >
        <div className='contractor-onboarding-content'>
          <ContractorContractCreationFlow
            employmentId={employmentId || ''}
            initialValues={{}}
            onSubmit={(payload: ContractorContractCreationFormPayload) => {
              console.log('onSubmit payload:', payload);
            }}
            onSuccess={(response: ContractorContractCreationResponse) => {
              console.log('onSuccess response:', response);
              alert('Contract created successfully!');
            }}
            onError={({ error, fieldErrors }) => {
              console.error('onError:', error, fieldErrors);
            }}
            render={({ flowBag, components }) => (
              <ContractorContractCreationFormView
                contractorContractCreationBag={flowBag}
                components={components}
              />
            )}
          />
        </div>
      </RemoteFlows>
    </div>
  );
};

export const ContractorContractCreationForm = () => {
  const [formData, setFormData] = useState<ContractorContractCreationFormData>({
    employmentId:
      import.meta.env.VITE_CONTRACTOR_MANAGEMENT_EMPLOYMENT_ID || '',
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employmentId) {
      alert('Please enter an employment ID');
      return;
    }
    setShowForm(true);
  };

  if (showForm) {
    return <ContractorContractCreationWithProps {...formData} />;
  }

  return (
    <form onSubmit={handleSubmit} className='onboarding-form-container'>
      <div className='onboarding-form-group'>
        <label htmlFor='employmentId' className='onboarding-form-label'>
          Employment ID:
        </label>
        <input
          id='employmentId'
          type='text'
          value={formData.employmentId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, employmentId: e.target.value }))
          }
          placeholder='Enter contractor employment ID'
          className='onboarding-form-input'
          required
        />
      </div>
      <button type='submit' className='onboarding-form-button'>
        Create Contract
      </button>
    </form>
  );
};
