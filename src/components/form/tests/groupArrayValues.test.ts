import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
  getBlankRowValues,
  getInitialValues,
} from '@/src/components/form/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { groupArraySchema as schema } from './fixtures';

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
