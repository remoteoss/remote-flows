import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { PDFPreview } from '@/src/components/shared/pdf-preview/PdfPreview';

export function ContractPreviewStep() {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  console.log(
    'contractorOnboardingBag.documentPreviewPdf',
    contractorOnboardingBag.documentPreviewPdf,
  );

  return (
    <PDFPreview
      base64Data={
        contractorOnboardingBag.documentPreviewPdf?.contract_document
          .content as unknown as string
      }
    />
  );
}
