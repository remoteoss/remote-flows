import { iterateFormErrors } from '@/src/components/form/validationResolver';

describe('iterateFormErrors', () => {
  it('should flatten nested object errors from json-schema-form validation', () => {
    const formErrors = {
      hobong_salary_details: {
        meal_allowance: 'Required field',
        overtime_allowance: 'Must be positive',
      },
    };

    const result = iterateFormErrors(formErrors);

    expect(result['hobong_salary_details.meal_allowance']).toEqual({
      type: 'validation',
      message: 'Required field',
    });
    expect(result['hobong_salary_details.overtime_allowance']).toEqual({
      type: 'validation',
      message: 'Must be positive',
    });
  });

  it('should handle simple string errors', () => {
    const formErrors = {
      name: 'Required field',
    };
    const result = iterateFormErrors(formErrors);
    expect(result['name']).toEqual({
      type: 'validation',
      message: 'Required field',
    });
  });

  it('should key an error on a row of a group-array by its position', () => {
    const result = iterateFormErrors({
      items: [
        null,
        { description: 'Required field', amount: 'Must be positive' },
      ],
    });

    expect(result['items.1.description']).toEqual({
      type: 'validation',
      message: 'Required field',
    });
    expect(result['items.1.amount']).toEqual({
      type: 'validation',
      message: 'Must be positive',
    });
    expect(result['items.0.description']).toBeUndefined();
    expect(result['items']).toBeUndefined();
  });

  it('should keep a plain array of messages on the field itself', () => {
    const result = iterateFormErrors({ files: ['Too large', 'Wrong type'] });

    expect(result['files']).toEqual({
      type: 'validation',
      message: JSON.stringify(['Too large', 'Wrong type']),
    });
  });
});
