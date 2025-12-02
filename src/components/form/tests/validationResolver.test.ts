import { iterateFormErrors } from '@/src/components/form/validationResolver';

describe('iterateFormErrors', () => {
  it('should flatten nested object errors from json-schema-form validation', () => {
    // This mimics errors returned by @remoteoss/remote-json-schema-form-kit
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
});
