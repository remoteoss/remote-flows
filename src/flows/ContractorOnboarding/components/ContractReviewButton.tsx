import { ButtonHTMLAttributes, useState } from 'react';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { Drawer } from '@/src/components/shared/drawer/Drawer';
import { useFormFields } from '@/src/context';

type ContractReviewButtonProps = {
  render: (props: { reviewCompleted: boolean }) => React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ContractReviewButton({
  render,
  onClick,
  ...props
}: ContractReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formId, contractorOnboardingBag, formSetValue } =
    useContractorOnboardingContext();
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
    contractorOnboardingBag.fieldValues?.review_completed,
  );

  const pdfContent = contractorOnboardingBag.documentPreviewPdf
    ?.contract_document.content as unknown as string;

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!reviewCompleted) {
      e.preventDefault();
      setIsOpen(true);
      onClick?.(e);
    }
  };

  const handleClose = () => {
    setIsOpen(false);

    // Sync with the form if it's available
    if (formSetValue?.current) {
      formSetValue.current('review_completed', true);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleClose}
      title='Contract Document'
      className='max-h-[90vh] flex flex-col w-full'
      trigger={
        <CustomButton
          type={reviewCompleted ? 'submit' : 'button'}
          form={formId}
          onClick={handleOpen}
          {...props}
        >
          {render({ reviewCompleted })}
        </CustomButton>
      }
    >
      {pdfContent && <CustomPdfViewer base64Data={pdfContent} />}
    </Drawer>
  );
}
