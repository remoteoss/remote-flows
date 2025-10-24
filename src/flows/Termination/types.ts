import { TerminationDetailsParams } from '@/src/client';
import { AdditionalDetailsForm } from '@/src/flows/Termination/AdditionalDetailsForm';
import { EmployeeCommunicationForm } from '@/src/flows/Termination/EmployeeComunicationForm';
import { useTermination } from '@/src/flows/Termination/hooks';
import { PaidTimeOffForm } from '@/src/flows/Termination/PaidTimeOffForm';
import { TerminationBack } from '@/src/flows/Termination/TerminationBack';
import { TerminationDetailsForm } from '@/src/flows/Termination/TerminationDetailsForm';
import { TerminationSubmit } from '@/src/flows/Termination/TerminationSubmit';
import { TimeOff } from '@/src/flows/Termination/TimeOff';
import { JSFModify } from '@/src/flows/types';

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
   * @see {@link TimeOff}
   * @see {@link TerminationBack}
   * @see {@link EmployeeCommunicationForm}
   * @see {@link TerminationDetailsForm}
   * @see {@link PaidTimeOffForm}
   * @see {@link AdditionalDetailsForm}
   */
  components: {
    SubmitButton: typeof TerminationSubmit;
    TimeOff: typeof TimeOff;
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
    jsfModify?: JSFModify;
  };
  initialValues?: Record<string, unknown>;
};
