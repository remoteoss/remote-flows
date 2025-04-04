/* eslint-disable @typescript-eslint/no-explicit-any */
export type ContractAmendmentParams = {
  employmentId: string;
  countryCode: string;
  options?: {
    jsfModified?: {
      [K in 'fields' | 'allFields' | 'create' | 'pick' | 'orderRoot']?: any;
    };
  };
};
