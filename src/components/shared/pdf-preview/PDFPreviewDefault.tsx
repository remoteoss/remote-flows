import { PDFPreview } from './PdfPreview';
import { PDFPreviewComponentProps } from '@/src/types/remoteFlows';

export const PDFPreviewDefault = (props: PDFPreviewComponentProps) => {
  return <PDFPreview {...props} />;
};
