import {
  ContractAmendmentAutomatableResponse,
  ContractAmendmentFlow,
  RemoteFlows,
  RenderProps,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function AmendmentFlow({ contractAmendmentBag, components }: RenderProps) {
  const { Form, SubmitButton, ConfirmationForm } = components;
  const [automatable, setAutomatable] = useState<
    ContractAmendmentAutomatableResponse | undefined
  >();

  function handleSuccess(data: ContractAmendmentAutomatableResponse) {
    console.log('Success:', data);
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
          {automatable?.data?.automatable ? (
            <div>{automatable?.data?.message}</div>
          ) : null}
          <SubmitButton
            disabled={contractAmendmentBag.isSubmitting}
            style={{
              backgroundColor: 'black',
              color: 'white',
              marginTop: 20,
            }}
          >
            Submit amendment request
          </SubmitButton>
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
      <ContractAmendmentFlow
        countryCode="PRT"
        employmentId="2ef4068b-11c7-4942-bb3c-70606c83688e"
        render={AmendmentFlow}
      />
    </RemoteFlows>
  );
}
