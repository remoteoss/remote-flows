import { TerminationDetailsParams } from '@/src/client';
import { AdditionalDetailsForm } from '@/src/flows/Termination/AdditionalDetailsForm';
import { EmployeeCommunicationForm } from '@/src/flows/Termination/EmployeeComunicationForm';
import { useTermination } from '@/src/flows/Termination/hooks';
import { PaidTimeOffForm } from '@/src/flows/Termination/PaidTimeOffForm';
import { TerminationBack } from '@/src/flows/Termination/TerminationBack';
import { TerminationDetailsForm } from '@/src/flows/Termination/TerminationDetailsForm';
import { TerminationSubmit } from '@/src/flows/Termination/TerminationSubmit';
import { JSFModifyNext } from '@/src/flows/types';

export type EmployeeCommunicationFormValues = {
  confidential: string;
  customer_informed_employee: string;
  customer_informed_employee_date: string | null;
  customer_informed_employee_description: string | null;
  personal_email: string;
};

export type TerminationDetailsFormValues = {
  proposed_termination_date: string;
  reason_description: string;
  risk_assessment_reasons: TerminationDetailsParams['risk_assessment_reasons'];
  termination_reason:
    | TerminationDetailsParams['termination_reason']
    | undefined;
  termination_reason_files: {
    name: string;
    content: string;
    type: string;
    size: number;
  }[];
  additional_comments: string | null;
  will_challenge_termination: string;
  will_challenge_termination_description: string | null;
};

export type PaidTimeOffFormValues = {
  agrees_to_pto_amount: string;
  agrees_to_pto_amount_notes: string | null;
  timesheet_file: {
    name: string;
    content: string;
    type: string;
    size: number;
  }[];
};

export type AdditionalDetailsFormValues = {
  acknowledge_termination_procedure: boolean;
};

export type TerminationFormValues = EmployeeCommunicationFormValues &
  TerminationDetailsFormValues &
  PaidTimeOffFormValues &
  AdditionalDetailsFormValues;

export type TerminationRenderProps = {
  /**
   * The termination bag returned by the useTermination hook.
   * This bag contains all the methods and properties needed to handle the termination flow.
   * @see {@link useTermination}
   */
  terminationBag: ReturnType<typeof useTermination>;
  /**
   * The components used in the termination flow.
   * This includes different steps, submit button, back button and timeoff.
   * @see {@link TerminationSubmit}
   * @see {@link TerminationBack}
   * @see {@link EmployeeCommunicationForm}
   * @see {@link TerminationDetailsForm}
   * @see {@link PaidTimeOffForm}
   * @see {@link AdditionalDetailsForm}
   */
  components: {
    SubmitButton: typeof TerminationSubmit;
    Back: typeof TerminationBack;
    EmployeeComunicationStep: typeof EmployeeCommunicationForm;
    TerminationDetailsStep: typeof TerminationDetailsForm;
    PaidTimeOffStep: typeof PaidTimeOffForm;
    AdditionalDetailsStep: typeof AdditionalDetailsForm;
  };
};

export type TerminationFlowProps = {
  employmentId: string;
  render: ({
    terminationBag,
    components,
  }: TerminationRenderProps) => React.ReactNode;
  options?: {
    jsfModify?: JSFModifyNext;
  };
  initialValues?: Record<string, unknown>;
};
