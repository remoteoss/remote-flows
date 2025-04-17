import {
  ContractAmendmentAutomatableResponse,
  ContractAmendmentFlow,
  RemoteFlows,
  RenderProps,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function AmendmentFlow({ contractAmendmentBag, components }: RenderProps) {
  const { Form, SubmitButton, ConfirmationForm, BackButton } = components;
  const [automatable, setAutomatable] = useState<
    ContractAmendmentAutomatableResponse | undefined
  >();

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
          <Form onSuccess={handleSuccess} />
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
            {Object.entries(contractAmendmentBag.values).map(([key, value]) => {
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
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <ContractAmendmentFlow
          countryCode="PRT"
          employmentId="b98b7127-d90f-4f5b-b02d-457d65707d35"
          render={AmendmentFlow}
        />
      </div>
    </RemoteFlows>
  );
}
