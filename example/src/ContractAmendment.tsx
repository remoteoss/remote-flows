import {
  ContractAmendmentAutomatableResponse,
  ContractAmendmentFlow,
  ContractAmendmentRenderProps,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { components } from './Components';
import './css/main.css';

function AmendmentFlow({
  contractAmendmentBag,
  components,
}: ContractAmendmentRenderProps) {
  const { Form, SubmitButton, ConfirmationForm, BackButton } = components;

  const [automatable, setAutomatable] = useState<
    ContractAmendmentAutomatableResponse | undefined
  >();
  const [error, setError] = useState<string | null>(null);

  function handleSuccess(data: ContractAmendmentAutomatableResponse) {
    setAutomatable(data);
  }

  if (contractAmendmentBag.isLoading) {
    return <div>Loading employment...</div>;
  }

  switch (contractAmendmentBag.stepState.currentStep.name) {
    case 'form':
      return (
        <div className="amendment_form">
          <Form
            onSuccess={handleSuccess}
            onError={(err) => {
              if (
                'message' in err &&
                err.message === 'no_changes_detected_contract_details'
              ) {
                setError(err.message);
              }
            }}
          />
          {error && (
            <div className="amendment_form__error">
              <p className="amendment_form__error__title">
                Contract detail change required
              </p>
              <p>
                You haven't changed any contract detail value yet. Please change
                at least one value in order to be able to proceed with the
                request.
              </p>
            </div>
          )}
          <SubmitButton
            className="amendment_form__buttons__submit"
            disabled={contractAmendmentBag.isSubmitting}
          >
            Go to preview and confirm changes
          </SubmitButton>
        </div>
      );
    case 'confirmation_form':
      return (
        <div className="confirmation_form">
          <ConfirmationForm />
          <div>
            {Object.entries(
              contractAmendmentBag.stepState.values?.form || {},
            ).map(([key, value]) => {
              // @ts-expect-error error
              const initialValue = contractAmendmentBag.initialValues[key];
              if (initialValue !== value) {
                const label = contractAmendmentBag.fields.find(
                  (field) => field.name === key,
                )?.label as string;
                return (
                  <div className="confirmation_form__item" key={key}>
                    <p>{label}:</p>
                    {initialValue ? (
                      <div className="confirmation_form__item__value">
                        <span className="confirmation_form__item__value__initial">
                          {initialValue}
                        </span>
                        <span>&rarr;</span>
                        <span>{value as string}</span>
                      </div>
                    ) : (
                      <div className="confirmation_form__item__value">
                        <span>{value as string}</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
          {automatable?.data?.automatable ? (
            <div>{automatable?.data?.message}</div>
          ) : null}
          <div className="confirmation_form__buttons">
            <SubmitButton
              disabled={contractAmendmentBag.isSubmitting}
              className="confirmation_form__buttons__submit"
            >
              Submit amendment request
            </SubmitButton>
            <BackButton className="confirmation_form__buttons__back">
              Back
            </BackButton>
          </div>
        </div>
      );
  }
}

export function ContractAmendment() {
  const EMPLOYMENT_ID = 'b98b7127-d90f-4f5b-b02d-457d65707d35'; // set another employment ID here as it will probably fail for you
  return (
    <RemoteFlows
      components={components}
      proxy={{ url: 'http://localhost:3001/' }}
    >
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <ContractAmendmentFlow
          countryCode="PRT"
          employmentId={EMPLOYMENT_ID}
          render={AmendmentFlow}
        />
      </div>
    </RemoteFlows>
  );
}
