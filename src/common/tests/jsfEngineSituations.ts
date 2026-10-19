import { FieldValues } from 'react-hook-form';
import { screen, waitFor, within } from '@testing-library/react';
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

const paymentTermsSchema: Schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    annual_gross_salary: money('Annual gross salary'),
    payment_terms: {
      title: 'Payment terms',
      type: 'string',
      oneOf: [
        {
          const: 'standard',
          title: 'Standard',
          description: 'Billed monthly',
        },
        {
          const: 'premium',
          title: 'Premium',
          description: 'Billed yearly',
          'x-jsf-presentation': { disabled: true },
        },
      ],
      'x-jsf-presentation': { inputType: 'radio' },
    },
  },
  required: ['annual_gross_salary', 'payment_terms'],
  'x-jsf-order': ['annual_gross_salary', 'payment_terms'],
};

const equitySchema: Schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    annual_gross_salary: money('Annual gross salary'),
    equity_compensation: {
      title: 'Equity management',
      type: 'object',
      additionalProperties: false,
      properties: {
        offer_equity_compensation: yesNo('Will this employee receive equity?'),
      },
      required: ['offer_equity_compensation'],
      'x-jsf-presentation': { inputType: 'fieldset' },
    },
  },
  required: ['equity_compensation'],
  'x-jsf-order': ['annual_gross_salary', 'equity_compensation'],
};

const standardHoursSchema: Schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    annual_gross_salary: money('Annual gross salary'),
    work_hours_per_week: {
      title: 'Work hours per week',
      type: 'number',
      'x-jsf-presentation': { inputType: 'number' },
    },
    avg_salary: {
      title: 'Standard Hours',
      type: ['number', 'null'],
      'x-jsf-logic-computedAttrs': {
        const: 'standard_hours',
        default: 'standard_hours',
        'x-jsf-presentation': {
          statement: {
            title: 'Standard Hours: <strong>{{standard_hours}}</strong>',
          },
        },
      },
      'x-jsf-presentation': { inputType: 'number' },
    },
  },
  required: ['annual_gross_salary', 'work_hours_per_week'],
  'x-jsf-order': ['annual_gross_salary', 'work_hours_per_week', 'avg_salary'],
  'x-jsf-logic': {
    computedValues: {
      standard_hours: {
        rule: { '*': [{ var: 'work_hours_per_week' }, 2] },
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
    situation:
      'forced value computed from an empty field is not rendered as NaN',
    schema: standardHoursSchema,
    fill: async (user) => {
      await user.click(await screen.findByRole('button', { name: 'Validate' }));
    },
    assert: async (submitted) => {
      expect(screen.getByLabelText('Work hours per week')).toBeVisible();
      expect(screen.queryByLabelText('Standard Hours')).not.toBeInTheDocument();
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
      expect(submitted.avg_salary).toBeUndefined();
    },
  },
  {
    situation: 'forced value computed from a filled field shows its statement',
    schema: standardHoursSchema,
    fill: async (user) => {
      await user.type(
        await screen.findByLabelText('Work hours per week'),
        '40',
      );
    },
    assert: async (submitted) => {
      expect(await screen.findByText('80')).toBeInTheDocument();
      expect(screen.queryByLabelText('Standard Hours')).not.toBeInTheDocument();
      expect(submitted.avg_salary).toBe(80);
    },
  },
  {
    situation: 'forced value computed from a cleared field is not submitted',
    schema: standardHoursSchema,
    fill: async (user) => {
      const hours = await screen.findByLabelText('Work hours per week');
      await user.type(hours, '40');
      expect(await screen.findByText('80')).toBeInTheDocument();
      await user.clear(hours);
    },
    assert: async (submitted) => {
      expect(screen.queryByText('80')).not.toBeInTheDocument();
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
      expect(submitted.avg_salary).toBeUndefined();
    },
  },
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
  {
    situation:
      'radio options from oneOf keep description and disabled after validation',
    schema: paymentTermsSchema,
    fill: async (user) => {
      await chooseInGroup(user, /Payment terms/i, 'Standard');
      await user.tab();
    },
    assert: async (submitted) => {
      expect(screen.getByRole('radio', { name: 'Standard' })).toBeEnabled();
      expect(screen.getByRole('radio', { name: 'Premium' })).toBeDisabled();
      expect(screen.getByText('Billed monthly')).toBeInTheDocument();
      expect(screen.getByText('Billed yearly')).toBeInTheDocument();
      expect(submitted.payment_terms).toBe('standard');
    },
  },
  {
    situation: 'required field inside an untouched fieldset shows its error',
    schema: equitySchema,
    fill: async (user) => {
      await user.click(await screen.findByRole('button', { name: 'Validate' }));
    },
    assert: async (submitted) => {
      const radioGroup = screen.getByRole('radiogroup', {
        name: /Will this employee receive equity/i,
      });
      await waitFor(() =>
        expect(radioGroup).toHaveAttribute('aria-invalid', 'true'),
      );
      expect(screen.getByText('Required field')).toBeInTheDocument();
      expect(submitted).toEqual({});
    },
  },
];
