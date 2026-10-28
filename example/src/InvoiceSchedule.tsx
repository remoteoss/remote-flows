import {
  InvoiceScheduleFlow,
  InvoiceScheduleForm,
  InvoiceSchedulePreviewButton,
  InvoiceScheduleSubmitButton,
} from '@remoteoss/remote-flows';
import { Alert, AlertDescription } from '@remoteoss/remote-flows/internals';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { EmploymentIdForm } from './components/EmploymentIdForm';
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
              <Alert className='mb-4'>
                <AlertCircle />
                <AlertDescription>
                  This contractor is a Contractor of Record, so only one-off
                  invoices can be scheduled.
                </AlertDescription>
              </Alert>
            )}

            {invoiceScheduleBag.employment?.has_active_withdrawal_method ===
              false && (
              <Alert variant='warning' className='mb-4'>
                <AlertCircle />
                <AlertDescription>
                  {(invoiceScheduleBag.employment.basic_information?.name as
                    | string
                    | undefined) || 'This contractor'}{' '}
                  does not have an active deposit method on their account yet.
                  Schedule this invoice and we&apos;ll reach out to them to get
                  one added.
                </AlertDescription>
              </Alert>
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
  const [employmentId, setEmploymentId] = useState<string | null>(null);

  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        {employmentId ? (
          <CreateInvoiceSchedule employmentId={employmentId} />
        ) : (
          <EmploymentIdForm
            defaultValue={import.meta.env.VITE_INVOICE_SCHEDULE_EMPLOYMENT_ID}
            submitLabel='Create invoice schedule'
            onSubmit={setEmploymentId}
          />
        )}
      </div>
    </RemoteFlows>
  );
}
