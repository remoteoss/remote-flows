declare const contractorStandardProductIdentifier = "urn:remotecom:resource:product:contractor:standard:monthly";
declare const contractorPlusProductIdentifier = "urn:remotecom:resource:product:contractor:plus:monthly";
declare const corProductIdentifier = "urn:remotecom:resource:product:contractor:aor:monthly";
declare const eorProductIdentifier = "urn:remotecom:resource:product:eor:monthly";
type ProductType = 'cm' | 'cm+' | 'cor' | 'eor';
declare const PRODUCT_IDENTIFIER_MAP: Record<ProductType, string>;
declare const IR35_FILE_SUBTYPE = "ir_35";
declare const corOnboardingWorkflow: ({
    title: string;
    description: string;
    id: string;
} | {
    title: string;
    id: string;
    description?: undefined;
})[];
/**
 * Onboarding workflows for each pricing plan
 */
declare const onboardingWorkflows: Record<string, {
    title: string;
    id: string;
    description?: string;
}[]>;
declare const pricingPlanDetails: {
    "urn:remotecom:resource:product:contractor:standard:monthly": {
        title: string;
        subtitle: string;
        listItems: string[];
        contractPillText: string;
    };
    "urn:remotecom:resource:product:contractor:plus:monthly": {
        title: string;
        subtitle: string;
        listItems: string[];
        contractPillText: string;
    };
    "urn:remotecom:resource:product:contractor:aor:monthly": {
        title: string;
        subtitle: string;
        listItems: string[];
        contractPillText: string;
    };
};

export { IR35_FILE_SUBTYPE, PRODUCT_IDENTIFIER_MAP, type ProductType, contractorPlusProductIdentifier, contractorStandardProductIdentifier, corOnboardingWorkflow, corProductIdentifier, eorProductIdentifier, onboardingWorkflows, pricingPlanDetails };
