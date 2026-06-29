import { useState } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import {
  useGetPreOnboardingRequirements,
  useCreatePreOnboardingDocument,
  useGetPreOnboardingDocument,
  useSignPreOnboardingDocument,
  useAcknowledgePreOnboardingRequirement,
  useRemoveAcknowledgePreOnboardingRequirement,
} from '@/src/flows/Onboarding/api';
import { mutationToPromise } from '@/src/lib/mutations';
import { PreOnboardingRequirement } from '@/src/client';

export const usePreOnboardingRequirements = ({
  employmentId,
}: {
  employmentId: string;
  options?: Parameters<typeof useGetPreOnboardingRequirements>[1];
}) => {
  const { onboardingBag } = useOnboardingContext();
  const [documentIds, setDocumentIds] = useState<Record<string, string>>({});
  const [activeRequirementSlug, setActiveRequirementSlug] = useState<
    string | undefined
  >();

  const isPreOnboardingRequirementsEnabled = Boolean(
    onboardingBag.options?.features?.includes('pre_onboarding_requirements') &&
    !!employmentId,
  );

  const {
    data: requirements,
    isLoading: isLoadingRequirements,
    refetch: refetchRequirements,
  } = useGetPreOnboardingRequirements(employmentId, {
    queryOptions: {
      enabled: isPreOnboardingRequirementsEnabled,
    },
  });

  const dependentBySlug = new Map<string, PreOnboardingRequirement>();
  for (const req of requirements ?? []) {
    if (req.depends_on_requirement) {
      dependentBySlug.set(req.depends_on_requirement.slug, req);
    }
  }

  const activeDocumentId = activeRequirementSlug
    ? documentIds[activeRequirementSlug]
    : undefined;

  const { data: documentPreview, isLoading: isLoadingDocumentPreview } =
    useGetPreOnboardingDocument(employmentId, activeDocumentId, {
      queryOptions: { enabled: !!activeDocumentId },
    });

  const createDocumentMutation = useCreatePreOnboardingDocument();
  const signDocumentMutation = useSignPreOnboardingDocument();
  const acknowledgeRequirementMutation =
    useAcknowledgePreOnboardingRequirement();
  const deleteAcknowledgeRequirementMutation =
    useRemoveAcknowledgePreOnboardingRequirement();

  const { mutateAsyncOrThrow: createDocumentMutationAsync } = mutationToPromise(
    createDocumentMutation,
  );
  const { mutateAsyncOrThrow: signDocumentMutationAsync } =
    mutationToPromise(signDocumentMutation);
  const { mutateAsyncOrThrow: acknowledgeRequirementMutationAsync } =
    mutationToPromise(acknowledgeRequirementMutation);
  const { mutateAsyncOrThrow: deleteAcknowledgeRequirementMutationAsync } =
    mutationToPromise(deleteAcknowledgeRequirementMutation);

  const onCreateDocument = async (requirementSlug: string) => {
    const requirement = requirements?.find(
      (req) => req.slug === requirementSlug,
    );

    if (requirement?.status === 'blocked') {
      const dependsOnName = requirement.depends_on_requirement?.name;
      throw new Error(
        `Cannot create document for blocked requirement. ${dependsOnName ? `${dependsOnName} must be completed first.` : 'A dependent requirement must be completed first.'}`,
      );
    }

    const existingDocumentId = documentIds[requirementSlug];
    setActiveRequirementSlug(requirementSlug);

    if (existingDocumentId) {
      return null;
    }

    const result = await createDocumentMutationAsync({
      employmentId,
      body: {
        requirement_slug: requirementSlug,
        employment_id: employmentId,
      },
    });
    const newDocumentId = result?.data.pre_onboarding_document.id;
    if (newDocumentId) {
      setDocumentIds((prev) => ({ ...prev, [requirementSlug]: newDocumentId }));
    }
    return result;
  };

  const onAcknowledgeRequirement = async (requirementSlug: string) => {
    const requirement = requirements?.find(
      (req) => req.slug === requirementSlug,
    );

    const isFinished = requirement?.status === 'finished';

    if (!isFinished) {
      await acknowledgeRequirementMutationAsync({
        employmentId,
        requirementSlug,
      });
    } else {
      await deleteAcknowledgeRequirementMutationAsync({
        employmentId,
        requirementSlug,
      });
    }

    await refetchRequirements();
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

  const isAckLocked = (requirementSlug: string) => {
    return dependentBySlug.get(requirementSlug)?.status === 'finished';
  };

  const isPendingAcknowledgement =
    acknowledgeRequirementMutation.isPending ||
    deleteAcknowledgeRequirementMutation.isPending;

  return {
    requirements,
    isLoadingRequirements,
    documentPreview,
    isLoadingDocumentPreview,
    activeRequirementSlug,
    isCreatingDocument: createDocumentMutation.isPending,
    isSigning: signDocumentMutation.isPending,
    onCreateDocument,
    onSignDocument,
    onAcknowledgeRequirement,
    isPendingAcknowledgement,
    isAckLocked,
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
