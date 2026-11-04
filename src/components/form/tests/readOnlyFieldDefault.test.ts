import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { parseJSFToValidate } from '@/src/components/form/utils';

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    first_day: {
      title: 'First day',
      type: 'string',
      default: '1',
      oneOf: [
        { const: '1', title: '1st' },
        { const: '2', title: '2nd' },
      ],
      'x-jsf-presentation': { inputType: 'select' },
    },
    second_day: {
      title: 'Second day',
      type: 'string',
      readOnly: true,
      oneOf: [
        { const: '15', title: '15th' },
        { const: '16', title: '16th' },
      ],
      'x-jsf-presentation': { inputType: 'select' },
      'x-jsf-logic-computedAttrs': { default: 'second_day_value' },
    },
  },
  'x-jsf-logic': {
    computedValues: {
      second_day_value: {
        rule: { cat: [{ '+': [{ var: 'first_day' }, 14] }] },
      },
    },
  },
  'x-rmt-meta': { jsfVersion: '1' },
};

describe('parseJSFToValidate with a read-only field', () => {
  it('replaces a stale value with the default computed from the current values', async () => {
    const form = createHeadlessForm(schema, {});
    const values = { first_day: '2', second_day: '15' };

    await form.handleValidation(values);

    expect(
      await parseJSFToValidate(values, form.fields, {
        isPartialValidation: false,
      }),
    ).toEqual({ first_day: '2', second_day: '16' });
  });
});
