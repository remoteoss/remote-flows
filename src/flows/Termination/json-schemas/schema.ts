import { additionalInformationSchema } from '@/src/flows/Termination/json-schemas/additionalInformation';
import { employeeComunicationSchema } from '@/src/flows/Termination/json-schemas/employeeComunication';
import { paidTimeOffSchema } from '@/src/flows/Termination/json-schemas/paidTimeOff';
import { terminationDetailsSchema } from '@/src/flows/Termination/json-schemas/terminationDetails';
import { StepTerminationKeys } from '@/src/flows/Termination/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const schema: Record<StepTerminationKeys, Record<string, any>> = {
  employee_communication: employeeComunicationSchema,
  termination_details: terminationDetailsSchema,
  paid_time_off: paidTimeOffSchema,
  additional_information: additionalInformationSchema,
};
