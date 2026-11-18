import { resolvePinnedVersion } from './pinned-versions';

describe('resolvePinnedVersion', () => {
  it('pins the default model when no hiring model is given', () => {
    expect(resolvePinnedVersion('CZE', 1)).toBe(7);
  });

  it('pins each hiring model on its own', () => {
    expect(resolvePinnedVersion('CZE', 1, 'cze_consulting')).toBe(7);
    expect(resolvePinnedVersion('CZE', 5, 'cze_tea')).toBe(1);
  });

  it('returns the default version for a country without a pin', () => {
    expect(resolvePinnedVersion('ZZZ', 3)).toBe(3);
  });
});
