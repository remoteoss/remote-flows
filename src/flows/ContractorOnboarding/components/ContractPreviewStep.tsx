import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';

import { useMemo } from 'react';

interface PDFPreviewProps {
  base64Data: string;
}

export function PDFPreview({ base64Data }: PDFPreviewProps) {
  console.log('base64Data length:', base64Data?.length);
  console.log('base64Data starts with:', base64Data?.substring(0, 50));

  const pdfDataUri = useMemo(() => {
    if (!base64Data) {
      console.error('No base64Data provided');
      return '';
    }

    // Clean any whitespace
    const cleanedData = base64Data.trim();

    // If it already has the data URI prefix, use it as-is
    if (cleanedData.startsWith('data:application/pdf;base64,')) {
      console.log('✅ Data already has correct prefix');
      return cleanedData;
    }

    // If it has any data: prefix, log a warning
    if (cleanedData.startsWith('data:')) {
      console.warn(
        '⚠️ Data has data: prefix but not the expected format:',
        cleanedData.substring(0, 100),
      );
      return cleanedData;
    }

    // Otherwise, add the prefix
    console.log('➕ Adding data URI prefix');
    return `data:application/pdf;base64,${cleanedData}`;
  }, [base64Data]);

  console.log('pdfDataUri length:', pdfDataUri?.length);

  if (!pdfDataUri) {
    return (
      <div className='w-full h-[600px] border rounded flex items-center justify-center bg-gray-50'>
        <p className='text-gray-500'>No PDF data available</p>
      </div>
    );
  }

  return (
    <div className='w-full space-y-2'>
      <iframe
        src={pdfDataUri}
        className='w-full h-[600px] border rounded'
        title='PDF Preview'
        // These attributes can help with display issues
        sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
      />
      {/* Fallback download link */}
      <div className='text-sm text-gray-600'>
        Not displaying correctly?{' '}
        <a
          href={pdfDataUri}
          download='contract.pdf'
          className='text-blue-600 hover:underline'
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}

export function ContractPreviewStep() {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  console.log(
    'contractorOnboardingBag.documentPreviewPdf',
    contractorOnboardingBag.documentPreviewPdf,
  );

  return (
    <PDFPreview
      base64Data={
        contractorOnboardingBag.documentPreviewPdf?.contract_document
          .content as unknown as string
      }
    />
  );
}
