import {
  InvoiceScheduleFlow,
  InvoiceScheduleForm,
  InvoiceSchedulePreviewButton,
  InvoiceScheduleSubmitButton,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

function CreateInvoiceSchedule({ employmentId }: { employmentId: string }) {
  const [createdScheduleId, setCreatedScheduleId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  return (
    <InvoiceScheduleFlow
      employmentId={employmentId}
      render={(invoiceScheduleBag) => {
        // True until the currencies and the employment have both arrived, so the form is
        // only shown once the Contractor-of-Record restriction is known.
        if (invoiceScheduleBag.isLoading) {
          return <div>Loading…</div>;
        }

        if (createdScheduleId) {
          return (
            <div>
              <h2>Invoice schedule created</h2>
              <p>Schedule ID: {createdScheduleId}</p>
            </div>
          );
        }

        return (
          <>
            <h2>Create invoice schedule</h2>
            <p>
              Use this to schedule invoices on behalf of your contractor. Enter
              details about their services and set the invoice frequency.
            </p>

            {invoiceScheduleBag.isContractorOfRecord && (
              <p>
                This contractor is a Contractor of Record, so only one-off
                invoices can be scheduled.
              </p>
            )}

            <InvoiceScheduleForm
              onSuccess={(data) => {
                setError(null);
                setCreatedScheduleId(
                  data?.data?.successes?.[0]?.id ?? 'unknown',
                );
              }}
              onError={({ error }) => setError(error.message)}
            />

            {error && <p>{error}</p>}

            <InvoiceSchedulePreviewButton
              onError={({ error }) => setError(error.message)}
            >
              {invoiceScheduleBag.isPreviewingInvoice
                ? 'Generating preview…'
                : 'Preview invoice'}
            </InvoiceSchedulePreviewButton>

            <InvoiceScheduleSubmitButton>
              Create schedule
            </InvoiceScheduleSubmitButton>
          </>
        );
      }}
    />
  );
}

export function InvoiceSchedule() {
  // The flow is told which contractor it is acting on; sourcing that id is the consumer's
  // job. This demo asks for it, the way the Termination demo does.
  const [employmentId, setEmploymentId] = useState<string>(
    import.meta.env.VITE_INVOICE_SCHEDULE_EMPLOYMENT_ID ?? '',
  );
  const [startedFor, setStartedFor] = useState<string | null>(null);

  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        {startedFor ? (
          <CreateInvoiceSchedule employmentId={startedFor} />
        ) : (
          <form
            className='onboarding-form-container'
            onSubmit={(event) => {
              event.preventDefault();
              setStartedFor(employmentId);
            }}
          >
            <div className='onboarding-form-group'>
              <label htmlFor='employmentId' className='onboarding-form-label'>
                Employment ID:
              </label>
              <input
                id='employmentId'
                type='text'
                value={employmentId}
                onChange={(event) => setEmploymentId(event.target.value)}
                placeholder='Enter employment ID'
                className='onboarding-form-input'
              />
            </div>
            <button type='submit' className='onboarding-form-button'>
              Create invoice schedule
            </button>
          </form>
        )}
      </div>
    </RemoteFlows>
  );
}
