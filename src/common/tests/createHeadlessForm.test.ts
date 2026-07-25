import { createHeadlessForm } from '../createHeadlessForm';

const schemaWithNumberGuard = {
  additionalProperties: false,
  type: 'object',
  'x-rmt-meta': {
    jsfVersion: '1',
  },
  properties: {
    clause_apply: {
      title: 'Apply clause',
      type: 'string',
      oneOf: [
        { const: 'yes', title: 'Yes' },
        { const: 'no', title: 'No' },
      ],
      'x-jsf-presentation': {
        inputType: 'radio',
      },
    },
    compensation_percentage: {
      title: 'Compensation percentage',
      type: 'number',
      'x-jsf-presentation': {
        inputType: 'number',
      },
    },
    compensation_amount: {
      title: 'Compensation amount',
      type: 'integer',
      'x-jsf-presentation': {
        currency: 'EUR',
        inputType: 'money',
      },
    },
  },
  required: ['clause_apply'],
  allOf: [
    {
      if: {
        properties: {
          clause_apply: { const: 'yes' },
          compensation_percentage: { type: 'number' },
        },
        required: ['clause_apply', 'compensation_percentage'],
      },
      then: {
        required: ['compensation_amount'],
      },
      else: {
        properties: {
          compensation_amount: false,
        },
      },
    },
  ],
};

function getField(form: ReturnType<typeof createHeadlessForm>, name: string) {
  return form.fields?.find((field) => field.name === name);
}

describe('createHeadlessForm', () => {
  describe('number field coercion', () => {
    it('should reveal a conditional field when the number guard value is a string', () => {
      const form = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'yes',
        compensation_percentage: '50',
      });

      expect(getField(form, 'compensation_amount')?.isVisible).toBe(true);
    });

    it('should reveal a conditional field when the number guard value is already a number', () => {
      const form = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'yes',
        compensation_percentage: 50,
      });

      expect(getField(form, 'compensation_amount')?.isVisible).toBe(true);
    });

    it('should keep the conditional field hidden when the number field is empty', () => {
      const form = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'yes',
        compensation_percentage: '',
      });

      expect(getField(form, 'compensation_amount')?.isVisible).toBe(false);
    });

    it('should keep the conditional field hidden when the number field is not numeric', () => {
      const form = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'yes',
        compensation_percentage: 'abc',
      });

      expect(getField(form, 'compensation_amount')?.isVisible).toBe(false);
    });

    it('should keep the conditional field hidden when the clause does not apply', () => {
      const form = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'no',
        compensation_percentage: '50',
      });

      expect(getField(form, 'compensation_amount')?.isVisible).toBe(false);
    });
  });
});
