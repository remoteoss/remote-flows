import { CreateContractDocumentResponse } from '@/src/client/types.gen';

export type ContractorContractDetailsFormPayload = {
  services_and_deliverables: string;
  service_duration: {
    expiration_date?: string;
    provisional_start_date: string;
  };
  termination: {
    contractor_notice_period_amount: number;
    company_notice_period_amount: number;
  };
  payment_terms: {
    payment_terms_type: string;
    invoicing_frequency: string;
    compensation_gross_amount: string;
    compensation_currency_code?: string;
    period_unit: string;
  };
};

export type ContractorContractDetailsResponse = CreateContractDocumentResponse;

export type AiValidationError = {
  error: string[];
  source: string;
  skippable: boolean;
};
