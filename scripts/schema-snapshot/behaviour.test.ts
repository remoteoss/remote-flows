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
