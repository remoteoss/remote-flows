import { compareRawSchema, describeRawStatus, serializeRawSchema } from './raw';

describe('raw schema baselines', () => {
  it('serializes with sorted keys at every depth and keeps array order', () => {
    const serialized = serializeRawSchema({
      b: 1,
      a: { d: [{ z: 1, y: 2 }, 'x'], c: null },
    });

    expect(serialized).toBe(
      `${JSON.stringify(
        { a: { c: null, d: [{ y: 2, z: 1 }, 'x'] }, b: 1 },
        null,
        2,
      )}\n`,
    );
  });

  it('reports a missing baseline', () => {
    expect(compareRawSchema(undefined, { a: 1 })).toBe('missing');
  });

  it('ignores key order when comparing', () => {
    expect(
      compareRawSchema(
        { a: 1, b: { c: 2, d: 3 } },
        { b: { d: 3, c: 2 }, a: 1 },
      ),
    ).toBe('unchanged');
  });

  it('detects a changed value', () => {
    expect(compareRawSchema({ a: [1, 2] }, { a: [2, 1] })).toBe('changed');
  });

  it('blames the library when the fingerprint changed but the raw schema did not', () => {
    expect(describeRawStatus('unchanged', true)).toContain(
      'how this library builds the form',
    );
  });

  it('blames the backend when both changed', () => {
    expect(describeRawStatus('changed', true)).toContain(
      'the backend changed this version',
    );
  });

  it('stays silent when nothing changed', () => {
    expect(describeRawStatus('unchanged', false)).toBeUndefined();
  });
});
