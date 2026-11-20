import {
  baselineModel,
  expectedBaselines,
  resolvePinnedVersion,
  uncoveredHiringModels,
} from './pinned-versions';

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

describe('baselineModel', () => {
  it('leaves the default model and unseeded countries without a model', () => {
    expect(baselineModel('CZE', 'cze_consulting')).toBeUndefined();
    expect(baselineModel('CZE', null)).toBeUndefined();
    expect(baselineModel('ZZZ', 'cze_tea')).toBeUndefined();
  });

  it('names a model other than the default one', () => {
    expect(baselineModel('CZE', 'cze_tea')).toBe('cze_tea');
  });
});

describe('uncoveredHiringModels', () => {
  it('lists the pinned models the seeded one leaves out', () => {
    expect(uncoveredHiringModels('CZE', 'cze_tea')).toEqual(['cze_consulting']);
    expect(uncoveredHiringModels('CZE', null)).toEqual(['cze_tea']);
  });

  it('is empty for a country whose pin is not keyed by model', () => {
    expect(uncoveredHiringModels('ZZZ', 'cze_tea')).toEqual([]);
  });
});

describe('expectedBaselines', () => {
  it('expects one baseline per pinned model', () => {
    expect(expectedBaselines('CZE', 1)).toEqual([
      { model: undefined, version: 7 },
      { model: 'cze_tea', version: 1 },
    ]);
  });

  it('expects one baseline for a country without a model-keyed pin', () => {
    expect(expectedBaselines('ZZZ', 3)).toEqual([{ version: 3 }]);
  });
});
