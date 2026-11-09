import { selectEmployment } from './employment';

describe('selectEmployment', () => {
  it('returns the employment from the response', () => {
    const response = {
      data: { data: { employment: { id: 'emp-1', contractor_type: 'cor' } } },
    } as unknown as Parameters<typeof selectEmployment>[0];

    expect(selectEmployment(response)).toEqual({
      id: 'emp-1',
      contractor_type: 'cor',
    });
  });

  it('returns undefined when the request failed', () => {
    const response = {
      data: undefined,
      error: { message: 'Not found' },
    } as unknown as Parameters<typeof selectEmployment>[0];

    expect(selectEmployment(response)).toBeUndefined();
  });
});
