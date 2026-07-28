import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@remoteoss/remote-flows/internals';
import { useState, useRef, useEffect } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useSandboxApproveRiskReservePayment } from '@remoteoss/remote-flows';

type StatusType = 'idle' | 'loading' | 'success' | 'error';

const SandboxPaymentApprovalContent = () => {
  const [employmentId, setEmploymentId] = useState(
    import.meta.env.VITE_ONBOARDING_EMPLOYMENT_ID || '',
  );
  const [status, setStatus] = useState<StatusType>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const approvePaymentMutation = useSandboxApproveRiskReservePayment();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleApprovePayment = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!employmentId.trim()) {
      setStatus('error');
      setErrorMessage('Employment ID is required');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await approvePaymentMutation.mutateAsync(employmentId);

      if (response.data) {
        setStatus('success');
        setSuccessMessage(
          `Risk reserve payment approved successfully for employment ${employmentId}`,
        );
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
          setSuccessMessage('');
          timeoutRef.current = null;
        }, 5000);
      } else {
        setStatus('error');
        setErrorMessage('No response data returned from API');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to approve risk reserve payment',
      );
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Sandbox Payment Approval</CardTitle>
          <CardDescription>
            Approve risk reserve proof of payments for employments in sandbox
            environment
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='employmentId' className='text-sm font-medium'>
              Employment ID
            </label>
            <div className='flex gap-2'>
              <input
                id='employmentId'
                type='text'
                value={employmentId}
                onChange={(e) => setEmploymentId(e.target.value)}
                placeholder='Enter employment ID'
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && employmentId.trim()) {
                    handleApprovePayment();
                  }
                }}
              />
              <Button
                onClick={handleApprovePayment}
                disabled={status === 'loading' || !employmentId.trim()}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Approving...
                  </>
                ) : (
                  'Approve Payment'
                )}
              </Button>
            </div>
            <p className='text-xs text-gray-500'>
              This will approve the risk reserve proof of payment without admin
              intervention
            </p>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span className='text-sm text-green-800'>{successMessage}</span>
            </div>
          )}

          {status === 'error' && (
            <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md'>
              <XCircle className='h-5 w-5 text-red-600' />
              <span className='text-sm text-red-800'>{errorMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
          <CardDescription>Endpoint details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm'>
            <div>
              <span className='font-medium'>Endpoint:</span>{' '}
              <code className='bg-gray-100 px-2 py-1 rounded'>
                POST
                /v1/sandbox/employments/:employment_id/risk-reserve-proof-of-payments/approve
              </code>
            </div>
            <div>
              <span className='font-medium'>Description:</span> Approves a risk
              reserve proof of payment without the intervention of a Remote
              admin.
            </div>
            <div>
              <span className='font-medium'>Environment:</span> Sandbox only
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SandboxPaymentApproval = () => {
  return (
    <RemoteFlows authType='refresh-token'>
      <SandboxPaymentApprovalContent />
    </RemoteFlows>
  );
};
