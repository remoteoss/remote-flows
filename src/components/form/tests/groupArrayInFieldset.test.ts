import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { iterateFormErrors } from '@/src/components/form/validationResolver';
import { $TSFixMe } from '@/src/types/remoteFlows';

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    team: {
      title: 'Team',
      type: 'object',
      additionalProperties: false,
      'x-jsf-presentation': { inputType: 'fieldset' },
      properties: {
        members: {
          title: 'Members',
          type: 'array',
          minItems: 1,
          'x-jsf-presentation': { inputType: 'group-array' },
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'age'],
            properties: {
              name: {
                title: 'Name',
                type: 'string',
                minLength: 1,
                'x-jsf-presentation': { inputType: 'text' },
              },
              age: {
                title: 'Age',
                type: 'integer',
                minimum: 18,
                'x-jsf-presentation': { inputType: 'number' },
              },
            },
            'x-jsf-order': ['name', 'age'],
          },
        },
      },
      'x-jsf-order': ['members'],
    },
  },
  required: ['team'],
  'x-jsf-order': ['team'],
  'x-rmt-meta': { jsfVersion: '1' },
};

const buildFields = (values: Record<string, unknown> = {}) =>
  createHeadlessForm(schema as $TSFixMe, values).fields as $TSFixMe[];

describe('a group-array inside an object fieldset', () => {
  it('seeds the rows the minimum asks for, as an array', () => {
    expect(getInitialValues(buildFields(), {})).toEqual({
      team: { members: [{ name: '', age: '' }] },
    });
  });

  it('turns saved rows into form values', () => {
    const saved = {
      team: {
        members: [
          { name: 'Ana', age: 30 },
          { name: 'Bo', age: 41 },
        ],
      },
    };

    expect(getInitialValues(buildFields(saved), saved)).toEqual(saved);
  });

  it('parses the rows under the fieldset', async () => {
    const parsed = await parseJSFToValidate(
      { team: { members: [{ name: ' Ana ', age: '30' }] } },
      buildFields(),
    );

    expect(parsed).toEqual({ team: { members: [{ name: 'Ana', age: 30 }] } });
  });

  it('keys a row error by its path through the fieldset', async () => {
    const form = createHeadlessForm(schema as $TSFixMe, {});
    const parsed = await parseJSFToValidate(
      {
        team: {
          members: [
            { name: 'Ana', age: '30' },
            { name: 'Bo', age: '9' },
          ],
        },
      },
      form.fields as $TSFixMe[],
    );

    const result = await form.handleValidation(parsed);

    expect(Object.keys(iterateFormErrors(result?.formErrors))).toEqual([
      'team.members.1.age',
      'team.members.1.age.value',
    ]);
  });
});
