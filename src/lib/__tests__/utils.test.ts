import { JSFFields } from '@/src/types/remoteFlows';
import {
  formatCurrency,
  getNestedValue,
  prettifyFormValues,
  sanitizeHtml,
  sanitizeHtmlWithImageErrorHandling,
} from '../utils';

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

  describe('sanitizeHtmlWithImageErrorHandling', () => {
    it('should add onerror handler to image tags', () => {
      const html = '<img src="test.jpg" alt="Test image">';
      const result = sanitizeHtmlWithImageErrorHandling(html);

      expect(result).toContain('onerror="this.style.display=\'none\'"');
      expect(result).toContain('src="test.jpg"');
      expect(result).toContain('alt="Test image"');
    });

    it('should add onerror handler to multiple images', () => {
      const html = `
        <img src="image1.jpg" alt="Image 1">
        <p>Some text</p>
        <img src="image2.jpg" alt="Image 2">
      `;
      const result = sanitizeHtmlWithImageErrorHandling(html);

      // Count occurrences of onerror handler
      const matches = result.match(/onerror="this\.style\.display='none'"/g);
      expect(matches).toHaveLength(2);
    });

    it('should replace existing malicious onerror handlers', () => {
      const maliciousHtml = '<img src="x" onerror="alert(\'XSS\')">';
      const result = sanitizeHtmlWithImageErrorHandling(maliciousHtml);

      expect(result).toContain('onerror="this.style.display=\'none\'"');
      expect(result).not.toContain('alert');
      expect(result).not.toContain('XSS');
    });

    it('should still sanitize dangerous scripts', () => {
      const html =
        '<script>alert("xss")</script><img src="test.jpg"><p>Safe content</p>';
      const result = sanitizeHtmlWithImageErrorHandling(html);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert("xss")');
      expect(result).toContain('<img');
      expect(result).toContain('<p>Safe content</p>');
    });

    it('should preserve other image attributes', () => {
      const html =
        '<img src="test.jpg" alt="Test" width="100" height="200" class="image-class">';
      const result = sanitizeHtmlWithImageErrorHandling(html);

      expect(result).toContain('src="test.jpg"');
      expect(result).toContain('alt="Test"');
      expect(result).toContain('width="100"');
      expect(result).toContain('height="200"');
      expect(result).toContain('class="image-class"');
      expect(result).toContain('onerror="this.style.display=\'none\'"');
    });

    it('should handle HTML with images and external links', () => {
      const html = `
        <a href="https://example.com">External Link</a>
        <img src="test.jpg" alt="Test">
        <a href="#internal">Internal Link</a>
      `;
      const result = sanitizeHtmlWithImageErrorHandling(html);

      // Check image has onerror
      expect(result).toContain('onerror="this.style.display=\'none\'"');

      // Check external link has security attributes (from global hook)
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');

      // Check internal link doesn't have target="_blank"
      const internalLinkMatch = result.match(/<a href="#internal"[^>]*>/);
      expect(internalLinkMatch).toBeTruthy();
      expect(internalLinkMatch![0]).not.toContain('target="_blank"');
    });
  });

  describe('prettifyFormValues', () => {
    it('returns empty object when fields is undefined', () => {
      const values = { name: 'John' };
      expect(prettifyFormValues(values, undefined)).toEqual({});
    });

    it('handles undefined values', () => {
      const values = { name: undefined };
      const fields: JSFFields = [{ name: 'name', type: 'text', label: 'Name' }];
      expect(prettifyFormValues(values, fields)).toEqual({});
    });

    it('handles basic text field', () => {
      const values = { name: 'John' };
      const fields: JSFFields = [{ name: 'name', type: 'text', label: 'Name' }];
      expect(prettifyFormValues(values, fields)).toEqual({
        name: { prettyValue: 'John', label: 'Name', inputType: 'text' },
      });
    });

    it('handles radio field', () => {
      const values = { gender: 'male' };
      const fields: JSFFields = [
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
      const fields: JSFFields = [
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
      const fields: JSFFields = [
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
      const fields: JSFFields = [
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
      const fields: JSFFields = [
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
      const fields: JSFFields = [
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
      const fields: JSFFields = [
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
      const fields: JSFFields = [
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

  describe('formatCurrency', () => {
    it('should return "-" for undefined or null amount', () => {
      expect(formatCurrency(null)).toBe('-');
      expect(formatCurrency(undefined)).toBe('-');
    });

    it('should format amount in EUR by default', () => {
      expect(formatCurrency(5000)).toBe('€50.00');
    });

    it('should format amount in specified currency', () => {
      expect(formatCurrency(10000, 'USD')).toBe('$100.00');
    });

    it('should format amount with currency code', () => {
      expect(formatCurrency(10000, 'ARS')).toBe('ARS\u00A0100.00');
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });
  });

  describe('getNestedValue', () => {
    it('should get simple property', () => {
      const obj = { name: 'John', age: 30 };
      expect(getNestedValue(obj, 'name')).toBe('John');
      expect(getNestedValue(obj, 'age')).toBe(30);
    });

    it('should get nested property', () => {
      const obj = { user: { name: 'John', address: { city: 'Boston' } } };
      expect(getNestedValue(obj, 'user.name')).toBe('John');
      expect(getNestedValue(obj, 'user.address.city')).toBe('Boston');
    });

    it('should preserve null values', () => {
      const obj = { firstName: 'John', middleName: null, lastName: 'Doe' };
      expect(getNestedValue(obj, 'middleName')).toBe(null);
    });

    it('should return undefined for missing properties', () => {
      const obj = { name: 'John' };
      expect(getNestedValue(obj, 'age')).toBe(undefined);
      expect(getNestedValue(obj, 'user.address')).toBe(undefined);
    });

    it('should return defaultValue only when property is undefined', () => {
      const obj = { name: 'John', middleName: null };
      expect(getNestedValue(obj, 'age', 'default')).toBe('default');
      expect(getNestedValue(obj, 'middleName', 'default')).toBe(null);
    });

    it('should handle null/undefined object', () => {
      expect(getNestedValue(null, 'name', 'default')).toBe('default');
      expect(getNestedValue(undefined, 'name', 'default')).toBe('default');
    });

    it('should handle empty path', () => {
      const obj = { name: 'John' };
      expect(getNestedValue(obj, '', 'default')).toBe('default');
    });

    it('should return defaultValue when path traversal fails', () => {
      const obj = { user: null };
      expect(getNestedValue(obj, 'user.name', 'default')).toBe('default');
    });

    it('should handle arrays in path', () => {
      const obj = { users: [{ name: 'John' }, { name: 'Jane' }] };
      expect(getNestedValue(obj, 'users')).toEqual([
        { name: 'John' },
        { name: 'Jane' },
      ]);
    });
  });
});
