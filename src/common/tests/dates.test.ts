import { getYearMonthDate } from '../dates';

describe('getYearMonthDate', () => {
  it('should return formatted year, month, and day', () => {
    const result = getYearMonthDate(new Date(2025, 10, 17)); // November 17, 2025

    expect(result).toEqual({
      year: 2025,
      month: '11',
      day: '17',
    });
  });

  it('should return formatted year, month, and day with leading zeros', () => {
    const result = getYearMonthDate(new Date(2025, 0, 1)); // January 1, 2025

    expect(result).toEqual({
      year: 2025,
      month: '01',
      day: '01',
    });
  });
});
