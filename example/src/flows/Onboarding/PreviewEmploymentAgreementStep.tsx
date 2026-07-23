import {
  NormalizedFieldError,
  OnboardingRenderProps,
} from '@remoteoss/remote-flows';
import { downloadFile } from '../../utils';
import {
  Button,
  FullScreenDialog,
  FullScreenDialogContent,
} from '@remoteoss/remote-flows/internals';
import { useState } from 'react';
import { EmploymentAgreementInfoModal } from '../../EmploymentAgreementInfoModal';

export const PreviewEmploymentAgreementStep = ({
  onboardingBag,
  components,
  setErrors,
}: {
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  components: OnboardingRenderProps['components'];
  setErrors: (errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }) => void;
}) => {
  const { PreviewEmploymentAgreementStep, BackButton, SubmitButton } =
    components;
  const pdfContent = onboardingBag.employmentAgreementPreview?.content;
  const pdfUrl = pdfContent
    ? `${pdfContent as unknown as string}#view=FitV&toolbar=0`
    : undefined;

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleDownload = () => {
    if (pdfContent) {
      downloadFile(pdfContent as unknown as string, 'employment-agreement.pdf');
    }
  };

  return (
    <>
      <PreviewEmploymentAgreementStep />
      <div className='space-y-4'>
        <Button
          onClick={() => {
            setShowPreviewModal(true);
            setIsPdfLoading(true);
          }}
          className='w-full'
          variant='outline'
          disabled={!pdfContent}
        >
          Preview employment agreement
        </Button>
      </div>
      <FullScreenDialog
        open={showPreviewModal}
        onOpenChange={(open: boolean) => {
          setShowPreviewModal(open);
          if (!open) {
            setIsPdfLoading(true);
          }
        }}
      >
        <FullScreenDialogContent>
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-4 border-b bg-white'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowPreviewModal(false)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M19 12H5M12 19l-7-7 7-7' />
                </svg>
              </Button>
              <h2 className='text-lg font-semibold'>
                Employment Agreement Preview
              </h2>
            </div>

            {/* Right side buttons */}
            <div className='flex items-center gap-2'>
              {/* About this preview button */}
              <Button
                onClick={() => setShowInfoModal(true)}
                variant='ghost'
                size='sm'
                className='text-blue-600 hover:text-blue-700'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='mr-1'
                >
                  <circle cx='12' cy='12' r='10' />
                  <path d='M12 16v-4' />
                  <path d='M12 8h.01' />
                </svg>
                About this preview
              </Button>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                disabled={!pdfContent}
                variant='outline'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='mr-2'
                >
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                  <polyline points='7 10 12 15 17 10' />
                  <line x1='12' y1='15' x2='12' y2='3' />
                </svg>
                Download
              </Button>
            </div>
          </div>

          {/* Full screen PDF viewer */}
          <div className='flex-1 relative bg-gray-50 overflow-hidden'>
            {isPdfLoading && (
              <div className='absolute inset-0 flex items-center justify-center bg-white z-10'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2'></div>
                  <p className='text-sm text-gray-600'>Loading document...</p>
                </div>
              </div>
            )}
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className='w-full h-full border-0'
                title='Employment Agreement Preview'
                onLoad={() => setIsPdfLoading(false)}
              />
            )}
          </div>
        </FullScreenDialogContent>
      </FullScreenDialog>

      {/* Info Modal */}
      <EmploymentAgreementInfoModal
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
      />

      <div className='buttons-container'>
        <BackButton
          className='back-button'
          onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
        >
          Previous Step
        </BackButton>
        <SubmitButton
          className='submit-button'
          onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
        >
          Continue
        </SubmitButton>
      </div>
    </>
  );
};
