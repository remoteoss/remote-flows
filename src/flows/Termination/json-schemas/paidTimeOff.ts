import { FILE_TYPES, MAX_FILE_SIZE } from '@/src/lib/uploadConfig';

export const paidTimeOffSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
        {
          if: {
            properties: {
              agrees_to_pto_amount: {
                const: 'no',
              },
            },
            required: ['agrees_to_pto_amount'],
          },
          then: {
            properties: {
              agrees_to_pto_amount_notes: {
                type: 'string',
              },
            },
            required: ['agrees_to_pto_amount_notes'],
          },
          else: {
            properties: {
              agrees_to_pto_amount_notes: false,
              timesheet_file: false,
            },
          },
        },
      ],
      properties: {
        timeoff_statement: {
          type: 'null',
          title: 'Timeoff statement',
          'x-jsf-presentation': {
            inputType: 'hidden',
            statement: {
              title: 'Make sure these paid time off records are correct',
              description:
                'You must pay the employee for any unused accrued paid time off, so please check these records carefully.',
              inputType: 'statement',
              severity: 'warning',
            },
            meta: {
              ignoreValue: true,
            },
          },
        },
        paid_time_off_info: {
          type: 'null',
          title: 'Paid time off info',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
          meta: {
            ignoreValue: true,
          },
        },
        agrees_to_pto_amount: {
          description: '',
          oneOf: [
            {
              const: 'yes',
              description: '',
              title: 'Yes',
            },
            {
              const: 'no',
              description: '',
              title: 'No',
            },
          ],
          title: 'Are these paid time off records correct?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        agrees_to_pto_amount_notes: {
          description:
            'Please provide details regarding any additional days taken, including specific dates, or any other inaccuracy in the time off data.',
          maxLength: 1000,
          title: 'Provide time off details',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        timesheet_file: {
          description:
            'Upload a timesheet exported from your HR software. This way we can compare and confirm the total number of Paid time off.',
          title: 'Timesheet document',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'file',
            accept: FILE_TYPES.document,
            maxSize: MAX_FILE_SIZE, // maxFileSize doesn't seem to work for some reason, found that this was fixed in @remoteoss/json-schema-form v1
          },
        },
      },
      required: ['agrees_to_pto_amount'],
      type: 'object',
      'x-jsf-order': [
        'timeoff_statement',
        'paid_time_off_info',
        'agrees_to_pto_amount',
        'agrees_to_pto_amount_notes',
        'timesheet_file',
      ],
    },
  },
};
