import { getForcedValue } from '@/src/components/form/utils';

describe('getForcedValue', () => {
  it('converts a money const from cents to the major units kept in the form', () => {
    expect(getForcedValue({ type: 'money', const: 81257 })).toBe(812.57);
  });

  it('returns the const unchanged for other field types', () => {
    expect(getForcedValue({ type: 'number', const: 40 })).toBe(40);
    expect(getForcedValue({ type: 'text', const: 'acknowledged' })).toBe(
      'acknowledged',
    );
  });
});
