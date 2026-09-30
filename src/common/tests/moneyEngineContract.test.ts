import { FieldValues } from 'react-hook-form';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
  checkFieldHasForcedValue,
  parseJSFToValidate,
  parseSubmitValues,
} from '@/src/components/form/utils';
import { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';
import { contractDetailsSchemaV1Portugal } from '@/src/flows/Onboarding/tests/fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';

type Schema = Record<string, unknown>;

type FormSession = {
  render: (values: FieldValues) => Promise<$TSFixMe[]>;
  validate: (values: FieldValues) => Promise<{
    fields: $TSFixMe[];
    errors: Record<string, unknown> | undefined;
  }>;
};

const rebuildSession =
  (options?: Parameters<typeof createHeadlessForm>[2]) =>
  (schema: Schema): FormSession => {
    let form: JSONSchemaFormResultWithFieldsets;
    return {
      render: async (values) => {
        form = createHeadlessForm(schema, values, options);
        return form.fields;
      },
      validate: async (values) => {
        const { formErrors } = form.handleValidation(
          await parseJSFToValidate(values, form.fields),
        );
        return { fields: form.fields, errors: formErrors };
      },
    };
  };

const buildOnceSession = (schema: Schema): FormSession => {
  const form = createHeadlessForm(schema, {}, { transformMoneyFields: false });
  const validate = async (values: FieldValues) => {
    const { formErrors } = form.handleValidation(
      await parseJSFToValidate(values, form.fields, {
        isPartialValidation: true,
      }),
    );
    return { fields: form.fields, errors: formErrors };
  };
  return {
    render: async (values) => (await validate(values)).fields,
    validate,
  };
};

const ENGINES = [
  { engine: 'jsf v0', meta: { jsfOldVersion: true } },
  { engine: 'jsf v1', meta: { jsfVersion: '1' } },
  { engine: 'no meta', meta: undefined },
];

const STRATEGIES = [
  { strategy: 'rebuild without options', start: rebuildSession() },
  {
    strategy: 'rebuild with jsfModify',
    start: rebuildSession({ jsfModify: {} }),
  },
  { strategy: 'build once + handleValidation', start: buildOnceSession },
];

const forcedValues = (fields: $TSFixMe[]) =>
  Object.fromEntries(
    fields
      .filter((field) => field.isVisible && checkFieldHasForcedValue(field))
      .map((field) => [field.name, field.const]),
  );

const fillForm = async (session: FormSession, typed: FieldValues) => {
  let values = typed;
  let rendered = await session.render(values);
  for (let pass = 0; pass < 2; pass++) {
    values = { ...typed, ...forcedValues(rendered) };
    rendered = await session.render(values);
  }
  const renderedAllowance = rendered.find(
    (field) => field.name === 'working_hours_exemption_allowance',
  );
  const shown = {
    allowance: renderedAllowance?.const,
    description: renderedAllowance?.statement?.description,
  };
  const { fields, errors } = await session.validate(values);
  return {
    shown,
    errors,
    submitted: await parseSubmitValues(values, fields),
  };
};

const { 'x-rmt-meta': _meta, ...portugalSchema } =
  contractDetailsSchemaV1Portugal.data;

const extendedHours = {
  annual_gross_salary: 71703.77,
  work_schedule: 'full_time',
  working_hours_exemption: 'yes',
  maximum_working_hours_regime: 'yes',
};

describe.each(ENGINES)('money contract on $engine', ({ meta }) => {
  const schema = (): Schema =>
    structuredClone(
      meta ? { ...portugalSchema, 'x-rmt-meta': meta } : portugalSchema,
    );

  describe.each(STRATEGIES)('$strategy', ({ start }) => {
    it.each([
      { regime: 'yes', cents: 81257, label: '812.57' },
      { regime: 'no', cents: 29548, label: '295.48' },
    ])(
      'computes and submits the forced money allowance in cents (regime $regime)',
      async ({ regime, cents, label }) => {
        const { shown, submitted } = await fillForm(start(schema()), {
          ...extendedHours,
          maximum_working_hours_regime: regime,
        });

        expect(shown.allowance).toBe(cents);
        expect(shown.description).toContain(`additional ${label} EUR monthly`);
        expect(submitted.working_hours_exemption_allowance).toBe(cents);
        expect(submitted.annual_gross_salary).toBe(7170377);
      },
    );

    it('computes the allowance from the forced 40 hours when none were typed', async () => {
      const { shown, submitted } = await fillForm(
        start(schema()),
        extendedHours,
      );

      expect(submitted.work_hours_per_week).toBe(40);
      expect(shown.allowance).toBe(81257);
      expect(submitted.working_hours_exemption_allowance).toBe(81257);
    });

    it('computes the allowance from typed part-time hours', async () => {
      const { submitted } = await fillForm(start(schema()), {
        ...extendedHours,
        work_schedule: 'part_time',
        work_hours_per_week: 20,
        part_time_salary_confirmation: 'acknowledged',
      });

      expect(submitted.work_hours_per_week).toBe(20);
      expect(submitted.working_hours_exemption_allowance).toBe(162515);
    });

    it('recomputes the allowance on the same form when the regime changes', async () => {
      const session = start(schema());

      const first = await fillForm(session, extendedHours);
      const second = await fillForm(session, {
        ...extendedHours,
        maximum_working_hours_regime: 'no',
      });
      const third = await fillForm(session, extendedHours);

      expect([
        first.submitted.working_hours_exemption_allowance,
        second.submitted.working_hours_exemption_allowance,
        third.submitted.working_hours_exemption_allowance,
      ]).toEqual([81257, 29548, 81257]);
    });

    it('drops the allowance once extended hours are turned off', async () => {
      const session = start(schema());
      await fillForm(session, extendedHours);

      const { submitted } = await fillForm(session, {
        ...extendedHours,
        working_hours_exemption: 'no',
      });

      expect(submitted).not.toHaveProperty('working_hours_exemption_allowance');
      expect(submitted).not.toHaveProperty('maximum_working_hours_regime');
    });

    it.each([
      { salary: 12179.99, hasError: true },
      { salary: 12180, hasError: false },
    ])(
      'validates the full-time minimum salary in cents ($salary)',
      async ({ salary, hasError }) => {
        const { errors } = await fillForm(start(schema()), {
          ...extendedHours,
          annual_gross_salary: salary,
        });

        expect(Boolean(errors?.annual_gross_salary)).toBe(hasError);
      },
    );

    it('submits a conditional nullable money field in cents, and leaves it out when empty', async () => {
      const withBonus = { ...extendedHours, has_signing_bonus: 'yes' };

      const filled = await fillForm(start(schema()), {
        ...withBonus,
        signing_bonus_amount: 1000.5,
      });
      const empty = await fillForm(start(schema()), {
        ...withBonus,
        signing_bonus_amount: '',
      });

      expect(filled.submitted.signing_bonus_amount).toBe(100050);
      expect(empty.submitted).not.toHaveProperty('signing_bonus_amount');
    });

    it('submits checked acknowledgement checkboxes as their const', async () => {
      const { submitted } = await fillForm(start(schema()), {
        ...extendedHours,
        salary_installments_confirmation: true,
        contract_duration_type: true,
      });

      expect(submitted.salary_installments_confirmation).toBe('acknowledged');
      expect(submitted.contract_duration_type).toBe('indefinite');
    });
  });
});
