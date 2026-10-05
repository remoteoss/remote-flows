import { FieldValues } from 'react-hook-form';
import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

export type Schema = Record<string, unknown>;

export type Situation = {
  situation: string;
  schema: Schema;
  fill: (user: UserEvent) => Promise<void>;
  assert: (submitted: FieldValues) => Promise<void>;
};

const money = (title: string) => ({
  title,
  type: ['integer', 'null'],
  'x-jsf-presentation': { inputType: 'money', currency: 'EUR' },
});

const yesNo = (title: string) => ({
  title,
  type: 'string',
  oneOf: [
    { const: 'yes', title: 'Yes' },
    { const: 'no', title: 'No' },
  ],
  'x-jsf-presentation': { inputType: 'radio', direction: 'row' },
});

const monthlySalaryInCents = {
  '-': [
    { '/': [{ var: 'annual_gross_salary' }, 12] },
    { '%': [{ '/': [{ var: 'annual_gross_salary' }, 12] }, 1] },
  ],
};

export const signingBonusSchema: Schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    annual_gross_salary: money('Annual gross salary'),
    has_signing_bonus: yesNo('Offer a signing bonus?'),
    signing_bonus_amount: money('Signing bonus amount'),
  },
  required: ['annual_gross_salary', 'has_signing_bonus'],
  allOf: [
    {
      if: {
        properties: { has_signing_bonus: { const: 'yes' } },
        required: ['has_signing_bonus'],
      },
      then: { required: ['signing_bonus_amount'] },
      else: { properties: { signing_bonus_amount: false } },
    },
  ],
  'x-jsf-order': [
    'annual_gross_salary',
    'has_signing_bonus',
    'signing_bonus_amount',
  ],
};

const monthlyAllowanceSchema: Schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    annual_gross_salary: money('Annual gross salary'),
    pays_monthly_allowance: yesNo('Pay a monthly allowance?'),
    monthly_allowance: money('Monthly allowance'),
  },
  required: ['annual_gross_salary', 'pays_monthly_allowance'],
  allOf: [
    {
      if: {
        properties: {
          annual_gross_salary: { minimum: 1 },
          pays_monthly_allowance: { const: 'yes' },
        },
        required: ['annual_gross_salary', 'pays_monthly_allowance'],
      },
      then: {
        properties: {
          monthly_allowance: {
            'x-jsf-logic-computedAttrs': {
              const: 'monthly_allowance_in_cents',
              default: 'monthly_allowance_in_cents',
              'x-jsf-presentation': {
                statement: {
                  description:
                    'You need to pay an <strong>additional {{monthly_allowance_value}} EUR monthly</strong>.',
                  severity: 'info',
                },
              },
            },
          },
        },
        required: ['monthly_allowance'],
      },
      else: { properties: { monthly_allowance: false } },
    },
  ],
  'x-jsf-order': [
    'annual_gross_salary',
    'pays_monthly_allowance',
    'monthly_allowance',
  ],
  'x-jsf-logic': {
    computedValues: {
      monthly_allowance_in_cents: {
        rule: { if: [{ var: 'annual_gross_salary' }, monthlySalaryInCents, 0] },
      },
      monthly_allowance_value: {
        rule: {
          if: [
            { var: 'annual_gross_salary' },
            { '/': [monthlySalaryInCents, 100] },
            0,
          ],
        },
      },
    },
  },
};

export const chooseInGroup = async (
  user: UserEvent,
  group: RegExp,
  option: string,
) => {
  const radioGroup = await screen.findByRole('radiogroup', { name: group });
  await user.click(within(radioGroup).getByRole('radio', { name: option }));
};

export const SITUATIONS: Situation[] = [
  {
    situation: 'forced money value computed from another money field',
    schema: monthlyAllowanceSchema,
    fill: async (user) => {
      await user.type(
        await screen.findByLabelText('Annual gross salary'),
        '1234.56',
      );
      await chooseInGroup(user, /Pay a monthly allowance/i, 'Yes');
    },
    assert: async (submitted) => {
      expect(
        await screen.findByText(/additional 102.88 EUR monthly/),
      ).toBeInTheDocument();
      expect(submitted.monthly_allowance).toBe(10288);
    },
  },
  {
    situation: 'radio reveals a conditional money field',
    schema: signingBonusSchema,
    fill: async (user) => {
      await chooseInGroup(user, /Offer a signing bonus/i, 'Yes');
      await user.type(
        await screen.findByLabelText('Signing bonus amount'),
        '1000.50',
      );
    },
    assert: async (submitted) => {
      expect(screen.getByLabelText('Signing bonus amount')).toBeVisible();
      expect(submitted.signing_bonus_amount).toBe(100050);
    },
  },
];
