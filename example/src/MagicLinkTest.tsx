import { useMagicLink } from '@remoteoss/remote-flows';
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
import { ExternalLink, Loader2, CheckCircle2, XCircle } from 'lucide-react';

type StatusType = 'idle' | 'loading' | 'success' | 'error';

const MagicLinkTestContent = () => {
  const magicLink = useMagicLink();
  const [customPath, setCustomPath] = useState(
    '/dashboard/company-settings/payments',
  );
  const [userId, setUserId] = useState(import.meta.env.VITE_USER_ID || '');
  const [status, setStatus] = useState<StatusType>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const generateMagicLink = async (path: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!userId) {
      setStatus('error');
      setErrorMessage('User ID is required');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await magicLink.mutateAsync({
        path,
        user_id: userId,
      });

      if (response.data) {
        window.open(response.data.data.url, '_blank', 'noopener,noreferrer');
        setStatus('success');
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
          timeoutRef.current = null;
        }, 3000);
      } else {
        setStatus('error');
        setErrorMessage('No URL returned from API');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to generate magic link',
      );
    }
  };

  return (
    <div className='space-y-6'>
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Set up your magic link parameters</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='userId' className='text-sm font-medium'>
              User ID
            </label>
            <input
              id='userId'
              type='text'
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder='Enter user ID'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <p className='text-xs text-gray-500'>
              This is pre-filled from VITE_USER_ID environment variable
            </p>
          </div>

          <div className='space-y-2'>
            <label htmlFor='customPath' className='text-sm font-medium'>
              Custom Path
            </label>
            <div className='flex gap-2'>
              <input
                id='customPath'
                type='text'
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder='/dashboard/...'
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <Button
                onClick={() => generateMagicLink(customPath)}
                disabled={status === 'loading' || !userId}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <ExternalLink className='mr-2 h-4 w-4' />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <span className='text-sm text-green-800'>
                Magic link generated and opened in new tab!
              </span>
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
    </div>
  );
};

export const MagicLinkTest = () => {
  return (
    <RemoteFlows authType='refresh-token'>
      <MagicLinkTestContent />
    </RemoteFlows>
  );
};
