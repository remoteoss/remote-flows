import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { parseSubmitValues } from '@/src/components/form/utils';

const forcedAllowance = {
  title: 'Allowance',
  type: 'integer',
  const: 81257,
  default: 81257,
  'x-jsf-presentation': { inputType: 'money', currency: 'EUR' },
};

describe('parseSubmitValues', () => {
  it('submits a forced money value as its const, even though the form holds it unconverted', async () => {
    const { fields } = createHeadlessForm(
      {
        type: 'object',
        properties: { allowance: forcedAllowance },
        'x-jsf-order': ['allowance'],
      },
      {},
    );

    expect(await parseSubmitValues({ allowance: 81257 }, fields)).toEqual({
      allowance: 81257,
    });
  });

  it('submits a forced money value nested in a fieldset as its const', async () => {
    const { fields } = createHeadlessForm(
      {
        type: 'object',
        properties: {
          compensation: {
            title: 'Compensation',
            type: 'object',
            properties: { allowance: forcedAllowance },
            'x-jsf-order': ['allowance'],
            'x-jsf-presentation': { inputType: 'fieldset' },
          },
        },
        'x-jsf-order': ['compensation'],
      },
      {},
    );

    expect(
      await parseSubmitValues({ compensation: { allowance: 81257 } }, fields),
    ).toEqual({ compensation: { allowance: 81257 } });
  });
});
