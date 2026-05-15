import { describe, it, expect } from 'vitest';
import { parseJSFToValidate } from './utils';

/**
 * Tests for parseJSFToValidate - the main entry point for form value parsing.
 * This function calls parseSubmitValues -> parseFormValuesToAPI internally.
 *
 * The key fix being tested: Fields with falsy-but-valid values (0, false, '')
 * should be preserved during parsing, while null/undefined should be filtered out.
 */
describe('parseJSFToValidate', () => {
  describe('falsy values', () => {
    it('should preserve zero values', async () => {
      const formValues = {
        probation_length: 0,
        salary: 5000,
      };

      const fields = [
        { name: 'probation_length', type: 'number' },
        { name: 'salary', type: 'number' },
      ];

      const result = await parseJSFToValidate(formValues, fields, {
        isPartialValidation: false,
      });

      // This is the core fix: 0 should not be filtered out
      expect(result).toHaveProperty('probation_length', 0);
      expect(result).toHaveProperty('salary', 5000);
    });

    it('should preserve false boolean values', async () => {
      const formValues = {
        is_active: false,
        is_verified: true,
      };

      const fields = [
        { name: 'is_active', type: 'checkbox' },
        { name: 'is_verified', type: 'checkbox' },
      ];

      const result = await parseJSFToValidate(formValues, fields, {
        isPartialValidation: false,
      });

      expect(result).toHaveProperty('is_active', false);
      expect(result).toHaveProperty('is_verified', true);
    });
  });

  describe('empty value filtering', () => {
    it('should remove empty strings (by removeEmptyValues)', async () => {
      const formValues = {
        optional_note: '',
        name: 'test',
      };

      const fields = [
        { name: 'optional_note', type: 'text' },
        { name: 'name', type: 'text' },
      ];

      const result = await parseJSFToValidate(formValues, fields, {
        isPartialValidation: false,
      });

      // removeEmptyValues filters out empty strings
      expect(result).not.toHaveProperty('optional_note');
      expect(result).toHaveProperty('name', 'test');
    });

    it('should remove null and undefined values', async () => {
      const formValues = {
        name: 'test',
        nullable_field: null,
        undefined_field: undefined,
      };

      const fields = [
        { name: 'name', type: 'text' },
        { name: 'nullable_field', type: 'text' },
        { name: 'undefined_field', type: 'text' },
      ];

      const result = await parseJSFToValidate(formValues, fields, {
        isPartialValidation: false,
      });

      expect(result).toHaveProperty('name', 'test');
      // removeEmptyValues filters out null and undefined
      expect(result).not.toHaveProperty('nullable_field');
      expect(result).not.toHaveProperty('undefined_field');
    });
  });

  describe('real-world scenario', () => {
    it('should handle the original bug: computed probation_length = 0', async () => {
      const formValues = {
        probation_length_recommended: 'recommended',
        probation_length: 0, // Computed value - the bug filtered this out!
        contract_end_date: '2027-01-01',
        is_remote: false, // Also a falsy value
        annual_gross_salary: 50000,
      };

      const fields = [
        { name: 'probation_length_recommended', type: 'radio' },
        { name: 'probation_length', type: 'number' },
        { name: 'contract_end_date', type: 'date' },
        { name: 'is_remote', type: 'checkbox' },
        { name: 'annual_gross_salary', type: 'number' },
      ];

      const result = await parseJSFToValidate(formValues, fields, {
        isPartialValidation: false,
      });

      // All falsy-but-valid values should be preserved
      expect(result).toHaveProperty('probation_length', 0);
      expect(result).toHaveProperty('is_remote', false);
      expect(result).toHaveProperty(
        'probation_length_recommended',
        'recommended',
      );
      expect(result).toHaveProperty('contract_end_date', '2027-01-01');
      expect(result).toHaveProperty('annual_gross_salary', 50000);
    });
  });
});
