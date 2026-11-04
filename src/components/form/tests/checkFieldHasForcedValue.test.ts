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

  describe('read-only cases', () => {
    it('keeps the input of a read-only field that has an inputType', () => {
      expect(
        checkFieldHasForcedValue({
          type: 'select',
          inputType: 'select',
          readOnly: true,
          const: '15',
          default: '15',
        }),
      ).toBe(false);
    });

    it('still treats a read-only field without an inputType as forced', () => {
      expect(
        checkFieldHasForcedValue({
          type: 'text',
          readOnly: true,
          const: 'a',
          default: 'a',
        }),
      ).toBe(true);
    });

    it('still treats a forced field that is not read-only as forced', () => {
      expect(
        checkFieldHasForcedValue({
          type: 'select',
          inputType: 'select',
          const: '15',
          default: '15',
        }),
      ).toBe(true);
    });
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
