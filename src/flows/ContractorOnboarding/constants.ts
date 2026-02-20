export const contractorStandardProductIdentifier =
  'urn:remotecom:resource:product:contractor:standard:monthly';
export const contractorPlusProductIdentifier =
  'urn:remotecom:resource:product:contractor:plus:monthly';
export const corProductIdentifier =
  'urn:remotecom:resource:product:contractor:aor:monthly';
export const eorProductIdentifier =
  'urn:remotecom:resource:product:eor:monthly';

export type ProductType = 'cm' | 'cm+' | 'cor' | 'eor';

export const PRODUCT_IDENTIFIER_MAP: Record<ProductType, string> = {
  cm: contractorStandardProductIdentifier,
  'cm+': contractorPlusProductIdentifier,
  cor: corProductIdentifier,
  eor: eorProductIdentifier,
};

export const IR35_FILE_SUBTYPE = 'ir_35';

const standardOnboardingWorkflow = [
  {
    title: 'You add a new contractor and their details in Remote.',
    id: 'add-contractor-details',
  },
  {
    title: 'Contractor accepts invite to join Remote.',
    id: 'contractor-accepts-invite',
  },
  {
    title: 'Ask your contractor to sign their agreement with your company.',
    id: 'ask-contractor-to-sign-agreement',
  },
  {
    title: 'Once the agreement is signed, the contractor can begin work.',
    id: 'agreement-signed-begin-work',
  },
  {
    title: 'The contractor will submit invoices on a date specified by you.',
    id: 'contractor-submits-invoices',
  },
  {
    title: 'You will pay the contractor according to the agreed-upon terms.',
    id: 'pay-contractor',
  },
];

export const corOnboardingWorkflow = [
  {
    title:
      'You add a new contractor and their details in Remote, and reconfirm our Terms of Service.',
    description:
      "Review all details carefully, as we'll use this information to draft the contract.",
    id: 'add-contractor-details-and-reconfirm-terms',
  },
  {
    title: 'You pay the reserve amount required to add the contractor.',
    id: 'pay-reserve-amount',
  },
  {
    title: 'The contractor is invited to the platform.',
    id: 'contractor-invited-to-platform',
  },
  {
    title: 'The contractor completes onboarding on Remote.',
    id: 'contractor-completes-onboarding',
  },
  {
    title: 'The contractor signs the services agreement with Remote.',
    id: 'contractor-signs-services-agreement',
  },
  {
    title: 'Contractor begins working.',
    id: 'contractor-begins-working',
  },
  {
    title: 'Contractor submits an invoice to Remote.',
    id: 'contractor-submits-invoice',
  },
  {
    title: 'You review and approve the invoice.',
    id: 'review-and-approve-invoice',
  },
  {
    title: 'A COR contractor payment invoice is generated, which you pay.',
    id: 'cor-contractor-payment-invoice-generated',
  },
  {
    title: 'Remote receives payment and pays contractor.',
    id: 'remote-receives-payment-and-pays-contractor',
  },
  {
    title: 'Contractor receives payment.',
    id: 'contractor-receives-payment',
  },
];

/**
 * Onboarding workflows for each pricing plan
 */
export const onboardingWorkflows: Record<
  string,
  { title: string; id: string; description?: string }[]
> = {
  [contractorStandardProductIdentifier]: standardOnboardingWorkflow,
  // we assign the same workflow as its the same for standard and plus
  [contractorPlusProductIdentifier]: standardOnboardingWorkflow,
  [corProductIdentifier]: corOnboardingWorkflow,
};

export const pricingPlanDetails = {
  [contractorStandardProductIdentifier]: {
    title: 'Contractor Management',
    subtitle: 'Engage and pay contractors compliantly',
    listItems: [
      'Ideal for businesses wanting a straightforward solution to manage and pay contractors directly.',
      'Helps with everything from contractor onboarding, invoicing, payments, and compliance.',
      'Full control remains with you.',
    ],
    contractPillText: 'Contract between you and contractor',
  },
  [contractorPlusProductIdentifier]: {
    title: 'Contractor Management Plus',
    subtitle: 'Engage and pay contractors with indemnity coverage',
    listItems: [
      'Great for businesses concerned about contractor classification risks.',
      'Helps with everything from contractor onboarding, invoicing, payments, and compliance.',
      "Offers a warranty on Remote's localized, compliant contracts.",
      'Control remains with you',
    ],
    contractPillText: 'Contract between you and contractor',
  },
  [corProductIdentifier]: {
    title: 'Contractor of Record',
    subtitle: 'Remote reduces liability by directly engaging the contractor',
    listItems: [
      'Ideal for businesses who want admin relief and have low risk tolerance.',
      'No need to be experts in local labor laws; Remote manages its compliance with contractors.',
      'Indemnity protection, Remote backs its compliance in administering and paying contractors',
    ],
    contractPillText: 'Contract between Remote and contractor',
  },
};
