import {
  diffFingerprints,
  fingerprintSchema,
  formatChanges,
} from './behaviour';

type Schema = Record<string, unknown>;

const yesNo = (title: string, choices = ['yes', 'no']) => ({
  title,
  type: 'string',
  oneOf: choices.map((choice) => ({ const: choice, title: choice })),
  'x-jsf-presentation': { inputType: 'radio' },
});

const text = (title: string, extra: Schema = {}) => ({
  title,
  type: 'string',
  'x-jsf-presentation': { inputType: 'text' },
  ...extra,
});

const buildSchema = ({
  description = 'Original description',
  required = ['non_compete'],
  extraProperties = {},
  thenRequired = ['non_compete_months'],
  thenShows = ['non_compete_months', 'non_compete_notes'],
  choices,
  maxLength,
}: {
  description?: string;
  required?: string[];
  extraProperties?: Schema;
  thenRequired?: string[];
  thenShows?: string[];
  choices?: string[];
  maxLength?: number;
} = {}): Schema => ({
  type: 'object',
  additionalProperties: false,
  properties: {
    non_compete: { ...yesNo('Non-compete', choices), description },
    non_compete_months: text('Months'),
    reference: text('Reference', maxLength ? { maxLength } : {}),
    non_compete_notes: text('Notes'),
    ...extraProperties,
  },
  required,
  allOf: [
    {
      if: {
        properties: { non_compete: { const: 'yes' } },
        required: ['non_compete'],
      },
      then: {
        properties: {
          non_compete_months: thenShows.includes('non_compete_months')
            ? text('Months')
            : false,
          non_compete_notes: thenShows.includes('non_compete_notes')
            ? text('Notes')
            : false,
        },
        required: thenRequired,
      },
      else: {
        properties: { non_compete_months: false, non_compete_notes: false },
      },
    },
  ],
  'x-jsf-order': ['non_compete', 'non_compete_months', 'non_compete_notes'],
});

const buildHidingSchema = (hides: boolean): Schema => ({
  type: 'object',
  additionalProperties: false,
  properties: {
    non_compete: yesNo('Non-compete'),
    reference: text('Reference'),
  },
  required: ['non_compete'],
  allOf: [
    {
      if: {
        properties: { non_compete: { const: 'yes' } },
        required: ['non_compete'],
      },
      then: { properties: { reference: hides ? false : text('Reference') } },
    },
  ],
  'x-jsf-order': ['non_compete', 'reference'],
});

const withRule = (
  schema: Schema,
  {
    driver,
    driverField,
    driverValue = 'yes',
    shows,
    required,
  }: {
    driver: string;
    driverField: Schema;
    driverValue?: unknown;
    shows: Schema;
    required: string[];
  },
): Schema => ({
  ...schema,
  properties: {
    ...(schema.properties as Schema),
    [driver]: driverField,
    ...shows,
  },
  allOf: [
    ...(schema.allOf as Schema[]),
    {
      if: {
        properties: { [driver]: { const: driverValue } },
        required: [driver],
      },
      then: { properties: shows, required },
      else: {
        properties: Object.fromEntries(
          Object.keys(shows).map((name) => [name, false]),
        ),
      },
    },
  ],
});

const buildNestedSchema = (required: string[]): Schema => ({
  type: 'object',
  additionalProperties: false,
  properties: {
    details: {
      title: 'Details',
      type: 'object',
      properties: { kind: yesNo('Kind'), extra: false },
      required: ['kind'],
      allOf: [
        {
          if: {
            properties: { kind: { const: 'yes' } },
            required: ['kind'],
          },
          then: { properties: { extra: text('Extra') }, required },
        },
      ],
      'x-jsf-presentation': { inputType: 'fieldset' },
    },
  },
  required: ['details'],
});

describe.each(['buildOnce', 'rebuild'] as const)(
  'schema behaviour fingerprint with %s',
  (strategy) => {
    const fingerprint = (schema: Schema) => fingerprintSchema(schema, strategy);

    it('records what a conditional shows and requires per choice', async () => {
      const result = await fingerprint(buildSchema());

      expect(result.base).toEqual({
        visible: ['non_compete', 'reference'],
        required: ['non_compete'],
      });
      expect(result.scenarios['non_compete=yes']).toEqual({
        addedVisible: ['non_compete_months', 'non_compete_notes'],
        removedVisible: [],
        addedRequired: ['non_compete_months'],
        removedRequired: [],
      });
    });

    it('reports nothing when only descriptions change', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        buildSchema({ description: 'A completely different description' }),
      );

      expect(diffFingerprints(before, after)).toEqual([]);
    });

    it('flags a field that becomes required without a new version', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        buildSchema({
          extraProperties: { non_interference: yesNo('Non-interference') },
          required: ['non_compete', 'non_interference'],
        }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: '`non_interference` is a new required field',
        },
      ]);
    });

    it('flags an existing optional field that becomes required', async () => {
      const withOptional = buildSchema({
        extraProperties: { non_interference: yesNo('Non-interference') },
      });
      const before = await fingerprint(withOptional);
      const after = await fingerprint(
        buildSchema({
          extraProperties: { non_interference: yesNo('Non-interference') },
          required: ['non_compete', 'non_interference'],
        }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        { severity: 'breaking', message: '`non_interference` is now required' },
      ]);
    });

    it('flags a conditional that starts requiring another field', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        buildSchema({
          thenRequired: ['non_compete_months', 'non_compete_notes'],
        }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message:
            'choosing `non_compete=yes` now requires `non_compete_notes`',
        },
      ]);
    });

    it('treats a field that stops being required as informational', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(buildSchema({ required: [] }));

      expect(diffFingerprints(before, after)).toEqual([
        { severity: 'info', message: '`non_compete` is no longer required' },
      ]);
    });

    it('flags a tightened length limit', async () => {
      const before = await fingerprint(buildSchema({ maxLength: 20 }));
      const after = await fingerprint(buildSchema({ maxLength: 10 }));

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: '`reference` maxLength changed from 20 to 10',
        },
      ]);
    });

    it('flags a new limit on an existing field', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(buildSchema({ maxLength: 10 }));

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: '`reference` has a new maxLength: 10',
        },
      ]);
    });

    it('treats a new optional field with a limit as informational', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        buildSchema({
          extraProperties: { nickname: text('Nickname', { maxLength: 10 }) },
        }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        { severity: 'info', message: '`nickname` is a new optional field' },
      ]);
    });

    it('flags a field that is no longer shown', async () => {
      const before = await fingerprint(
        buildSchema({
          extraProperties: { non_interference: yesNo('Non-interference') },
        }),
      );
      const after = await fingerprint(buildSchema());

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: '`non_interference` is no longer shown',
        },
      ]);
    });

    it('flags a changed input type', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        buildSchema({ extraProperties: { reference: yesNo('Reference') } }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: '`reference` changed input type from text to radio',
        },
      ]);
    });

    it('flags an allowed value that is removed', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(buildSchema({ choices: ['yes'] }));

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: '`non_compete` no longer accepts "no"',
        },
      ]);
    });

    it('flags a choice that stops showing one of its fields', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        buildSchema({ thenShows: ['non_compete_months'] }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message:
            'choosing `non_compete=yes` no longer shows `non_compete_notes`',
        },
      ]);
    });

    it('flags a choice that stops showing every field it used to show', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        buildSchema({ thenShows: [], thenRequired: [] }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message:
            'choosing `non_compete=yes` no longer shows `non_compete_months`',
        },
        {
          severity: 'breaking',
          message:
            'choosing `non_compete=yes` no longer shows `non_compete_notes`',
        },
      ]);
    });

    it('flags a choice that starts hiding a field that was visible', async () => {
      const before = await fingerprint(buildHidingSchema(false));
      const after = await fingerprint(buildHidingSchema(true));

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: 'choosing `non_compete=yes` now hides `reference`',
        },
      ]);
    });

    it('treats a choice that stops hiding a field as informational', async () => {
      const before = await fingerprint(buildHidingSchema(true));
      const after = await fingerprint(buildHidingSchema(false));

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'info',
          message: 'choosing `non_compete=yes` no longer changes any field',
        },
      ]);
    });

    it('treats a new allowed value as informational', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        buildSchema({ choices: ['yes', 'no', 'maybe'] }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'info',
          message: '`non_compete` accepts a new value "maybe"',
        },
      ]);
    });

    it('treats a loosened length limit as informational', async () => {
      const before = await fingerprint(buildSchema({ maxLength: 10 }));
      const after = await fingerprint(buildSchema({ maxLength: 20 }));

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'info',
          message: '`reference` maxLength changed from 10 to 20',
        },
      ]);
    });

    it('flags a changed pattern', async () => {
      const withPattern = (pattern: string) =>
        buildSchema({
          extraProperties: { reference: text('Reference', { pattern }) },
        });
      const before = await fingerprint(withPattern('^A'));
      const after = await fingerprint(withPattern('^B'));

      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: '`reference` pattern changed from ^A to ^B',
        },
      ]);
    });

    it('survives a JSON round trip when a limit is not a finite number', async () => {
      const result = await fingerprint(
        buildSchema({
          extraProperties: {
            reference: text('Reference', { maxLength: Number.NaN }),
          },
        }),
      );
      const stored = JSON.parse(JSON.stringify(result));

      expect(diffFingerprints(stored, result)).toEqual([]);
    });

    it('does not report a requirement from a newly added choice field', async () => {
      const before = await fingerprint(buildSchema());
      const after = await fingerprint(
        withRule(buildSchema(), {
          driver: 'visa_support',
          driverField: yesNo('Visa support'),
          shows: { visa_notes: text('Visa notes') },
          required: ['visa_notes'],
        }),
      );

      expect(diffFingerprints(before, after)).toEqual([
        { severity: 'info', message: '`visa_support` is a new optional field' },
      ]);
    });

    it('records a select choice and flags what it now requires', async () => {
      const select = (title: string) => ({
        title,
        type: 'string',
        oneOf: ['a', 'b'].map((c) => ({ const: c, title: c })),
        'x-jsf-presentation': { inputType: 'select' },
      });
      const build = (required: string[]) =>
        withRule(buildSchema(), {
          driver: 'plan',
          driverField: select('Plan'),
          driverValue: 'a',
          shows: { plan_notes: text('Plan notes') },
          required,
        });
      const before = await fingerprint(build([]));
      const after = await fingerprint(build(['plan_notes']));

      expect(before.scenarios['plan=a']?.addedVisible).toEqual(['plan_notes']);
      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: 'choosing `plan=a` now requires `plan_notes`',
        },
      ]);
    });

    it('records a checkbox as a single checked choice', async () => {
      const checkbox = {
        title: 'Agreed',
        type: 'boolean',
        'x-jsf-presentation': { inputType: 'checkbox' },
      };
      const result = await fingerprint(
        withRule(buildSchema(), {
          driver: 'agreed',
          driverField: checkbox,
          driverValue: true,
          shows: { agreed_notes: text('Agreed notes') },
          required: [],
        }),
      );

      expect(Object.keys(result.scenarios)).toContain('agreed=true');
      expect(result.scenarios['agreed=true'].addedVisible).toEqual([
        'agreed_notes',
      ]);
    });

    it('does not try choices when a field has too many options', async () => {
      const many = Array.from({ length: 9 }, (_, i) => `v${i}`);
      const result = await fingerprint(
        withRule(buildSchema(), {
          driver: 'plan',
          driverField: yesNo('Plan', many),
          driverValue: 'v0',
          shows: { plan_notes: text('Plan notes') },
          required: [],
        }),
      );

      expect(
        Object.keys(result.scenarios).filter((key) => key.startsWith('plan=')),
      ).toEqual([]);
    });

    it('addresses fields inside a fieldset by their full path', async () => {
      const build = (required: string[]) => buildNestedSchema(required);
      const before = await fingerprint(build([]));
      const after = await fingerprint(build(['extra']));

      expect(before.base.visible).toEqual(['details.kind']);
      expect(before.scenarios['details.kind=yes']).toEqual({
        addedVisible: ['details.extra'],
        removedVisible: [],
        addedRequired: [],
        removedRequired: [],
      });
      expect(diffFingerprints(before, after)).toEqual([
        {
          severity: 'breaking',
          message: 'choosing `details.kind=yes` now requires `details.extra`',
        },
      ]);
    });

    it('formats changes as a markdown list', () => {
      expect(
        formatChanges([
          { severity: 'breaking', message: '`a` is now required' },
          { severity: 'info', message: '`b` is no longer required' },
        ]),
      ).toBe('- ❌ `a` is now required\n- ℹ️ `b` is no longer required');
    });
  },
);
