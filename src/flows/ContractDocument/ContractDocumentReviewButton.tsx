import { ButtonHTMLAttributes, PropsWithChildren, useState } from 'react';
import { Drawer } from '@/src/components/shared/drawer/Drawer';
import { useFormFields } from '@/src/context';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';
import { cn } from '@/src/lib/utils';

export function ContractDocumentReviewButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const [isOpen, setIsOpen] = useState(false);
  const { contractDocumentBag } = useContractDocumentContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  const CustomPdfViewer = components?.pdfViewer;
  if (!CustomPdfViewer) {
    throw new Error(`PDFViewer component not found`);
  }

  const { contractDocument } = contractDocumentBag;

  const openContractDocument = () => {
    setIsOpen(true);
    contractDocumentBag.markContractAsReviewed();
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      title='Contract Document'
      className='top-0 bottom-0 left-auto right-0 h-full max-h-none w-full max-w-[900px] rounded-t-none flex flex-col'
      trigger={
        <CustomButton
          {...props}
          type='button'
          className={cn(
            'RemoteFlows__ContractDocumentPreviewForm__ReviewButton',
            props.className,
          )}
          onClick={openContractDocument}
          disabled={props.disabled || !contractDocument}
        >
          {children}
        </CustomButton>
      }
    >
      {contractDocument && (
        <CustomPdfViewer
          base64Data={contractDocument.content}
          fileName={contractDocument.name}
        />
      )}
    </Drawer>
  );
}
