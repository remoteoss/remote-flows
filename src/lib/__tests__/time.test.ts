import {
  formatAsDecimal,
  clampNegativeValuesIfApplicable,
} from '@/src/lib/time';

describe('time.utils', () => {
  describe('formatAsDecimal', () => {
    describe('normal cases with long format (default)', () => {
      it('should format whole days to decimal', () => {
        expect(formatAsDecimal({ days: 1, hours: 0 })).toBe('1 day');
        expect(formatAsDecimal({ days: 5, hours: 0 })).toBe('5 days');
      });

      it('should format whole hours to decimal', () => {
        expect(formatAsDecimal({ days: 0, hours: 8 })).toBe('1 day');
        expect(formatAsDecimal({ days: 0, hours: 4 })).toBe('0.5 days');
        expect(formatAsDecimal({ days: 0, hours: 2 })).toBe('0.25 days');
      });

      it('should format mixed days and hours to decimal', () => {
        expect(formatAsDecimal({ days: 1, hours: 4 })).toBe('1.5 days');
        expect(formatAsDecimal({ days: 2, hours: 2 })).toBe('2.25 days');
        expect(formatAsDecimal({ days: 3, hours: 6 })).toBe('3.75 days');
      });

      it('should handle zero values', () => {
        expect(formatAsDecimal({ days: 0, hours: 0 })).toBe('0 days');
      });
    });

    describe('short format', () => {
      it('should format with "d" suffix', () => {
        expect(formatAsDecimal({ days: 1, hours: 4 }, 'short')).toBe('1.5d');
        expect(formatAsDecimal({ days: 2, hours: 0 }, 'short')).toBe('2d');
        expect(formatAsDecimal({ days: 0, hours: 4 }, 'short')).toBe('0.5d');
      });
    });

    describe('minute-level precision formatting', () => {
      function simulateMinutes(minutes: number) {
        return minutes / 60;
      }

      it('should use days format when above 0.01 days threshold', () => {
        expect(formatAsDecimal({ days: 0, hours: simulateMinutes(15) })).toBe(
          '0.031 days',
        );

        expect(formatAsDecimal({ days: 0, hours: simulateMinutes(30) })).toBe(
          '0.063 days',
        );
      });

      it('should show very small minute values in hours format when below 0.01 days threshold', () => {
        // 0.01 days = 0.08 hours, so values below ~5 minutes should show in hours format

        expect(formatAsDecimal({ days: 0, hours: simulateMinutes(3) })).toBe(
          '0.05 hours',
        );

        expect(formatAsDecimal({ days: 0, hours: simulateMinutes(4) })).toBe(
          '0.067 hours',
        );

        expect(formatAsDecimal({ days: 0, hours: simulateMinutes(5) })).toBe(
          '0.01 days',
        );
      });

      it('should handle minute-level values with short format', () => {
        expect(
          formatAsDecimal({ days: 0, hours: simulateMinutes(3) }, 'short'),
        ).toBe('0.05h');

        expect(
          formatAsDecimal({ days: 0, hours: simulateMinutes(15) }, 'short'),
        ).toBe('0.031d');
      });
    });

    describe('decimal formatting without trailing zeros', () => {
      it('should remove trailing zeros for non-whole numbers', () => {
        expect(formatAsDecimal({ days: 1, hours: 4 })).toBe('1.5 days');
        expect(formatAsDecimal({ days: 0, hours: 2 })).toBe('0.25 days');
      });

      it('should omit decimals for whole numbers', () => {
        expect(formatAsDecimal({ days: 2, hours: 0 })).toBe('2 days');
        expect(formatAsDecimal({ days: 1, hours: 0 })).toBe('1 day');
        expect(formatAsDecimal({ days: 0, hours: 8 })).toBe('1 day'); // 8 hours = 1 day
      });
    });

    describe('negative values', () => {
      it('should format negative days', () => {
        expect(formatAsDecimal({ days: -1, hours: 0 })).toBe('-1 day');
        expect(formatAsDecimal({ days: -2, hours: 0 })).toBe('-2 days');
      });

      it('should format negative hours', () => {
        expect(formatAsDecimal({ days: 0, hours: -8 })).toBe('-1 day');
        expect(formatAsDecimal({ days: 0, hours: -4 })).toBe('-0.5 days');
        expect(formatAsDecimal({ days: 0, hours: -2 })).toBe('-0.25 days');
      });

      it('should format mixed negative days and hours', () => {
        expect(formatAsDecimal({ days: -1, hours: -4 })).toBe('-1.5 days');
        expect(formatAsDecimal({ days: -2, hours: -2 })).toBe('-2.25 days');
      });

      it('should round negative values correctly to up to 3 decimal places', () => {
        // -3 hours = -0.375 days
        expect(formatAsDecimal({ days: 0, hours: -3 })).toBe('-0.375 days');

        // -5 hours = -0.625 days
        expect(formatAsDecimal({ days: 0, hours: -5 })).toBe('-0.625 days');

        // -1 day - 3 hours = -1.375 days
        expect(formatAsDecimal({ days: -1, hours: -3 })).toBe('-1.375 days');
      });
    });

    describe('singular/plural handling', () => {
      it('should use singular for 1 day', () => {
        expect(formatAsDecimal({ days: 1, hours: 0 })).toBe('1 day');
      });

      it('should use plural for other values', () => {
        expect(formatAsDecimal({ days: 0, hours: 0 })).toBe('0 days');
        expect(formatAsDecimal({ days: 2, hours: 0 })).toBe('2 days');
        expect(formatAsDecimal({ days: 1, hours: 4 })).toBe('1.5 days');
      });

      it('should handle singular/plural for hours', () => {
        expect(formatAsDecimal({ days: 0, hours: 1 })).toBe('0.125 days');
        expect(formatAsDecimal({ days: 0, hours: 2 })).toBe('0.25 days');
      });
    });

    describe('edge cases', () => {
      it('should handle large numbers', () => {
        expect(formatAsDecimal({ days: 1000, hours: 4 })).toBe('1000.5 days');
        expect(formatAsDecimal({ days: -1000, hours: -4 })).toBe(
          '-1000.5 days',
        );
        expect(formatAsDecimal({ days: 1000, hours: 0 })).toBe('1000 days');
      });
    });
  });

  describe('clampNegativeValuesIfApplicable', () => {
    it('should clamp negative values to 0', () => {
      expect(clampNegativeValuesIfApplicable({ days: -1, hours: 0 })).toEqual({
        days: 0,
        hours: 0,
      });
      expect(clampNegativeValuesIfApplicable({ days: 0, hours: -1 })).toEqual({
        days: 0,
        hours: 0,
      });
      expect(clampNegativeValuesIfApplicable({ days: -1, hours: -1 })).toEqual({
        days: 0,
        hours: 0,
      });
    });
  });
});
