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

// The kit only treats a schema as v1 when jsfVersion is exactly '1'; anything
// else goes through the v0 path, which casts values with yup before evaluating
// conditionals.
const schemaWithNumberGuardV0 = {
  ...schemaWithNumberGuard,
  'x-rmt-meta': {
    jsfVersion: '0',
  },
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

    it('should keep the conditional field hidden when the number field only contains whitespace', () => {
      const form = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'yes',
        compensation_percentage: '   ',
      });

      expect(getField(form, 'compensation_amount')?.isVisible).toBe(false);
    });

    it('should keep the conditional field hidden for values Number() would coerce to 0', () => {
      const booleanForm = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'yes',
        compensation_percentage: true,
      });
      const arrayForm = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'yes',
        compensation_percentage: [],
      });

      expect(getField(booleanForm, 'compensation_amount')?.isVisible).toBe(
        false,
      );
      expect(getField(arrayForm, 'compensation_amount')?.isVisible).toBe(false);
    });

    it('should keep the conditional field hidden when the clause does not apply', () => {
      const form = createHeadlessForm(schemaWithNumberGuard, {
        clause_apply: 'no',
        compensation_percentage: '50',
      });

      expect(getField(form, 'compensation_amount')?.isVisible).toBe(false);
    });

    // Nothing in createHeadlessForm branches on jsfVersion, so the coercion also
    // runs on v0 schemas. These lock in that it stays a no-op there.
    it('should not change how v0 schemas evaluate the same guard', () => {
      const numeric = createHeadlessForm(schemaWithNumberGuardV0, {
        clause_apply: 'yes',
        compensation_percentage: '50',
      });
      const empty = createHeadlessForm(schemaWithNumberGuardV0, {
        clause_apply: 'yes',
        compensation_percentage: '',
      });
      const invalid = createHeadlessForm(schemaWithNumberGuardV0, {
        clause_apply: 'yes',
        compensation_percentage: 'abc',
      });

      expect(getField(numeric, 'compensation_amount')?.isVisible).toBe(true);
      expect(getField(empty, 'compensation_amount')?.isVisible).toBe(false);
      expect(getField(invalid, 'compensation_amount')?.isVisible).toBe(false);
    });
  });
});
