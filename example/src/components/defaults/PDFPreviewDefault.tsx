import { PDFPreviewComponentProps } from '@remoteoss/remote-flows';

export function PDFPreviewDefault({
  base64Data,
  fileName = 'document.pdf',
}: PDFPreviewComponentProps) {
  if (!base64Data) {
    return (
      <div className='w-full border rounded p-8 text-center bg-gray-50'>
        <p className='text-gray-500'>No PDF data available</p>
      </div>
    );
  }

  return (
    <div className='w-full space-y-4'>
      <iframe
        src={base64Data}
        className='w-full h-[600px] border rounded'
        title={fileName}
      />
      <div className='flex justify-between items-center text-sm'>
        <p className='text-gray-600'>{fileName}</p>
        <a
          href={base64Data}
          download={fileName}
          className='text-blue-600 hover:underline'
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
