import { selectIdentity } from './identity';

describe('selectIdentity', () => {
  it('returns the identity from the response', () => {
    const response = {
      data: { data: { user: { id: 'user-1' } } },
    } as unknown as Parameters<typeof selectIdentity>[0];

    expect(selectIdentity(response)).toEqual({ user: { id: 'user-1' } });
  });

  it('returns undefined when the request failed', () => {
    const response = {
      data: undefined,
      error: { message: 'Unauthorized' },
    } as unknown as Parameters<typeof selectIdentity>[0];

    expect(selectIdentity(response)).toBeUndefined();
  });
});
