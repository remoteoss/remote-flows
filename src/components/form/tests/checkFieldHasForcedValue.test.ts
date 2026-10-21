import { checkFieldHasForcedValue } from '@/src/components/form/utils';

describe('checkFieldHasForcedValue', () => {
  it('treats a computed NaN const equal to its default as forced', () => {
    expect(
      checkFieldHasForcedValue({ type: 'number', const: NaN, default: NaN }),
    ).toBe(true);
  });

  it('treats equal object consts as forced', () => {
    expect(
      checkFieldHasForcedValue({
        type: 'text',
        const: { a: 1 },
        default: { a: 1 },
      }),
    ).toBe(true);
  });

  it('does not treat a const that differs from its default as forced', () => {
    expect(
      checkFieldHasForcedValue({ type: 'number', const: 1, default: 2 }),
    ).toBe(false);
  });

  it('does not treat a field without a const as forced', () => {
    expect(checkFieldHasForcedValue({ type: 'number', default: NaN })).toBe(
      false,
    );
  });

  it('does not treat checkbox fields as forced', () => {
    expect(
      checkFieldHasForcedValue({
        type: 'checkbox',
        const: true,
        default: true,
      }),
    ).toBe(false);
  });
});
