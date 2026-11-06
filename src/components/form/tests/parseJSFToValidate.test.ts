import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { groupArrayInFieldsetSchema, groupArraySchema } from './fixtures';

const buildFields = (schema: Record<string, unknown>) =>
  createHeadlessForm(schema as $TSFixMe, {}).fields as $TSFixMe[];

const readOnlySchema = {
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

describe('parseJSFToValidate', () => {
  describe('group-array rows', () => {
    it('converts each row to API units and keeps the rows in order', async () => {
      const parsed = await parseJSFToValidate(
        {
          items: [
            { description: 'Design work', amount: '2500' },
            { description: ' Hosting ', amount: '19.99' },
          ],
        },
        buildFields(groupArraySchema),
      );

      expect(parsed).toEqual({
        items: [
          { description: 'Design work', amount: 250000 },
          { description: 'Hosting', amount: 1999 },
        ],
      });
    });

    it('reads blank values in a row as missing', async () => {
      const parsed = await parseJSFToValidate(
        { items: [{ description: '', amount: '' }] },
        buildFields(groupArraySchema),
      );

      expect(parsed).toEqual({ items: [{}] });
    });

    it('parses the rows under an object fieldset', async () => {
      const parsed = await parseJSFToValidate(
        { team: { members: [{ name: ' Ana ', age: '30' }] } },
        buildFields(groupArrayInFieldsetSchema),
      );

      expect(parsed).toEqual({ team: { members: [{ name: 'Ana', age: 30 }] } });
    });
  });

  describe('read-only fields', () => {
    it('replaces a stale value with the default computed from the current values', async () => {
      const form = createHeadlessForm(readOnlySchema as $TSFixMe, {});
      const values = { first_day: '2', second_day: '15' };

      await form.handleValidation(values);

      expect(
        await parseJSFToValidate(values, form.fields as $TSFixMe[], {
          isPartialValidation: false,
        }),
      ).toEqual({ first_day: '2', second_day: '16' });
    });

    it('replaces a stale value inside a grouped fieldset', async () => {
      const groupedReadOnlySchema = {
        type: 'object',
        additionalProperties: false,
        properties: {
          settings: {
            title: 'Settings',
            type: 'object',
            additionalProperties: false,
            'x-jsf-presentation': { inputType: 'fieldset' },
            properties: {
              first_day: readOnlySchema.properties.first_day,
              second_day: readOnlySchema.properties.second_day,
            },
          },
        },
        'x-jsf-logic': {
          computedValues: {
            second_day_value: {
              rule: { cat: [{ '+': [{ var: 'settings.first_day' }, 14] }] },
            },
          },
        },
        'x-rmt-meta': { jsfVersion: '1' },
      };
      const form = createHeadlessForm(groupedReadOnlySchema as $TSFixMe, {});
      const values = { settings: { first_day: '2', second_day: '15' } };

      await form.handleValidation(values);

      expect(
        await parseJSFToValidate(values, form.fields as $TSFixMe[], {
          isPartialValidation: false,
        }),
      ).toEqual({ settings: { first_day: '2', second_day: '16' } });
    });
  });
});
