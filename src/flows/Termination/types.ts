import { TerminationDetailsParams } from '@/src/client';

export type TerminationFormValues = {
  acknowledge_termination_procedure: boolean;
  additional_comments: string;
  agrees_to_pto_amount: string;
  agrees_to_pto_amount_notes: string | null;
  confidential: string;
  customer_informed_employee: string;
  customer_informed_employee_date: string | null;
  customer_informed_employee_description: string | null;
  personal_email: string;
  proposed_termination_date: string;
  reason_description: string;
  risk_assessment_reasons: TerminationDetailsParams['risk_assessment_reasons'];
  termination_reason:
    | TerminationDetailsParams['termination_reason']
    | undefined;
  termination_reason_files: TerminationDetailsParams['termination_reason_files'];
  timesheet_file: TerminationDetailsParams['timesheet_file'];
  will_challenge_termination: string;
  will_challenge_termination_description: string | null;
};
