import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
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

    it('leaves a blank value out of its row so it reads as missing', async () => {
      const parsed = await parseJSFToValidate(
        { items: [{ description: 'Design work', amount: '' }] },
        buildFields(),
      );

      expect(parsed).toEqual({ items: [{ description: 'Design work' }] });
    });
  });
});
