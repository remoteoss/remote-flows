import { useState } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import {
  useGetPreOnboardingRequirements,
  useCreatePreOnboardingDocument,
  useGetPreOnboardingDocument,
  useSignPreOnboardingDocument,
} from '@/src/flows/Onboarding/api';

const usePreOnboardingRequirements = ({
  employmentId,
}: {
  employmentId: string;
}) => {
  const [documentId, setDocumentId] = useState<string | undefined>();

  const { data: requirements, isLoading: isLoadingRequirements } =
    useGetPreOnboardingRequirements(employmentId, {
      queryOptions: { enabled: !!employmentId },
    });

  const { data: documentPreview, isLoading: isLoadingDocumentPreview } =
    useGetPreOnboardingDocument(documentId, {
      queryOptions: { enabled: !!documentId },
    });

  const createDocumentMutation = useCreatePreOnboardingDocument();
  const signDocumentMutation = useSignPreOnboardingDocument();

  const onCreateDocument = async (
    requirementSlug: string,
    constraintsAckAt?: string,
  ) => {
    const result = await createDocumentMutation.mutateAsync({
      employmentId,
      body: {
        pre_onboarding_document_requirement_slug: requirementSlug,
        constraints_ack_at: constraintsAckAt || null,
      },
    });
    setDocumentId(result.data?.data?.pre_onboarding_document.id);
    return result;
  };

  const onSignDocument = async (signature: string) => {
    if (!documentId) {
      throw new Error('No document to sign');
    }
    return await signDocumentMutation.mutateAsync({
      documentId,
      signature,
    });
  };

  return {
    requirements,
    isLoadingRequirements,
    documentPreview,
    isLoadingDocumentPreview,
    isCreatingDocument: createDocumentMutation.isPending,
    isSigning: signDocumentMutation.isPending,
    onCreateDocument,
    onSignDocument,
  };
};

export const PreOnboardingRequirements = ({
  render,
}: {
  render: (
    bag: ReturnType<typeof usePreOnboardingRequirements>,
  ) => React.ReactNode;
}) => {
  const { onboardingBag } = useOnboardingContext();

  const bag = usePreOnboardingRequirements({
    employmentId: onboardingBag.employmentId as string,
  });

  return render(bag);
};
