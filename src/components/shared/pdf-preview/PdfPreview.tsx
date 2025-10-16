import { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  base64Data: string;
  fileName?: string;
}

export function PDFPreview({
  base64Data,
  fileName = 'document.pdf',
}: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const pdfDataUri = useMemo(() => {
    if (!base64Data) return '';

    const cleanedData = base64Data.trim();

    if (cleanedData.startsWith('data:application/pdf;base64,')) {
      return cleanedData;
    }

    if (cleanedData.startsWith('data:')) {
      return cleanedData;
    }

    return `data:application/pdf;base64,${cleanedData}`;
  }, [base64Data]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError('');
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setIsLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  if (!pdfDataUri) {
    return (
      <div className='w-full border rounded p-8 text-center bg-gray-50'>
        <p className='text-gray-500'>No PDF data available</p>
      </div>
    );
  }

  return (
    <div className='w-full space-y-4'>
      <div className='border rounded bg-white'>
        {/* PDF Viewer */}
        <div className='flex justify-center items-center min-h-[600px] p-4 bg-gray-50'>
          {isLoading && (
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4'></div>
              <p className='text-gray-600'>Loading PDF...</p>
            </div>
          )}

          {error && (
            <div className='text-center space-y-4'>
              <p className='text-red-600'>{error}</p>
              <a
                href={pdfDataUri}
                download={fileName}
                className='inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                Download PDF Instead
              </a>
            </div>
          )}

          {!error && (
            <Document
              file={pdfDataUri}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=''
              className='flex flex-col items-center'
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className='shadow-lg'
                width={Math.min(window.innerWidth - 100, 800)}
              />
            </Document>
          )}
        </div>

        {/* Navigation Controls */}
        {numPages > 0 && !error && (
          <div className='border-t bg-white px-4 py-3'>
            <div className='flex items-center justify-between'>
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                ← Previous
              </button>

              <div className='text-sm text-gray-600'>
                Page {pageNumber} of {numPages}
              </div>

              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Download Link */}
      <div className='flex justify-between items-center text-sm'>
        <p className='text-gray-600'>{fileName}</p>
        <a
          href={pdfDataUri}
          download={fileName}
          className='text-blue-600 hover:underline flex items-center gap-1'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
            />
          </svg>
          Download PDF
        </a>
      </div>
    </div>
  );
}
