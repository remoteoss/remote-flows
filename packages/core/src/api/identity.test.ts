import { selectIdentity, selectUserId } from './identity';

describe('identity selectors', () => {
  const response = (data: unknown) =>
    ({ data: { data } }) as unknown as Parameters<typeof selectIdentity>[0];

  it('returns the entities behind the token', () => {
    const identity = { company: { id: 'company-1' }, user: { id: 'user-1' } };

    expect(selectIdentity(response(identity))).toEqual(identity);
  });

  it('returns the user id when the token has a user', () => {
    expect(
      selectUserId(
        response({ company: { id: 'company-1' }, user: { id: 'user-1' } }),
      ),
    ).toBe('user-1');
  });

  it('has no user id for a token without a user', () => {
    expect(
      selectUserId(response({ company: { id: 'company-1' } })),
    ).toBeUndefined();
  });

  it('has no user id when the request failed', () => {
    expect(
      selectUserId({
        data: undefined,
        error: { message: 'Unauthorized' },
      } as unknown as Parameters<typeof selectUserId>[0]),
    ).toBeUndefined();
  });
});
