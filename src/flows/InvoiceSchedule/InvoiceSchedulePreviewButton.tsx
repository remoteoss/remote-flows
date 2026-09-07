import { ButtonHTMLAttributes, useState } from 'react';
import { Drawer } from '@/src/components/shared/drawer/Drawer';
import { useFormFields } from '@/src/context';
import { ContractorInvoicePreview } from '@/src/common/invoice-schedules/types';
import { useInvoiceScheduleContext } from '@/src/flows/InvoiceSchedule/context';
import { cn, handleStepError } from '@/src/lib/utils';
import { NormalizedFieldError } from '@/src/lib/mutations';

type InvoiceSchedulePreviewButtonProps = Omit<
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
 * Renders the invoice the form currently describes as a draft (non-persisted) PDF, shown in
 * a drawer through the `pdfViewer` component. The standalone twin of the onboarding step's
 * `PreviewInvoiceButton`.
 *
 * Disabled until a contractor is known, since the preview endpoint is scoped to an
 * employment — with the picker on screen that is whatever the user has chosen, otherwise the
 * flow's `employmentId`.
 *
 * `onSuccess` receives the same document, for consumers that want to do something else with
 * it. Note `preview.content` is a `data:application/pdf;base64,...` URI: browsers block
 * top-level navigation to the `data:` scheme, so it can be rendered in an `iframe`/`embed`
 * or handed to an `<a download>`, but not passed to `window.open`.
 */
export function InvoiceSchedulePreviewButton({
  onSuccess,
  onError,
  className,
  children,
  disabled = false,
  ...props
}: InvoiceSchedulePreviewButtonProps) {
  const [preview, setPreview] = useState<ContractorInvoicePreview | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { form, invoiceScheduleBag } = useInvoiceScheduleContext();
  const { components } = useFormFields();

  const handlePreview = async () => {
    try {
      const previewDocument = await invoiceScheduleBag?.previewInvoice(
        form.getValues(),
      );

      if (previewDocument) {
        setPreview(previewDocument);
        setIsOpen(true);
        await onSuccess?.(previewDocument);
      }
    } catch (error: unknown) {
      // No field meta: this flow's `meta.fields` is the flat field list, not the per-step
      // `NestedMeta` the onboarding step passes, so errors keep their raw field names.
      onError?.(handleStepError(error));
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
      // Opened by handlePreview once the PDF is available, so the trigger's own open request
      // is ignored — only close requests are honored.
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
            disabled ||
            invoiceScheduleBag?.isPreviewingInvoice ||
            !invoiceScheduleBag?.employmentId
          }
          className={cn(
            'RemoteFlows__InvoiceScheduleForm__PreviewButton',
            className,
          )}
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
}
