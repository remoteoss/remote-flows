import { isContractorOfRecord, selectEmployment } from './employment';

describe('isContractorOfRecord', () => {
  const employmentWith = (contractorType?: 'standard' | 'cor' | 'plus') =>
    ({
      id: 'emp-1',
      contractor_type: contractorType,
    }) as unknown as ReturnType<typeof selectEmployment>;

  it('is true for a Contractor of Record', () => {
    expect(isContractorOfRecord(employmentWith('cor'))).toBe(true);
  });

  it.each(['standard', 'plus', undefined] as const)(
    'is false when the contractor type is %s',
    (contractorType) => {
      expect(isContractorOfRecord(employmentWith(contractorType))).toBe(false);
    },
  );

  it('is false while the employment has not loaded', () => {
    expect(isContractorOfRecord(undefined)).toBe(false);
  });
});

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
