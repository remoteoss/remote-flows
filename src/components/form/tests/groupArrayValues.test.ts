import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
  getBlankRowValues,
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      title: 'Items',
      type: 'array',
      minItems: 1,
      maxItems: 3,
      'x-jsf-presentation': { inputType: 'group-array' },
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['description', 'amount'],
        properties: {
          description: {
            title: 'Description',
            type: 'string',
            minLength: 1,
            'x-jsf-presentation': { inputType: 'text' },
          },
          amount: {
            title: 'Amount',
            type: 'integer',
            minimum: 1,
            'x-jsf-presentation': { inputType: 'money' },
          },
        },
        'x-jsf-order': ['description', 'amount'],
      },
    },
  },
  required: ['items'],
  'x-jsf-order': ['items'],
  'x-rmt-meta': { jsfVersion: '1' },
};

const buildFields = (values: Record<string, unknown> = {}) =>
  createHeadlessForm(schema as $TSFixMe, values).fields as $TSFixMe[];

describe('group-array values', () => {
  describe('getInitialValues', () => {
    it('seeds as many blank rows as the minimum asks for', () => {
      expect(getInitialValues(buildFields(), {})).toEqual({
        items: [{ description: '', amount: '' }],
      });
    });

    it('turns saved rows into form values, converting money from cents', () => {
      const saved = {
        items: [
          { description: 'Design work', amount: 250000 },
          { description: 'Hosting', amount: 7550 },
        ],
      };

      expect(getInitialValues(buildFields(saved), saved)).toEqual({
        items: [
          { description: 'Design work', amount: 2500 },
          { description: 'Hosting', amount: 75.5 },
        ],
      });
    });
  });

  describe('parseJSFToValidate', () => {
    it('converts each row to API units and keeps the rows in order', async () => {
      const parsed = await parseJSFToValidate(
        {
          items: [
            { description: 'Design work', amount: '2500' },
            { description: ' Hosting ', amount: '19.99' },
          ],
        },
        buildFields(),
      );

      expect(parsed).toEqual({
        items: [
          { description: 'Design work', amount: 250000 },
          { description: 'Hosting', amount: 1999 },
        ],
      });
    });
  });

  describe('multiple selects', () => {
    const tagsField = {
      name: 'tags',
      type: 'select',
      multiple: true,
    };

    it('seeds an empty array, not a string, in a blank row', () => {
      expect(
        getBlankRowValues([tagsField, { name: 'note', type: 'text' }]),
      ).toEqual({ tags: [], note: '' });
    });

    it('seeds an empty array for rows created from the minimum', () => {
      const group = {
        name: 'items',
        type: 'group-array',
        minItems: 1,
        fields: [tagsField],
      };

      expect(getInitialValues([group] as $TSFixMe, {})).toEqual({
        items: [{ tags: [] }],
      });
    });
  });
});
