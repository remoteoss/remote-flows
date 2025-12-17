export const employeeComunicationSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
        {
          if: {
            properties: {
              personal_email: {
                pattern: '^[a-zA-Z0-9 .]+$',
              },
            },
          },
          then: {
            properties: {
              personal_email: {
                'x-jsf-presentation': {
                  statement: {
                    title:
                      'Please make sure to add the employee personal email so Remote can get in contact with the employee after the termination process takes effect.',
                    inputType: 'statement',
                    severity: 'warning',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              customer_informed_employee: {
                const: 'yes',
              },
            },
            required: ['customer_informed_employee'],
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
            ],
          },
          else: {
            properties: {
              customer_informed_employee_date: false,
              customer_informed_employee_description: false,
            },
          },
        },
      ],
      properties: {
        confidential: {
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
            statement: {
              title:
                'Please do not inform the employee of their termination until Remote reviews your request for legal risks.',
              description:
                'When Remote approves your request, you can inform the employee and Remote will take it from there.',
              inputType: 'statement',
              severity: 'warning',
            },
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
          description:
            'Please be as specific as you can. Include details about the employee’s response, if applicable.',
          maxLength: 1000,
          title: 'How did you share this information?',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        personal_email: {
          description:
            'Remote will use this for post-termination communication.',
          maxLength: 255,
          title: "Employee's personal email",
          format: 'email',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'email',
          },
        },
      },
      required: [
        'confidential',
        'customer_informed_employee',
        'personal_email',
      ],
      type: 'object',
      'x-jsf-order': [
        'is_confidential',
        'customer_informed_employee',
        'customer_informed_employee_date',
        'customer_informed_employee_description',
        'personal_email',
      ],
    },
  },
};
