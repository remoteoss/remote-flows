import {
  InvoiceScheduleFlow,
  InvoiceScheduleForm,
  InvoiceScheduleSubmitButton,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

export function InvoiceSchedule() {
  const [createdScheduleId, setCreatedScheduleId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <InvoiceScheduleFlow
          render={(invoiceScheduleBag) => {
            // Only the initial load — deliberately not isLoadingContractorDetails, which
            // goes true after a contractor is chosen and would unmount the form.
            if (invoiceScheduleBag.isLoading) {
              return <div>Loading contractors…</div>;
            }

            if (invoiceScheduleBag.contractorsError) {
              return <div>Could not load your contractors.</div>;
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
                  Use this to schedule invoices on behalf of your contractors.
                  Select a contractor, enter details about their services and
                  set the invoice frequency.
                </p>

                {invoiceScheduleBag.contractors.isTruncated && (
                  <p>
                    Showing {invoiceScheduleBag.contractors.contractors.length}{' '}
                    of {invoiceScheduleBag.contractors.totalCount} contractors.
                  </p>
                )}

                {invoiceScheduleBag.isLoadingContractorDetails && (
                  <p>Loading this contractor's currencies…</p>
                )}

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

                <InvoiceScheduleSubmitButton>
                  Create schedule
                </InvoiceScheduleSubmitButton>
              </>
            );
          }}
        />
      </div>
    </RemoteFlows>
  );
}
