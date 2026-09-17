import { ContractDocumentFlow } from '@remoteoss/remote-flows';
import { useState } from 'react';
import { EmploymentIdForm } from './components/EmploymentIdForm';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

function CreateContractDocument({ employmentId }: { employmentId: string }) {
  return (
    <ContractDocumentFlow
      employmentId={employmentId}
      render={(contractDocumentBag) => {
        if (contractDocumentBag.isLoading) {
          return <div>Loading…</div>;
        }

        return (
          <div className='onboarding-form-container'>
            <h2>Create contract document</h2>
            <p>
              {contractDocumentBag.employment?.full_name}
              {contractDocumentBag.isContractorOfRecord &&
                ' (Contractor of Record)'}
            </p>
            <p>To be continued…</p>
          </div>
        );
      }}
    />
  );
}

export function ContractDocument() {
  const [employmentId, setEmploymentId] = useState<string | null>(null);

  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        {employmentId ? (
          <CreateContractDocument employmentId={employmentId} />
        ) : (
          <EmploymentIdForm
            defaultValue={import.meta.env.VITE_CONTRACT_DOCUMENT_EMPLOYMENT_ID}
            submitLabel='Create contract document'
            onSubmit={setEmploymentId}
          />
        )}
      </div>
    </RemoteFlows>
  );
}
