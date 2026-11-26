import { selectMagicLinkUrl } from './magicLink';

describe('selectMagicLinkUrl', () => {
  it('returns the url from the response', () => {
    const response = {
      data: { data: { url: 'https://remote.com/magic/abc' } },
    } as unknown as Parameters<typeof selectMagicLinkUrl>[0];

    expect(selectMagicLinkUrl(response)).toBe('https://remote.com/magic/abc');
  });

  it('returns undefined when the request failed', () => {
    const response = {
      data: undefined,
      error: { message: 'Forbidden' },
    } as unknown as Parameters<typeof selectMagicLinkUrl>[0];

    expect(selectMagicLinkUrl(response)).toBeUndefined();
  });
});
