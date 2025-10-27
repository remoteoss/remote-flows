import { additionalInformationSchema } from '@/src/flows/Termination/json-schemas/additionalInformation';
import { employeeComunicationSchema } from '@/src/flows/Termination/json-schemas/employeeComunication';
import { paidTimeOffSchema } from '@/src/flows/Termination/json-schemas/paidTimeOff';
import { terminationDetailsSchema } from '@/src/flows/Termination/json-schemas/terminationDetails';

export const jsonSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
        ...employeeComunicationSchema.data.schema.allOf,
        ...terminationDetailsSchema.data.schema.allOf,
        ...paidTimeOffSchema.data.schema.allOf,
        ...additionalInformationSchema.data.schema.allOf,
      ],
      properties: {
        ...employeeComunicationSchema.data.schema.properties,
        ...terminationDetailsSchema.data.schema.properties,
        ...paidTimeOffSchema.data.schema.properties,
        ...additionalInformationSchema.data.schema.properties,
      },
      required: [
        ...employeeComunicationSchema.data.schema.required,
        ...terminationDetailsSchema.data.schema.required,
        ...paidTimeOffSchema.data.schema.required,
        ...additionalInformationSchema.data.schema.required,
      ],
      type: 'object',
      'x-jsf-order': [
        ...employeeComunicationSchema.data.schema['x-jsf-order'],
        ...terminationDetailsSchema.data.schema['x-jsf-order'],
        ...paidTimeOffSchema.data.schema['x-jsf-order'],
        ...additionalInformationSchema.data.schema['x-jsf-order'],
      ],
    },
  },
};
