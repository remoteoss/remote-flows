export const mockEligibilityQuestionnaireSchema = {
  data: {
    schema: {
      type: 'object',
      properties: {
        control_the_way_contractors_work: {
          type: 'string',
          title: 'Do you control the way contractors work?',
          oneOf: [
            { const: 'no', title: 'No' },
            { const: 'yes', title: 'Yes' },
          ],
          'x-jsf-presentation': {
            inputType: 'radio',
            direction: 'row',
          },
        },
        previously_hired_contractors_as_employees: {
          type: 'string',
          title: 'Have you previously hired contractors as employees?',
          oneOf: [
            { const: 'no', title: 'No' },
            { const: 'yes', title: 'Yes' },
          ],
          'x-jsf-presentation': {
            inputType: 'radio',
            direction: 'row',
          },
        },
        treating_contractors_as_employees: {
          type: 'string',
          title: 'Are you treating contractors as employees?',
          oneOf: [
            { const: 'no', title: 'No' },
            { const: 'yes', title: 'Yes' },
          ],
          'x-jsf-presentation': {
            inputType: 'radio',
            direction: 'row',
          },
        },
      },
      required: [
        'control_the_way_contractors_work',
        'previously_hired_contractors_as_employees',
        'treating_contractors_as_employees',
      ],
    },
  },
};

export const mockBlockedEligibilityQuestionnaireResponse = {
  data: {
    is_blocking: true,
    responses: {
      control_the_way_contractors_work: 'yes',
      previously_hired_contractors_as_employees: 'yes',
      treating_contractors_as_employees: 'yes',
    },
  },
};
