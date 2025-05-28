import { describe, it, expect } from 'vitest';
import { prettifyFormValues } from '../utils';
import type { Fields } from '@remoteoss/json-schema-form';

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
      name: { prettyValue: 'John', label: 'Name' },
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
      gender: { prettyValue: 'Male', label: 'Gender' },
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
      country: { prettyValue: 'United States', label: 'Country' },
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
      countries: { prettyValue: 'us,uk', label: 'Countries' },
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
        street: { prettyValue: '123 Main St', label: 'Street' },
        city: { prettyValue: 'Boston', label: 'City' },
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
          street: { prettyValue: '123 Main St', label: 'Street' },
          city: { prettyValue: 'Boston', label: 'City' },
        },
        phone: { prettyValue: '123-456-7890', label: 'Phone' },
      },
    });
  });

  it('handles unknown field types', () => {
    const values = { custom: 'value' };
    const fields: Fields = [
      { name: 'custom', type: 'unknown', label: 'Custom' },
    ];
    expect(prettifyFormValues(values, fields)).toEqual({
      custom: { prettyValue: 'value', label: 'Custom' },
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
      name: { prettyValue: 'John', label: 'Name' },
      gender: { prettyValue: 'Male', label: 'Gender' },
      countries: { prettyValue: 'us,uk', label: 'Countries' },
      address: {
        street: { prettyValue: '123 Main St', label: 'Street' },
        city: { prettyValue: 'Boston', label: 'City' },
      },
    });
  });
});
