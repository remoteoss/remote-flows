import { FieldValues } from 'react-hook-form';
import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { contractDetailsSchemaV1Portugal } from '@/src/flows/Onboarding/tests/fixtures';

export type Schema = Record<string, unknown>;

export type Situation = {
  situation: string;
  schema: Schema;
  fill: (user: UserEvent) => Promise<void>;
  assert: (submitted: FieldValues) => Promise<void>;
};

const withoutMeta = ({ 'x-rmt-meta': _meta, ...schema }: Schema) => schema;

export const portugal = withoutMeta(contractDetailsSchemaV1Portugal.data);

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
    schema: portugal,
    fill: async (user) => {
      await user.type(
        await screen.findByLabelText('Annual gross salary'),
        '71703.77',
      );
      await chooseInGroup(user, /Type of employee/i, 'Full-time');
      await chooseInGroup(user, /work outside regular work hours/i, 'Yes');
      await chooseInGroup(user, /more than 8 hours a day/i, 'Yes');
    },
    assert: async (submitted) => {
      expect(
        await screen.findByText(/additional 812.57 EUR monthly/),
      ).toBeInTheDocument();
      expect(submitted.working_hours_exemption_allowance).toBe(81257);
    },
  },
  {
    situation: 'radio reveals a conditional money field',
    schema: portugal,
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
