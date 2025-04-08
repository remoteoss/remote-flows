import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationFormValues,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  ContractAmendmentFlow,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
  includePremiumBenefits: true,
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationFormValues | null>(null);

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(buildCostCalculatorEstimationPayload(payload), {
        onSuccess: (response) => {
          if (response?.data?.data?.content !== undefined) {
            const a = document.createElement('a');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a.href = response.data.data.content as any;
            a.download = 'estimation.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        },
        onError: (error) => {
          console.error({ error });
        },
      });
    }
  };
  return (
    <>
      <ContractAmendmentFlow
        countryCode="PRT"
        employmentId="87b7f5c9-6b9a-4bcb-b23d-b359a47b6a33"
        // options={{
        //   jsfModify: {
        //     fields: {
        //       reason_for_change: () => ({
        //         title: `Why are you changing the contract?`,
        //       }),
        //     },
        //   },
        // }}
        render={({ contractAmendmentBag, components }: any) => {
          if (contractAmendmentBag.isLoading) {
            return <div>Loading employment...</div>;
          }

          const { ContractAmendmentForm, ContractAmendmentSubmit } = components;
          return (
            <>
              <ContractAmendmentForm />
              <ContractAmendmentSubmit>Amend</ContractAmendmentSubmit>
            </>
          );
        }}
      />
      {/* <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }

          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => setPayload(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>} */}
    </>
  );
}

export function CostCalculatorWithPremiumBenefits() {
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
    <RemoteFlows
      components={{
        date: ({ field, metadata }) => {
          console.log(field);
          return null;
        },
        text: ({ field, metadata }) => {
          return (
            <div
              className="text-sm"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <label htmlFor={field.name}>{metadata.label}</label>
              <input
                id={field.name}
                {...field}
                style={{ border: '1px solid pink' }}
              />
            </div>
          );
        },
      }}
      auth={() => fetchToken()}
    >
      <div style={{ padding: '120px' }}>
        <CostCalculatorFormDemo />
      </div>
    </RemoteFlows>
  );
}
