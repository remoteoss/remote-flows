import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { iterateFormErrors } from '@/src/components/form/validationResolver';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { groupArrayInFieldsetSchema as schema } from './fixtures';

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
