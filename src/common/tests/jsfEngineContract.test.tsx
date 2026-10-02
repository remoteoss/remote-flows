import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import {
  HeadlessFormStrategy,
  useHeadlessForm,
} from '@/src/common/useHeadlessForm';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { JSFModify } from '@/src/flows/types';
import { contractDetailsSchemaV1Portugal } from '@/src/flows/Onboarding/tests/fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

type Schema = Record<string, unknown>;

type Situation = {
  situation: string;
  schema: Schema;
  fill: (user: UserEvent) => Promise<void>;
  assert: (submitted: FieldValues) => Promise<void>;
};

const ENGINES = [
  { engine: 'jsf v0', meta: { jsfOldVersion: true } },
  { engine: 'jsf v1', meta: { jsfVersion: '1' } },
  { engine: 'no meta', meta: undefined },
];

const STRATEGIES: { strategy: HeadlessFormStrategy }[] = [
  { strategy: 'rebuild' },
  { strategy: 'buildOnce' },
];

const OPTIONS: {
  options: string;
  value: { jsfModify?: JSFModify } | undefined;
  assertApplied?: () => void;
}[] = [
  { options: 'no options', value: undefined },
  { options: 'no jsfModify', value: { jsfModify: undefined } },
  {
    options: 'a jsfModify',
    value: {
      jsfModify: {
        fields: { annual_gross_salary: { description: 'Gross, per year' } },
      },
    },
    assertApplied: () =>
      expect(screen.getByText('Gross, per year')).toBeInTheDocument(),
  },
];

const withoutMeta = ({ 'x-rmt-meta': _meta, ...schema }: Schema) => schema;

const portugal = withoutMeta(contractDetailsSchemaV1Portugal.data);

const chooseInGroup = async (
  user: UserEvent,
  group: RegExp,
  option: string,
) => {
  const radioGroup = await screen.findByRole('radiogroup', { name: group });
  await user.click(within(radioGroup).getByRole('radio', { name: option }));
};

const SITUATIONS: Situation[] = [
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

function Harness({
  schema,
  strategy,
  options,
  onCapture,
}: {
  schema: Schema;
  strategy: HeadlessFormStrategy;
  options: { jsfModify?: JSFModify } | undefined;
  onCapture: (submitted: FieldValues) => void;
}) {
  const [values, setValues] = useState<FieldValues>({});
  const headless = useHeadlessForm({ schema, values, options, strategy });
  const form = useJSONSchemaForm({
    handleValidation: headless.handleValidation,
    defaultValues: {},
    checkFieldUpdates: async (nextValues) => {
      setValues(nextValues);
      await headless.onValuesChange(nextValues);
    },
  });

  if (!headless.form) return null;

  return (
    <Form {...form}>
      <form>
        <JSONSchemaFormFields
          fields={headless.form.fields}
          fieldsets={headless.form.meta['x-jsf-fieldsets']}
          fieldValues={values}
        />
        <button
          type='button'
          onClick={async () =>
            onCapture(await headless.parseFormValues(form.getValues()))
          }
        >
          Capture
        </button>
      </form>
    </Form>
  );
}

beforeEach(() => {
  queryClient.clear();
});

describe.each(ENGINES)('jsf engine contract on $engine', ({ meta }) => {
  describe.each(STRATEGIES)('$strategy', ({ strategy }) => {
    describe.each(OPTIONS)(
      'with $options',
      ({ value: options, assertApplied }) => {
        it.each(SITUATIONS)('$situation', async ({ schema, fill, assert }) => {
          const user = userEvent.setup();
          const onCapture = vi.fn();
          render(
            <Harness
              schema={structuredClone(
                meta ? { ...schema, 'x-rmt-meta': meta } : schema,
              )}
              strategy={strategy}
              options={options}
              onCapture={onCapture}
            />,
            { wrapper: TestProviders },
          );

          await fill(user);
          await user.click(screen.getByRole('button', { name: 'Capture' }));
          await waitFor(() => expect(onCapture).toHaveBeenCalled());

          await assert(onCapture.mock.lastCall?.[0]);
          assertApplied?.();
        });
      },
    );
  });
});
