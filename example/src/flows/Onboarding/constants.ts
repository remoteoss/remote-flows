export const ONBOARDING_OPTIONS = {
  features: [
    'onboarding_reserves',
    'dynamic_steps',
    'ea_preview',
    'pre_onboarding_requirements',
  ] as const,
  jsonSchemaVersion: {
    employment_basic_information: 3,
  },
  jsonSchemaVersionByCountry: {
    ARE: {
      // United Arab Emirates
      contract_details: 3,
    },
    DEU: {
      // Germany
      contract_details: 4,
    },
    BLR: {
      // Belarus
      contract_details: 2,
    },
    CHN: {
      // China
      contract_details: 3,
    },
    CHE: {
      // Switzerland
      contract_details: 2,
    },
    CZE: {
      // Czech Republic
      contract_details: 2,
    },
    GBR: {
      // United Kingdom
      contract_details: 3,
    },
    HKG: {
      // Hong Kong
      contract_details: 2,
    },
    IND: {
      // India
      contract_details: 2,
    },
    ISL: {
      // Iceland
      contract_details: 2,
    },
    JAM: {
      // Jamaica
      contract_details: 2,
    },
    KEN: {
      // Kenya
      contract_details: 2,
    },
    LBN: {
      // Lebanon
      contract_details: 2,
    },
    MEX: {
      // Mexico
      contract_details: 2,
    },
    MUS: {
      // Mauritius
      contract_details: 2,
    },
    MYS: {
      // Malaysia
      contract_details: 2,
    },
    NGA: {
      // Nigeria
      contract_details: 2,
    },
    NLD: {
      // Netherlands
      contract_details: 2,
    },
    NOR: {
      // Norway
      contract_details: 2,
    },
    NZL: {
      // New Zealand
      contract_details: 2,
    },
    PAK: {
      // Pakistan
      contract_details: 2,
    },
    PRT: {
      // Portugal
      contract_details: 3,
    },
    SAU: {
      // Saudi Arabia
      contract_details: 2,
    },
    SGP: {
      // Singapore
      contract_details: 2,
    },
    SRB: {
      // Serbia
      contract_details: 2,
    },
    SWE: {
      // Sweden
      contract_details: 2,
    },
  },
};
