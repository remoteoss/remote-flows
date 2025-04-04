export const jsonSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
        {
          if: {
            properties: {
              customer_informed_employee: {
                const: 'yes', // Ensure this matches the value in the form data
              },
            },
            required: ['customer_informed_employee'], // Ensure this field is required
          },
          then: {
            properties: {
              customer_informed_employee_date: {
                type: 'string',
              },
              customer_informed_employee_description: {
                type: 'string',
              },
            },
            required: [
              'customer_informed_employee_date',
              'customer_informed_employee_description',
            ], // Make the field required when condition is met
          },
          else: {
            properties: {
              customer_informed_employee_date: false,
              customer_informed_employee_description: false, // Hide the field when condition is not met
            },
          },
        },
      ],
      properties: {
        is_confidential: {
          description:
            'Confidential requests are visible only to you. Non-confidential requests are visible to all admins in your company.',
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
          title: 'Is this request confidential?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        customer_informed_employee: {
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
          title: 'Have you informed the employee of the termination?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        customer_informed_employee_date: {
          description: '',
          format: 'date',
          maxLength: 255,
          title: 'When the employee was told about the termination',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'date',
          },
        },
        customer_informed_employee_description: {
          description: 'Bonus type, payment frequency, and more.',
          maxLength: 1000,
          title: 'How did you share this information?',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        employer_confirmed_email: {
          description: '',
          maxLength: 255,
          title: 'Employee’s personal email',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text', // TODO: email type is not supported
          },
        },
      },
      required: [
        'is_confidential',
        'customer_informed_employee',
        'employer_confirmed_email',
      ],
      type: 'object',
      'x-jsf-order': [
        'is_confidential',
        'customer_informed_employee',
        'customer_informed_employee_date',
        'customer_informed_employee_description',
        'employer_confirmed_email',
      ],
    },
  },
};
