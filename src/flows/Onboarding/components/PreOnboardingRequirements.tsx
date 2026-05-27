import { useState } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import {
  useGetPreOnboardingRequirements,
  useCreatePreOnboardingDocument,
  useGetPreOnboardingDocument,
  useSignPreOnboardingDocument,
} from '@/src/flows/Onboarding/api';
import { mutationToPromise } from '@/src/lib/mutations';

export const usePreOnboardingRequirements = ({
  employmentId,
}: {
  employmentId: string;
}) => {
  const [documentIds, setDocumentIds] = useState<Record<string, string>>({});
  const [activeRequirementSlug, setActiveRequirementSlug] = useState<
    string | undefined
  >();

  const {
    data: requirements,
    isLoading: isLoadingRequirements,
    refetch: refetchRequirements,
  } = useGetPreOnboardingRequirements(employmentId, {
    queryOptions: { enabled: !!employmentId },
  });

  const activeDocumentId = activeRequirementSlug
    ? documentIds[activeRequirementSlug]
    : undefined;

  const { data: documentPreview, isLoading: isLoadingDocumentPreview } =
    useGetPreOnboardingDocument(employmentId, activeDocumentId, {
      queryOptions: { enabled: !!activeDocumentId },
    });

  const createDocumentMutation = useCreatePreOnboardingDocument();
  const signDocumentMutation = useSignPreOnboardingDocument();

  const { mutateAsyncOrThrow: createDocumentMutationAsync } = mutationToPromise(
    createDocumentMutation,
  );
  const { mutateAsyncOrThrow: signDocumentMutationAsync } =
    mutationToPromise(signDocumentMutation);

  const onCreateDocument = async (
    requirementSlug: string,
    constraintsAckAt?: string,
  ) => {
    const existingDocumentId = documentIds[requirementSlug];
    if (existingDocumentId) {
      setActiveRequirementSlug(requirementSlug);
      return null;
    }

    const result = await createDocumentMutationAsync({
      employmentId,
      body: {
        pre_onboarding_document_requirement_slug: requirementSlug,
        constraints_ack_at: constraintsAckAt || null,
      },
    });
    const newDocumentId = result?.data.pre_onboarding_document.id;
    if (newDocumentId) {
      setDocumentIds((prev) => ({ ...prev, [requirementSlug]: newDocumentId }));
      setActiveRequirementSlug(requirementSlug);
    }
    return result;
  };

  const onSignDocument = async (signature: string) => {
    if (!activeRequirementSlug) {
      throw new Error('No active requirement selected');
    }

    const documentId = documentIds[activeRequirementSlug];
    if (!documentId) {
      throw new Error('No document to sign');
    }

    if (!signature) {
      throw new Error('Signature is required');
    }

    const responnse = await signDocumentMutationAsync({
      employmentId,
      documentId,
      signature,
    });
    await refetchRequirements();
    return responnse;
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

export type PreOnboardingRequirementsBag = ReturnType<
  typeof usePreOnboardingRequirements
>;

export const PreOnboardingRequirements = ({
  render,
}: {
  render: (bag: PreOnboardingRequirementsBag) => React.ReactNode;
}) => {
  const { onboardingBag } = useOnboardingContext();

  const bag = usePreOnboardingRequirements({
    employmentId: onboardingBag.employmentId as string,
  });

  return render(bag);
};
