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
        <>
          <Form onSuccess={handleSuccess} />
          <SubmitButton
            disabled={contractAmendmentBag.isSubmitting}
            style={{
              backgroundColor: 'black',
              color: 'white',
              marginTop: 20,
            }}
          >
            Go to preview and confirm changes
          </SubmitButton>
        </>
      );
    case 'confirmation_form':
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ConfirmationForm />
          <div>
            {Object.entries(contractAmendmentBag.values).map(([key, value]) => {
              const initialValue = contractAmendmentBag.initialValues[key];
              if (initialValue !== value) {
                const label = contractAmendmentBag.fields.find(
                  (field) => field.name === key,
                )?.label as string;
                return (
                  <div
                    key={key}
                    style={{
                      paddingBottom: 10,
                      marginTop: 10,
                      borderBottom: '1px solid #F0F0F0',
                    }}
                  >
                    <p>{label}:</p>
                    {initialValue ? (
                      <div style={{ display: 'flex', gap: 20 }}>
                        <span style={{ textDecoration: 'line-through' }}>
                          {initialValue}
                        </span>
                        <span>&rarr;</span>
                        <span>{value}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 20 }}>
                        <span>{value}</span>
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
          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            <SubmitButton
              disabled={contractAmendmentBag.isSubmitting}
              style={{
                backgroundColor: 'black',
                color: 'white',
              }}
            >
              Submit amendment request
            </SubmitButton>
            <BackButton
              style={{
                border: '1px solid black',
              }}
            >
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
          employmentId="2ef4068b-11c7-4942-bb3c-70606c83688e"
          render={AmendmentFlow}
        />
      </div>
    </RemoteFlows>
  );
}
