import { selectMagicLinkUrl } from './magicLink';

describe('selectMagicLinkUrl', () => {
  it('returns the login url', () => {
    expect(
      selectMagicLinkUrl({
        data: { url: 'https://remote.com/login?token=abc' },
      }),
    ).toBe('https://remote.com/login?token=abc');
  });

  it('returns undefined when there is no response', () => {
    expect(selectMagicLinkUrl(undefined)).toBeUndefined();
  });
});
