import React, { Suspense, lazy } from 'react';

import type { PDFPreviewProps } from './PdfPreview';

const PdfPreview = lazy(() =>
  import('./PdfPreview').then((module) => ({ default: module.PDFPreview })),
);

export const LazyPdfPreview: React.FC<PDFPreviewProps> = (props) => {
  return (
    <Suspense fallback={<div className='animate-pulse'>Loading PDF...</div>}>
      <PdfPreview {...props} />
    </Suspense>
  );
};
