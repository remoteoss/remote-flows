import { useFormFields } from '@/src/context';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ButtonHTMLAttributes, useState } from 'react';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { handleStepError } from '@/src/lib/utils';
import { ContractorInvoicePreview } from '@/src/flows/ContractorOnboarding/types';
import { Drawer } from '@/src/components/shared/drawer/Drawer';

type PreviewInvoiceButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onError'
> & {
  onSuccess?: (data: ContractorInvoicePreview) => void | Promise<void>;
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
};

/**
 * Generates a draft (non-persisted) PDF preview of a contractor invoice from
 * the current, unsaved create_invoice_schedule form values, and shows it in a
 * drawer through the `pdfViewer` component.
 *
 * `onSuccess` receives the same preview document, for consumers that want to do
 * something else with it as well. Note that `preview.content` is a
 * `data:application/pdf;base64,...` URI: browsers block top-level navigation to
 * the `data:` scheme, so it can be rendered in an `iframe`/`embed` or handed to
 * an `<a download>`, but not passed to `window.open`.
 */
export const PreviewInvoiceButton = ({
  onSuccess,
  onError,
  className,
  children,
  disabled = false,
  ...props
}: PreviewInvoiceButtonProps) => {
  const [preview, setPreview] = useState<ContractorInvoicePreview | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const { components } = useFormFields();

  const handlePreview = async () => {
    try {
      const previewDocument =
        await contractorOnboardingBag.previewContractorInvoice(
          contractorOnboardingBag.fieldValues,
        );
      if (previewDocument) {
        setPreview(previewDocument);
        setIsOpen(true);
        await onSuccess?.(previewDocument);
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.create_invoice_schedule,
      );
      onError?.(structuredError);
    }
  };

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  const CustomPdfViewer = components?.pdfViewer;
  if (!CustomPdfViewer) {
    throw new Error(`PDFViewer component not found`);
  }

  return (
    <Drawer
      open={isOpen}
      // The drawer is opened by handlePreview once the PDF is available, so the
      // trigger's own open request is ignored — only close requests are honored.
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(false);
        }
      }}
      title='Invoice Preview'
      className='max-h-[90vh] flex flex-col w-full'
      trigger={
        <CustomButton
          {...props}
          type='button'
          onClick={handlePreview}
          disabled={
            disabled || contractorOnboardingBag.isPreviewingInvoiceSchedule
          }
          className={className}
        >
          {children}
        </CustomButton>
      }
    >
      {preview && (
        <CustomPdfViewer base64Data={preview.content} fileName={preview.name} />
      )}
    </Drawer>
  );
};
