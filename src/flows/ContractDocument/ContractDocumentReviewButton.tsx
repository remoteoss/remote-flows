import { ButtonHTMLAttributes, useState } from 'react';
import { Drawer } from '@/src/components/shared/drawer/Drawer';
import { useFormFields } from '@/src/context';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';
import { cn } from '@/src/lib/utils';

type ContractDocumentReviewButtonProps = {
  render: (props: { reviewCompleted: boolean }) => React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ContractDocumentReviewButton({
  render,
  onClick,
  ...props
}: ContractDocumentReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formId, contractDocumentBag } = useContractDocumentContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  const CustomPdfViewer = components?.pdfViewer;
  if (!CustomPdfViewer) {
    throw new Error(`PDFViewer component not found`);
  }

  const reviewCompleted = Boolean(
    contractDocumentBag.fieldValues?.review_completed,
  );
  const contractDocument =
    contractDocumentBag.documentPreviewPdf?.contract_document;

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!reviewCompleted) {
      event.preventDefault();
      setIsOpen(true);
      onClick?.(event);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      contractDocumentBag.markContractAsReviewed();
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      title='Contract Document'
      className='top-0 bottom-0 left-auto right-0 h-full max-h-none w-full max-w-[900px] rounded-t-none flex flex-col'
      trigger={
        <CustomButton
          {...props}
          type={reviewCompleted ? 'submit' : 'button'}
          form={formId}
          className={cn(
            'RemoteFlows__ContractDocumentPreviewForm__ReviewButton',
            props.className,
          )}
          onClick={handleOpen}
          disabled={props.disabled || contractDocumentBag.isSubmitting}
        >
          {render({ reviewCompleted })}
        </CustomButton>
      }
    >
      {contractDocument?.content && (
        <CustomPdfViewer
          base64Data={contractDocument.content}
          fileName={contractDocument.name}
        />
      )}
    </Drawer>
  );
}
