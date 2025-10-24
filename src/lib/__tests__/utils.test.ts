import { Fields } from '@remoteoss/json-schema-form';
import { prettifyFormValues, sanitizeHtml } from '../utils';

describe('utils lib', () => {
  describe('sanitizeHtml', () => {
    it('should sanitize dangerous scripts', () => {
      const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const result = sanitizeHtml(maliciousHtml);

      expect(result).toBe('<p>Safe content</p>');
      expect(result).not.toContain('<script>');
    });

    it('should preserve target attribute', () => {
      const htmlWithTarget = '<a href="#" target="_blank">Link</a>';
      const result = sanitizeHtml(htmlWithTarget);

      expect(result).toContain('target="_blank"');
    });

    it("should not add target='_blank' and rel='noopener noreferrer' to internal links", () => {
      const htmlWithExternalLink = '<a href="#hello">Link</a>';
      const result = sanitizeHtml(htmlWithExternalLink);

      expect(result).not.toContain('target="_blank"');
      expect(result).not.toContain('rel="noopener noreferrer"');
    });
  });

  describe('prettifyFormValues', () => {
    it('returns empty object when fields is undefined', () => {
      const values = { name: 'John' };
      expect(prettifyFormValues(values, undefined)).toEqual({});
    });

    it('handles undefined values', () => {
      const values = { name: undefined };
      const fields: Fields = [{ name: 'name', type: 'text', label: 'Name' }];
      expect(prettifyFormValues(values, fields)).toEqual({});
    });

    it('handles basic text field', () => {
      const values = { name: 'John' };
      const fields: Fields = [{ name: 'name', type: 'text', label: 'Name' }];
      expect(prettifyFormValues(values, fields)).toEqual({
        name: { prettyValue: 'John', label: 'Name', inputType: 'text' },
      });
    });

    it('handles radio field', () => {
      const values = { gender: 'male' };
      const fields: Fields = [
        {
          name: 'gender',
          type: 'radio',
          label: 'Gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
        },
      ];
      expect(prettifyFormValues(values, fields)).toEqual({
        gender: { prettyValue: 'Male', label: 'Gender', inputType: 'radio' },
      });
    });

    it('handles select field', () => {
      const values = { country: 'us' };
      const fields: Fields = [
        {
          name: 'country',
          type: 'select',
          label: 'Country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
          ],
        },
      ];
      expect(prettifyFormValues(values, fields)).toEqual({
        country: {
          prettyValue: 'United States',
          label: 'Country',
          inputType: 'select',
        },
      });
    });

    it('handles countries field', () => {
      const values = { countries: ['us', 'uk'] };
      const fields: Fields = [
        {
          name: 'countries',
          type: 'countries',
          label: 'Countries',
        },
      ];
      expect(prettifyFormValues(values, fields)).toEqual({
        countries: {
          prettyValue: 'us,uk',
          label: 'Countries',
          inputType: 'countries',
        },
      });
    });

    it('handles money field', () => {
      const values = { salary: 100000 };
      const fields: Fields = [
        {
          name: 'salary',
          type: 'money',
          label: 'Salary',
          currency: 'USD',
        },
      ];
      expect(prettifyFormValues(values, fields)).toEqual({
        salary: {
          prettyValue: 100000,
          label: 'Salary',
          inputType: 'money',
          currency: 'USD',
        },
      });
    });

    it('handles fieldset field', () => {
      const values = {
        address: {
          street: '123 Main St',
          city: 'Boston',
        },
      };
      const fields: Fields = [
        {
          name: 'address',
          type: 'fieldset',
          label: 'Address',
          fields: [
            { name: 'street', type: 'text', label: 'Street' },
            { name: 'city', type: 'text', label: 'City' },
          ],
        },
      ];
      expect(prettifyFormValues(values, fields)).toEqual({
        address: {
          street: {
            prettyValue: '123 Main St',
            label: 'Street',
            inputType: 'text',
          },
          city: { prettyValue: 'Boston', label: 'City', inputType: 'text' },
        },
      });
    });

    it('handles nested fieldsets', () => {
      const values = {
        contact: {
          address: {
            street: '123 Main St',
            city: 'Boston',
          },
          phone: '123-456-7890',
        },
      };
      const fields: Fields = [
        {
          name: 'contact',
          type: 'fieldset',
          label: 'Contact',
          fields: [
            {
              name: 'address',
              type: 'fieldset',
              label: 'Address',
              fields: [
                { name: 'street', type: 'text', label: 'Street' },
                { name: 'city', type: 'text', label: 'City' },
              ],
            },
            { name: 'phone', type: 'text', label: 'Phone' },
          ],
        },
      ];
      expect(prettifyFormValues(values, fields)).toEqual({
        contact: {
          address: {
            street: {
              prettyValue: '123 Main St',
              label: 'Street',
              inputType: 'text',
            },
            city: { prettyValue: 'Boston', label: 'City', inputType: 'text' },
          },
          phone: {
            prettyValue: '123-456-7890',
            label: 'Phone',
            inputType: 'text',
          },
        },
      });
    });

    it('handles unknown field types', () => {
      const values = { custom: 'value' };
      const fields: Fields = [
        { name: 'custom', type: 'unknown', label: 'Custom' },
      ];
      expect(prettifyFormValues(values, fields)).toEqual({
        custom: { prettyValue: 'value', label: 'Custom', inputType: 'unknown' },
      });
    });

    it('handles multiple fields of different types', () => {
      const values = {
        name: 'John',
        gender: 'male',
        countries: ['us', 'uk'],
        address: {
          street: '123 Main St',
          city: 'Boston',
        },
      };
      const fields: Fields = [
        { name: 'name', type: 'text', label: 'Name' },
        {
          name: 'gender',
          type: 'radio',
          label: 'Gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
        },
        {
          name: 'countries',
          type: 'countries',
          label: 'Countries',
        },
        {
          name: 'address',
          type: 'fieldset',
          label: 'Address',
          fields: [
            { name: 'street', type: 'text', label: 'Street' },
            { name: 'city', type: 'text', label: 'City' },
          ],
        },
      ];
      expect(prettifyFormValues(values, fields)).toEqual({
        name: { prettyValue: 'John', label: 'Name', inputType: 'text' },
        gender: { prettyValue: 'Male', label: 'Gender', inputType: 'radio' },
        countries: {
          prettyValue: 'us,uk',
          label: 'Countries',
          inputType: 'countries',
        },
        address: {
          street: {
            prettyValue: '123 Main St',
            label: 'Street',
            inputType: 'text',
          },
          city: { prettyValue: 'Boston', label: 'City', inputType: 'text' },
        },
      });
    });
  });
});
