import { TerminationDetailsParams } from '@/src/client';

// TODO: we have missing fields and some types could be incorrect
export type TerminationFormValues = {
  acknowledge_termination_procedure: boolean;
  additional_comments: string;
  agrees_to_pto_amount: string;
  agrees_to_pto_amount_notes: string | undefined;
  confidential: boolean;
  customer_informed_employee: string;
  customer_informed_employee_date: string | undefined;
  customer_informed_employee_description: string | undefined;
  employer_confirmed_email: string;
  proposed_termination_date: string;
  risk_assessment_reasons: TerminationDetailsParams['risk_assessment_reasons']; // TODO: needs fixing after we build the checkbox array
  termination_reason: TerminationDetailsParams['termination_reason'];
  reason_description: string;
  termination_reason_files: TerminationDetailsParams['termination_reason_files'];
  will_challenge_termination: boolean;
};
