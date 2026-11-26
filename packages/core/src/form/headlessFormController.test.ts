import { createHeadlessFormController } from './headlessFormController';

const signingBonusSchema = {
  type: 'object',
  'x-rmt-meta': { jsfVersion: '1' },
  properties: {
    annual_gross_salary: {
      title: 'Annual gross salary',
      type: 'integer',
      'x-jsf-presentation': { inputType: 'money' },
    },
    has_signing_bonus: {
      title: 'Offer a signing bonus?',
      type: 'string',
      oneOf: [
        { const: 'yes', title: 'Yes' },
        { const: 'no', title: 'No' },
      ],
      'x-jsf-presentation': { inputType: 'radio' },
    },
    signing_bonus_amount: {
      title: 'Signing bonus amount',
      type: 'integer',
      'x-jsf-presentation': { inputType: 'money' },
    },
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
};

const fileSchema = {
  type: 'object',
  'x-rmt-meta': { jsfVersion: '1' },
  properties: {
    has_attachment: {
      title: 'Attach a file?',
      type: 'string',
      oneOf: [
        { const: 'yes', title: 'Yes' },
        { const: 'no', title: 'No' },
      ],
      'x-jsf-presentation': { inputType: 'radio' },
    },
    contract: {
      title: 'Contract',
      type: 'array',
      'x-jsf-presentation': { inputType: 'file' },
    },
    note: {
      title: 'Note',
      type: 'string',
      'x-jsf-presentation': { inputType: 'text' },
    },
  },
  allOf: [
    {
      if: {
        properties: { has_attachment: { const: 'yes' } },
        required: ['has_attachment'],
      },
      then: { required: ['note'] },
      else: { properties: { note: false } },
    },
  ],
};

const fieldsetSchema = {
  type: 'object',
  'x-rmt-meta': { jsfVersion: '1' },
  properties: {
    bank_details: {
      title: 'Bank details',
      type: 'object',
      'x-jsf-presentation': { inputType: 'fieldset' },
      properties: {
        iban: {
          title: 'IBAN',
          type: 'string',
          'x-jsf-presentation': { inputType: 'text' },
        },
      },
      required: ['iban'],
    },
  },
  required: ['bank_details'],
};

const findField = (
  form: ReturnType<ReturnType<typeof createHeadlessFormController>['getForm']>,
  name: string,
) => form?.fields.find((field) => field.name === name);

describe('createHeadlessFormController', () => {
  it('starts empty before sync and when schema is undefined', async () => {
    const controller = createHeadlessFormController();

    expect(controller.getForm()).toBeNull();
    expect(controller.getRevision()).toBe(0);
    expect(await controller.handleValidation({})).toBeNull();
    expect(await controller.parseFormValues({ foo: 'bar' })).toEqual({});

    expect(controller.sync({ schema: undefined })).toBeNull();
    expect(controller.getForm()).toBeNull();
  });

  it('builds a form from initialValues and caches across deep-equal options and initialValues', () => {
    const controller = createHeadlessFormController();
    const schema = structuredClone(signingBonusSchema);
    const options = {
      jsfModify: {
        fields: { signing_bonus_amount: { title: 'Bonus' } },
      },
    };

    const firstForm = controller.sync({
      schema,
      initialValues: { has_signing_bonus: 'yes' },
      options,
    });

    expect(firstForm).not.toBeNull();
    expect(controller.getForm()).toBe(firstForm);
    expect(findField(firstForm, 'signing_bonus_amount')?.isVisible).toBe(true);
    expect(findField(firstForm, 'signing_bonus_amount')?.label).toBe('Bonus');

    const secondForm = controller.sync({
      schema,
      initialValues: { has_signing_bonus: 'yes' },
      options: structuredClone(options),
    });

    expect(secondForm).toBe(firstForm);
  });

  it('rebuilds when initialValues arrive after the schema', () => {
    const controller = createHeadlessFormController();
    const schema = structuredClone(signingBonusSchema);

    const initialForm = controller.sync({ schema, initialValues: {} });
    expect(findField(initialForm, 'signing_bonus_amount')?.isVisible).toBe(
      false,
    );

    const hydratedForm = controller.sync({
      schema,
      initialValues: { has_signing_bonus: 'yes' },
    });

    expect(hydratedForm).not.toBe(initialForm);
    expect(findField(hydratedForm, 'signing_bonus_amount')?.isVisible).toBe(
      true,
    );
  });

  it('preserves user-revealed fields when jsfModify changes', async () => {
    const controller = createHeadlessFormController();
    const schema = structuredClone(signingBonusSchema);

    controller.sync({
      schema,
      options: {
        jsfModify: { fields: { signing_bonus_amount: { title: 'Bonus' } } },
      },
    });
    await controller.onValuesChange({ has_signing_bonus: 'yes' });
    expect(
      findField(controller.getForm(), 'signing_bonus_amount')?.isVisible,
    ).toBe(true);

    const rebuiltForm = controller.sync({
      schema,
      options: {
        jsfModify: {
          fields: { signing_bonus_amount: { title: 'Welcome bonus' } },
        },
      },
    });

    expect(findField(rebuiltForm, 'signing_bonus_amount')?.isVisible).toBe(
      true,
    );
    expect(findField(rebuiltForm, 'signing_bonus_amount')?.label).toBe(
      'Welcome bonus',
    );
  });

  it('preserves user-hidden fields over initialValues when jsfModify changes', async () => {
    const controller = createHeadlessFormController();
    const schema = structuredClone(signingBonusSchema);

    controller.sync({
      schema,
      initialValues: { has_signing_bonus: 'yes' },
      options: {
        jsfModify: { fields: { signing_bonus_amount: { title: 'Bonus' } } },
      },
    });
    await controller.onValuesChange({ has_signing_bonus: 'no' });
    expect(
      findField(controller.getForm(), 'signing_bonus_amount')?.isVisible,
    ).toBe(false);

    const rebuiltForm = controller.sync({
      schema,
      initialValues: { has_signing_bonus: 'yes' },
      options: {
        jsfModify: {
          fields: { signing_bonus_amount: { title: 'Welcome bonus' } },
        },
      },
    });

    expect(findField(rebuiltForm, 'signing_bonus_amount')?.isVisible).toBe(
      false,
    );
  });

  it('rebuilds from initialValues when schema reference changes', async () => {
    const controller = createHeadlessFormController();

    controller.sync({
      schema: structuredClone(signingBonusSchema),
      initialValues: {},
    });
    await controller.onValuesChange({ has_signing_bonus: 'yes' });
    expect(
      findField(controller.getForm(), 'signing_bonus_amount')?.isVisible,
    ).toBe(true);

    const nextForm = controller.sync({
      schema: structuredClone(signingBonusSchema),
      initialValues: {},
    });

    expect(findField(nextForm, 'signing_bonus_amount')?.isVisible).toBe(false);
  });

  it('notifies subscribers on validation, never on sync, and stops after unsubscribe', async () => {
    const controller = createHeadlessFormController();
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.sync({ schema: structuredClone(signingBonusSchema) });
    expect(listener).not.toHaveBeenCalled();
    expect(controller.getRevision()).toBe(0);

    await controller.handleValidation({ has_signing_bonus: 'yes' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(controller.getRevision()).toBe(1);

    await controller.onValuesChange({ has_signing_bonus: 'no' });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(controller.getRevision()).toBe(2);

    unsubscribe();
    await controller.handleValidation({ has_signing_bonus: 'yes' });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(controller.getRevision()).toBe(3);
  });

  it('reports nested errors for untouched visible fieldsets', async () => {
    const controller = createHeadlessFormController();
    controller.sync({ schema: structuredClone(fieldsetSchema) });

    const result = await controller.handleValidation({});

    expect(result).toEqual(
      expect.objectContaining({
        formErrors: {
          bank_details: {
            iban: expect.any(String),
          },
        },
      }),
    );
  });

  it('passes files through by default and uses config.convertFiles when provided', async () => {
    const files = [{ name: 'contract.pdf', id: 'file-1' }];

    const defaultController = createHeadlessFormController();
    defaultController.sync({ schema: structuredClone(fileSchema) });
    expect(
      await defaultController.parseFormValues({ contract: files }),
    ).toEqual({
      contract: files,
    });

    const convertFiles = vi.fn().mockResolvedValue([{ name: 'converted.pdf' }]);
    const customController = createHeadlessFormController({ convertFiles });
    customController.sync({ schema: structuredClone(fileSchema) });

    await customController.handleValidation({ contract: files });
    expect(convertFiles).toHaveBeenCalledWith(files);

    const parsed = await customController.parseFormValues({ contract: files });
    expect(parsed).toEqual({ contract: [{ name: 'converted.pdf' }] });
    expect(convertFiles).toHaveBeenCalledTimes(2);
  });

  it('logs actionable jsfModify warnings only when config.logModifyWarnings is true', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalidModify = {
      jsfModify: {
        create: {
          annual_gross_salary: { title: 'Duplicate field' },
        },
      },
    };

    try {
      const silentController = createHeadlessFormController();
      silentController.sync({
        schema: structuredClone(signingBonusSchema),
        options: invalidModify,
      });
      expect(warnSpy).not.toHaveBeenCalled();

      const verboseController = createHeadlessFormController({
        logModifyWarnings: true,
      });
      verboseController.sync({
        schema: structuredClone(signingBonusSchema),
        options: invalidModify,
      });
      expect(warnSpy).toHaveBeenCalledWith(
        'jsfModify warnings:',
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
          }),
        ]),
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('ignores an out-of-order validation that finishes after a newer one', async () => {
    let resolveFirst!: (value: unknown) => void;
    let callCount = 0;
    const convertFiles = vi.fn(() => {
      callCount += 1;
      if (callCount === 1) {
        return new Promise((resolve) => {
          resolveFirst = resolve;
        });
      }
      return Promise.resolve([{ name: 'second.pdf' }]);
    });

    const controller = createHeadlessFormController({ convertFiles });
    const listener = vi.fn();
    controller.subscribe(listener);
    controller.sync({ schema: structuredClone(fileSchema) });

    const firstValidation = controller.handleValidation({
      has_attachment: 'yes',
      contract: [{ name: 'first.pdf' }],
    });
    const secondValidation = controller.handleValidation({
      has_attachment: 'no',
      contract: [{ name: 'second.pdf' }],
    });

    const secondResult = await secondValidation;
    expect(secondResult).not.toBeNull();
    expect(findField(controller.getForm(), 'note')?.isVisible).toBe(false);
    expect(controller.getRevision()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);

    resolveFirst([{ name: 'first.pdf' }]);
    const firstResult = await firstValidation;

    expect(firstResult).toBeNull();
    expect(findField(controller.getForm(), 'note')?.isVisible).toBe(false);
    expect(controller.getRevision()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('ignores an in-flight validation when sync replaces the form', async () => {
    let resolveConversion!: (value: unknown) => void;
    const convertFiles = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveConversion = resolve;
        }),
    );

    const controller = createHeadlessFormController({ convertFiles });
    const listener = vi.fn();
    controller.subscribe(listener);
    controller.sync({ schema: structuredClone(fileSchema) });

    const pendingValidation = controller.handleValidation({
      has_attachment: 'yes',
      contract: [{ name: 'old.pdf' }],
    });

    controller.sync({ schema: structuredClone(fileSchema) });
    resolveConversion([{ name: 'old.pdf' }]);

    expect(await pendingValidation).toBeNull();
    expect(findField(controller.getForm(), 'note')?.isVisible).toBe(false);
    expect(controller.getRevision()).toBe(0);
    expect(listener).not.toHaveBeenCalled();
  });

  it('leaves the caller schema untouched', async () => {
    const controller = createHeadlessFormController();
    const schema = structuredClone(signingBonusSchema);
    const untouched = structuredClone(schema);

    controller.sync({
      schema,
      options: {
        jsfModify: { fields: { signing_bonus_amount: { title: 'Bonus' } } },
      },
    });
    await controller.handleValidation({
      has_signing_bonus: 'yes',
      signing_bonus_amount: '1000',
    });

    expect(schema).toEqual(untouched);
  });
});
