import { ButtonHTMLAttributes, useState } from 'react';
import { LazyPdfPreview } from '@/src/components/shared/pdf-preview/LazyLoadPdfPreview';
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
  const { formId, contractorOnboardingBag } = useContractorOnboardingContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  const reviewCompleted =
    Boolean(contractorOnboardingBag.fieldValues?.review_completed) ||
    Boolean(contractorOnboardingBag.fieldValues?.signature);
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

    const currentValues = {
      ...contractorOnboardingBag.fieldValues,
      review_completed: true,
    };

    contractorOnboardingBag.checkFieldUpdates(currentValues);

    if (formId) {
      const formElement = document.getElementById(formId) as HTMLFormElement;
      if (formElement) {
        // Create or update hidden input for review_completed
        const hiddenInput = formElement.querySelector(
          'input[name="review_completed"]',
        ) as HTMLInputElement;

        hiddenInput.value = 'true';

        // Trigger change event so React Hook Form picks it up
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleClose}
      direction={'bottom'}
      title='Contract Document'
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
      {pdfContent && <LazyPdfPreview base64Data={pdfContent} />}
    </Drawer>
  );
}
