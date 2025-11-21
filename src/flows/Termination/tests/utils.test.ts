<<<<<<< HEAD
import { addDays, addHours, endOfMonth, setDate, subDays } from 'date-fns';

import {
  calculateMinTerminationDate,
  calculateProposedTerminationDateStatement,
} from '../utils';
import { PayrollCalendarEor } from '@/src/client';

describe('Termination utils', () => {
  describe('calculateMinTerminationDate', () => {
    const mockMonthlyCalendars: PayrollCalendarEor = {
      id: 'c7ed2966-869f-49a2-bfce-51ebc0c9213d',
      country: {
        code: 'NLD',
        name: 'Netherlands',
        alpha_2_code: 'NL',
      },
      cycles: [
        {
          payment_date: '2025-01-24',
          start_date: '2025-01-01',
          end_date: '2025-01-31',
          employee_inclusion_cutoff_date: '2025-01-31',
          input_cutoff_date: '2025-01-14',
        },
        {
          payment_date: '2025-02-25',
          start_date: '2025-02-01',
          end_date: '2025-02-28',
          employee_inclusion_cutoff_date: '2025-02-28',
          input_cutoff_date: '2025-02-13',
        },
        {
          payment_date: '2025-03-25',
          start_date: '2025-03-01',
          end_date: '2025-03-31',
          employee_inclusion_cutoff_date: '2025-03-31',
          input_cutoff_date: '2025-03-13',
        },
        {
          payment_date: '2025-04-25',
          start_date: '2025-04-01',
          end_date: '2025-04-30',
          employee_inclusion_cutoff_date: '2025-04-30',
          input_cutoff_date: '2025-04-15',
        },
        {
          payment_date: '2025-05-23',
          start_date: '2025-05-01',
          end_date: '2025-05-31',
          employee_inclusion_cutoff_date: '2025-05-31',
          input_cutoff_date: '2025-05-13',
        },
        {
          payment_date: '2025-06-25',
          start_date: '2025-06-01',
          end_date: '2025-06-30',
          employee_inclusion_cutoff_date: '2025-06-30',
          input_cutoff_date: '2025-06-13',
        },
        {
          payment_date: '2025-07-25',
          start_date: '2025-07-01',
          end_date: '2025-07-31',
          employee_inclusion_cutoff_date: '2025-07-31',
          input_cutoff_date: '2025-07-15',
        },
        {
          payment_date: '2025-08-25',
          start_date: '2025-08-01',
          end_date: '2025-08-31',
          employee_inclusion_cutoff_date: '2025-08-31',
          input_cutoff_date: '2025-08-13',
        },
        {
          payment_date: '2025-09-25',
          start_date: '2025-09-01',
          end_date: '2025-09-30',
          employee_inclusion_cutoff_date: '2025-09-30',
          input_cutoff_date: '2025-09-15',
        },
        {
          payment_date: '2025-10-24',
          start_date: '2025-10-01',
          end_date: '2025-10-31',
          employee_inclusion_cutoff_date: '2025-10-31',
          input_cutoff_date: '2025-10-14',
        },
        {
          payment_date: '2025-11-25',
          start_date: '2025-11-01',
          end_date: '2025-11-30',
          employee_inclusion_cutoff_date: '2025-11-30',
          input_cutoff_date: '2025-11-13',
        },
        {
          payment_date: '2025-12-25',
          start_date: '2025-12-01',
          end_date: '2025-12-31',
          employee_inclusion_cutoff_date: '2025-12-31',
          input_cutoff_date: '2025-12-15',
        },
      ],
      cycle_frequency: 'monthly',
    };

    const mockBiMonthlyCalendars: PayrollCalendarEor = {
      id: '9215222d-5c35-4a46-8ce0-6dd4013a83f6',
      country: {
        code: 'USA',
        name: 'United States',
        alpha_2_code: 'US',
      },
      cycles: [
        {
          payment_date: '2025-01-15',
          start_date: '2025-01-01',
          end_date: '2025-01-15',
          employee_inclusion_cutoff_date: '2025-01-15',
          input_cutoff_date: '2025-01-03',
        },
        {
          payment_date: '2025-01-31',
          start_date: '2025-01-16',
          end_date: '2025-01-31',
          employee_inclusion_cutoff_date: '2025-01-31',
          input_cutoff_date: '2025-01-21',
        },
        {
          payment_date: '2025-02-14',
          start_date: '2025-02-01',
          end_date: '2025-02-15',
          employee_inclusion_cutoff_date: '2025-02-15',
          input_cutoff_date: '2025-02-04',
        },
        {
          payment_date: '2025-02-28',
          start_date: '2025-02-16',
          end_date: '2025-02-28',
          employee_inclusion_cutoff_date: '2025-02-28',
          input_cutoff_date: '2025-02-18',
        },
        {
          payment_date: '2025-03-14',
          start_date: '2025-03-01',
          end_date: '2025-03-15',
          employee_inclusion_cutoff_date: '2025-03-15',
          input_cutoff_date: '2025-03-04',
        },
        {
          payment_date: '2025-03-31',
          start_date: '2025-03-16',
          end_date: '2025-03-31',
          employee_inclusion_cutoff_date: '2025-03-31',
          input_cutoff_date: '2025-03-19',
        },
        {
          payment_date: '2025-04-15',
          start_date: '2025-04-01',
          end_date: '2025-04-15',
          employee_inclusion_cutoff_date: '2025-04-15',
          input_cutoff_date: '2025-04-03',
        },
        {
          payment_date: '2025-04-30',
          start_date: '2025-04-16',
          end_date: '2025-04-30',
          employee_inclusion_cutoff_date: '2025-04-30',
          input_cutoff_date: '2025-04-18',
        },
        {
          payment_date: '2025-05-15',
          start_date: '2025-05-01',
          end_date: '2025-05-15',
          employee_inclusion_cutoff_date: '2025-05-15',
          input_cutoff_date: '2025-05-05',
        },
        {
          payment_date: '2025-05-30',
          start_date: '2025-05-16',
          end_date: '2025-05-31',
          employee_inclusion_cutoff_date: '2025-05-31',
          input_cutoff_date: '2025-05-20',
        },
        {
          payment_date: '2025-06-13',
          start_date: '2025-06-01',
          end_date: '2025-06-15',
          employee_inclusion_cutoff_date: '2025-06-15',
          input_cutoff_date: '2025-06-03',
        },
        {
          payment_date: '2025-06-30',
          start_date: '2025-06-16',
          end_date: '2025-06-30',
          employee_inclusion_cutoff_date: '2025-06-30',
          input_cutoff_date: '2025-06-18',
        },
        {
          payment_date: '2025-07-15',
          start_date: '2025-07-01',
          end_date: '2025-07-15',
          employee_inclusion_cutoff_date: '2025-07-15',
          input_cutoff_date: '2025-07-03',
        },
        {
          payment_date: '2025-07-31',
          start_date: '2025-07-16',
          end_date: '2025-07-31',
          employee_inclusion_cutoff_date: '2025-07-31',
          input_cutoff_date: '2025-07-21',
        },
        {
          payment_date: '2025-08-15',
          start_date: '2025-08-01',
          end_date: '2025-08-15',
          employee_inclusion_cutoff_date: '2025-08-15',
          input_cutoff_date: '2025-08-05',
        },
        {
          payment_date: '2025-08-29',
          start_date: '2025-08-16',
          end_date: '2025-08-31',
          employee_inclusion_cutoff_date: '2025-08-31',
          input_cutoff_date: '2025-08-19',
        },
        {
          payment_date: '2025-09-15',
          start_date: '2025-09-01',
          end_date: '2025-09-15',
          employee_inclusion_cutoff_date: '2025-09-15',
          input_cutoff_date: '2025-09-03',
        },
        {
          payment_date: '2025-09-30',
          start_date: '2025-09-16',
          end_date: '2025-09-30',
          employee_inclusion_cutoff_date: '2025-09-30',
          input_cutoff_date: '2025-09-18',
        },
        {
          payment_date: '2025-10-15',
          start_date: '2025-10-01',
          end_date: '2025-10-15',
          employee_inclusion_cutoff_date: '2025-10-15',
          input_cutoff_date: '2025-10-03',
        },
        {
          payment_date: '2025-10-31',
          start_date: '2025-10-16',
          end_date: '2025-10-31',
          employee_inclusion_cutoff_date: '2025-10-31',
          input_cutoff_date: '2025-10-21',
        },
        {
          payment_date: '2025-11-14',
          start_date: '2025-11-01',
          end_date: '2025-11-15',
          employee_inclusion_cutoff_date: '2025-11-15',
          input_cutoff_date: '2025-11-04',
        },
        {
          payment_date: '2025-11-28',
          start_date: '2025-11-16',
          end_date: '2025-11-30',
          employee_inclusion_cutoff_date: '2025-11-30',
          input_cutoff_date: '2025-11-18',
        },
        {
          payment_date: '2025-12-15',
          start_date: '2025-12-01',
          end_date: '2025-12-15',
          employee_inclusion_cutoff_date: '2025-12-15',
          input_cutoff_date: '2025-12-03',
        },
        {
          payment_date: '2025-12-31',
          start_date: '2025-12-16',
          end_date: '2025-12-31',
          employee_inclusion_cutoff_date: '2025-12-31',
          input_cutoff_date: '2025-12-19',
        },
      ],
      cycle_frequency: 'bi_monthly',
    };
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns today if no payroll calendars', () => {
      vi.setSystemTime(new Date('2025-11-20'));
      expect(calculateMinTerminationDate(undefined)).toEqual(
        new Date('2025-11-20'),
      );
    });

    it('returns today if no payroll cycles', () => {
      vi.setSystemTime(new Date('2025-11-20'));
      expect(
        calculateMinTerminationDate({ ...mockMonthlyCalendars, cycles: [] }),
      ).toEqual(new Date('2025-11-20'));
    });

    it('returns today if pay frequency is not supported', () => {
      vi.setSystemTime(new Date('2025-11-20'));
      expect(
        calculateMinTerminationDate({
          ...mockMonthlyCalendars,
          cycle_frequency: 'weekly',
        }),
      ).toEqual(new Date('2025-11-20'));
    });

    describe('monthly payroll', () => {
      it('returns today if today is before cutoff date', () => {
        vi.setSystemTime(new Date('2025-11-03'));
        expect(calculateMinTerminationDate(mockMonthlyCalendars)).toEqual(
          new Date('2025-11-03'),
        );
      });

      it('returns end of month if today is after cutoff date', () => {
        vi.setSystemTime(new Date('2025-11-14'));
        expect(calculateMinTerminationDate(mockMonthlyCalendars)).toEqual(
          endOfMonth(new Date('2025-11-14')),
        );
      });
    });

    describe('bi-monthly payroll', () => {
      it('returns mid-month if today is between first cutoff date and 15th', () => {
        vi.setSystemTime(new Date('2025-11-06'));
        expect(calculateMinTerminationDate(mockBiMonthlyCalendars)).toEqual(
          setDate(new Date('2025-11-06'), 15),
        );
      });

      it('returns end of month if today is after second cutoff date', () => {
        vi.setSystemTime(new Date('2025-11-21'));
        expect(calculateMinTerminationDate(mockBiMonthlyCalendars)).toEqual(
          endOfMonth(new Date('2025-11-21')),
        );
      });

      it('returns today if today is between 15th and second cutoff date', () => {
        vi.setSystemTime(new Date('2025-11-15'));
        expect(calculateMinTerminationDate(mockBiMonthlyCalendars)).toEqual(
          new Date('2025-11-15'),
        );
      });

      it('returns today if today is before first cutoff date', () => {
        vi.setSystemTime(new Date('2025-11-04'));
        expect(calculateMinTerminationDate(mockBiMonthlyCalendars)).toEqual(
          new Date('2025-11-04'),
        );
      });
    });
  });

  describe('calculateProposedTerminationDateStatement', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return null when selected date is more than 30 days away', () => {
      vi.setSystemTime(new Date('2025-11-20'));
      const futureDate = addDays(new Date('2025-11-20'), 31);

      const result = calculateProposedTerminationDateStatement({
        minTerminationDate: new Date('2025-11-20'),
        isEmployeeInProbationPeriod: false,
        selectedDate: futureDate,
      });

      expect(result).toBeNull();
    });

    it('should return null when no selected date and cutoff has not passed', () => {
      vi.setSystemTime(new Date('2025-11-20'));
      const pastMinDate = subDays(new Date('2025-11-20'), 5);

      const result = calculateProposedTerminationDateStatement({
        minTerminationDate: pastMinDate,
        isEmployeeInProbationPeriod: false,
      });

      expect(result).toBeNull();
    });

    it('should return info statement when cutoff passed and employee not in probation', () => {
      vi.setSystemTime(new Date('2025-11-20'));
      const futureMinDate = addDays(new Date('2025-11-20'), 5);

      const result = calculateProposedTerminationDateStatement({
        minTerminationDate: futureMinDate,
        isEmployeeInProbationPeriod: false,
      });

      expect(result).toEqual({
        statement: {
          title: undefined,
          description: expect.stringContaining(
            'next available termination dates',
          ),
          severity: 'info',
        },
      });
    });

    it('should return info statement when cutoff passed and employee in probation', () => {
      vi.setSystemTime(new Date('2025-11-20'));
      const futureMinDate = addDays(new Date('2025-11-20'), 5);

      const result = calculateProposedTerminationDateStatement({
        minTerminationDate: futureMinDate,
        isEmployeeInProbationPeriod: true,
      });

      expect(result).toEqual({
        statement: {
          title: undefined,
          description: expect.stringContaining('cut-off has passed'),
          severity: 'info',
        },
      });
    });

    it('should return warning when termination is within 48 hours', () => {
      vi.setSystemTime(new Date('2025-11-20T10:00:00'));
      const soonDate = addHours(new Date('2025-11-20T10:00:00'), 24); // 24 hours away

      const result = calculateProposedTerminationDateStatement({
        minTerminationDate: new Date('2025-11-20'),
        isEmployeeInProbationPeriod: false,
        selectedDate: soonDate,
      });

      expect(result).toEqual({
        statement: {
          title: undefined,
          description: expect.stringContaining('less than 48 hours'),
          severity: 'info',
        },
      });
    });

    it('should return general info when no other conditions apply', () => {
      vi.setSystemTime(new Date('2025-11-20'));
      const selectedDate = addDays(new Date('2025-11-20'), 10);

      const result = calculateProposedTerminationDateStatement({
        minTerminationDate: new Date('2025-11-20'),
        isEmployeeInProbationPeriod: false,
        selectedDate,
      });

      expect(result).toEqual({
        statement: {
          title: undefined,
          description: expect.stringContaining('depend on payroll cutoffs'),
          severity: 'info',
        },
      });
    });
=======
import { endOfMonth, setDate } from 'date-fns';

import { calculateMinTerminationDate } from '../utils';
import { PayrollCalendarEor } from '@/src/client';

const mockMonthlyCalendars: PayrollCalendarEor = {
  id: 'c7ed2966-869f-49a2-bfce-51ebc0c9213d',
  country: {
    code: 'NLD',
    name: 'Netherlands',
    alpha_2_code: 'NL',
  },
  cycles: [
    {
      payment_date: '2025-01-24',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      employee_inclusion_cutoff_date: '2025-01-31',
      input_cutoff_date: '2025-01-14',
    },
    {
      payment_date: '2025-02-25',
      start_date: '2025-02-01',
      end_date: '2025-02-28',
      employee_inclusion_cutoff_date: '2025-02-28',
      input_cutoff_date: '2025-02-13',
    },
    {
      payment_date: '2025-03-25',
      start_date: '2025-03-01',
      end_date: '2025-03-31',
      employee_inclusion_cutoff_date: '2025-03-31',
      input_cutoff_date: '2025-03-13',
    },
    {
      payment_date: '2025-04-25',
      start_date: '2025-04-01',
      end_date: '2025-04-30',
      employee_inclusion_cutoff_date: '2025-04-30',
      input_cutoff_date: '2025-04-15',
    },
    {
      payment_date: '2025-05-23',
      start_date: '2025-05-01',
      end_date: '2025-05-31',
      employee_inclusion_cutoff_date: '2025-05-31',
      input_cutoff_date: '2025-05-13',
    },
    {
      payment_date: '2025-06-25',
      start_date: '2025-06-01',
      end_date: '2025-06-30',
      employee_inclusion_cutoff_date: '2025-06-30',
      input_cutoff_date: '2025-06-13',
    },
    {
      payment_date: '2025-07-25',
      start_date: '2025-07-01',
      end_date: '2025-07-31',
      employee_inclusion_cutoff_date: '2025-07-31',
      input_cutoff_date: '2025-07-15',
    },
    {
      payment_date: '2025-08-25',
      start_date: '2025-08-01',
      end_date: '2025-08-31',
      employee_inclusion_cutoff_date: '2025-08-31',
      input_cutoff_date: '2025-08-13',
    },
    {
      payment_date: '2025-09-25',
      start_date: '2025-09-01',
      end_date: '2025-09-30',
      employee_inclusion_cutoff_date: '2025-09-30',
      input_cutoff_date: '2025-09-15',
    },
    {
      payment_date: '2025-10-24',
      start_date: '2025-10-01',
      end_date: '2025-10-31',
      employee_inclusion_cutoff_date: '2025-10-31',
      input_cutoff_date: '2025-10-14',
    },
    {
      payment_date: '2025-11-25',
      start_date: '2025-11-01',
      end_date: '2025-11-30',
      employee_inclusion_cutoff_date: '2025-11-30',
      input_cutoff_date: '2025-11-13',
    },
    {
      payment_date: '2025-12-25',
      start_date: '2025-12-01',
      end_date: '2025-12-31',
      employee_inclusion_cutoff_date: '2025-12-31',
      input_cutoff_date: '2025-12-15',
    },
  ],
  cycle_frequency: 'monthly',
};

const mockBiMonthlyCalendars: PayrollCalendarEor = {
  id: '9215222d-5c35-4a46-8ce0-6dd4013a83f6',
  country: {
    code: 'USA',
    name: 'United States',
    alpha_2_code: 'US',
  },
  cycles: [
    {
      payment_date: '2025-01-15',
      start_date: '2025-01-01',
      end_date: '2025-01-15',
      employee_inclusion_cutoff_date: '2025-01-15',
      input_cutoff_date: '2025-01-03',
    },
    {
      payment_date: '2025-01-31',
      start_date: '2025-01-16',
      end_date: '2025-01-31',
      employee_inclusion_cutoff_date: '2025-01-31',
      input_cutoff_date: '2025-01-21',
    },
    {
      payment_date: '2025-02-14',
      start_date: '2025-02-01',
      end_date: '2025-02-15',
      employee_inclusion_cutoff_date: '2025-02-15',
      input_cutoff_date: '2025-02-04',
    },
    {
      payment_date: '2025-02-28',
      start_date: '2025-02-16',
      end_date: '2025-02-28',
      employee_inclusion_cutoff_date: '2025-02-28',
      input_cutoff_date: '2025-02-18',
    },
    {
      payment_date: '2025-03-14',
      start_date: '2025-03-01',
      end_date: '2025-03-15',
      employee_inclusion_cutoff_date: '2025-03-15',
      input_cutoff_date: '2025-03-04',
    },
    {
      payment_date: '2025-03-31',
      start_date: '2025-03-16',
      end_date: '2025-03-31',
      employee_inclusion_cutoff_date: '2025-03-31',
      input_cutoff_date: '2025-03-19',
    },
    {
      payment_date: '2025-04-15',
      start_date: '2025-04-01',
      end_date: '2025-04-15',
      employee_inclusion_cutoff_date: '2025-04-15',
      input_cutoff_date: '2025-04-03',
    },
    {
      payment_date: '2025-04-30',
      start_date: '2025-04-16',
      end_date: '2025-04-30',
      employee_inclusion_cutoff_date: '2025-04-30',
      input_cutoff_date: '2025-04-18',
    },
    {
      payment_date: '2025-05-15',
      start_date: '2025-05-01',
      end_date: '2025-05-15',
      employee_inclusion_cutoff_date: '2025-05-15',
      input_cutoff_date: '2025-05-05',
    },
    {
      payment_date: '2025-05-30',
      start_date: '2025-05-16',
      end_date: '2025-05-31',
      employee_inclusion_cutoff_date: '2025-05-31',
      input_cutoff_date: '2025-05-20',
    },
    {
      payment_date: '2025-06-13',
      start_date: '2025-06-01',
      end_date: '2025-06-15',
      employee_inclusion_cutoff_date: '2025-06-15',
      input_cutoff_date: '2025-06-03',
    },
    {
      payment_date: '2025-06-30',
      start_date: '2025-06-16',
      end_date: '2025-06-30',
      employee_inclusion_cutoff_date: '2025-06-30',
      input_cutoff_date: '2025-06-18',
    },
    {
      payment_date: '2025-07-15',
      start_date: '2025-07-01',
      end_date: '2025-07-15',
      employee_inclusion_cutoff_date: '2025-07-15',
      input_cutoff_date: '2025-07-03',
    },
    {
      payment_date: '2025-07-31',
      start_date: '2025-07-16',
      end_date: '2025-07-31',
      employee_inclusion_cutoff_date: '2025-07-31',
      input_cutoff_date: '2025-07-21',
    },
    {
      payment_date: '2025-08-15',
      start_date: '2025-08-01',
      end_date: '2025-08-15',
      employee_inclusion_cutoff_date: '2025-08-15',
      input_cutoff_date: '2025-08-05',
    },
    {
      payment_date: '2025-08-29',
      start_date: '2025-08-16',
      end_date: '2025-08-31',
      employee_inclusion_cutoff_date: '2025-08-31',
      input_cutoff_date: '2025-08-19',
    },
    {
      payment_date: '2025-09-15',
      start_date: '2025-09-01',
      end_date: '2025-09-15',
      employee_inclusion_cutoff_date: '2025-09-15',
      input_cutoff_date: '2025-09-03',
    },
    {
      payment_date: '2025-09-30',
      start_date: '2025-09-16',
      end_date: '2025-09-30',
      employee_inclusion_cutoff_date: '2025-09-30',
      input_cutoff_date: '2025-09-18',
    },
    {
      payment_date: '2025-10-15',
      start_date: '2025-10-01',
      end_date: '2025-10-15',
      employee_inclusion_cutoff_date: '2025-10-15',
      input_cutoff_date: '2025-10-03',
    },
    {
      payment_date: '2025-10-31',
      start_date: '2025-10-16',
      end_date: '2025-10-31',
      employee_inclusion_cutoff_date: '2025-10-31',
      input_cutoff_date: '2025-10-21',
    },
    {
      payment_date: '2025-11-14',
      start_date: '2025-11-01',
      end_date: '2025-11-15',
      employee_inclusion_cutoff_date: '2025-11-15',
      input_cutoff_date: '2025-11-04',
    },
    {
      payment_date: '2025-11-28',
      start_date: '2025-11-16',
      end_date: '2025-11-30',
      employee_inclusion_cutoff_date: '2025-11-30',
      input_cutoff_date: '2025-11-18',
    },
    {
      payment_date: '2025-12-15',
      start_date: '2025-12-01',
      end_date: '2025-12-15',
      employee_inclusion_cutoff_date: '2025-12-15',
      input_cutoff_date: '2025-12-03',
    },
    {
      payment_date: '2025-12-31',
      start_date: '2025-12-16',
      end_date: '2025-12-31',
      employee_inclusion_cutoff_date: '2025-12-31',
      input_cutoff_date: '2025-12-19',
    },
  ],
  cycle_frequency: 'bi_monthly',
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('returns today if no payroll calendars', () => {
  vi.setSystemTime(new Date('2025-11-20'));
  expect(calculateMinTerminationDate(undefined)).toEqual(
    new Date('2025-11-20'),
  );
});

it('returns today if no payroll cycles', () => {
  vi.setSystemTime(new Date('2025-11-20'));
  expect(
    calculateMinTerminationDate({ ...mockMonthlyCalendars, cycles: [] }),
  ).toEqual(new Date('2025-11-20'));
});

it('returns today if pay frequency is not supported', () => {
  vi.setSystemTime(new Date('2025-11-20'));
  expect(
    calculateMinTerminationDate({
      ...mockMonthlyCalendars,
      cycle_frequency: 'weekly',
    }),
  ).toEqual(new Date('2025-11-20'));
});

describe('monthly payroll', () => {
  it('returns today if today is before cutoff date', () => {
    vi.setSystemTime(new Date('2025-11-03'));
    expect(calculateMinTerminationDate(mockMonthlyCalendars)).toEqual(
      new Date('2025-11-03'),
    );
  });

  it('returns end of month if today is after cutoff date', () => {
    vi.setSystemTime(new Date('2025-11-14'));
    expect(calculateMinTerminationDate(mockMonthlyCalendars)).toEqual(
      endOfMonth(new Date('2025-11-14')),
    );
  });
});

describe('bi-monthly payroll', () => {
  it('returns mid-month if today is between first cutoff date and 15th', () => {
    vi.setSystemTime(new Date('2025-11-06'));
    expect(calculateMinTerminationDate(mockBiMonthlyCalendars)).toEqual(
      setDate(new Date('2025-11-06'), 15),
    );
  });

  it('returns end of month if today is after second cutoff date', () => {
    vi.setSystemTime(new Date('2025-11-21'));
    expect(calculateMinTerminationDate(mockBiMonthlyCalendars)).toEqual(
      endOfMonth(new Date('2025-11-21')),
    );
  });

  it('returns today if today is between 15th and second cutoff date', () => {
    vi.setSystemTime(new Date('2025-11-15'));
    expect(calculateMinTerminationDate(mockBiMonthlyCalendars)).toEqual(
      new Date('2025-11-15'),
    );
  });

  it('returns today if today is before first cutoff date', () => {
    vi.setSystemTime(new Date('2025-11-04'));
    expect(calculateMinTerminationDate(mockBiMonthlyCalendars)).toEqual(
      new Date('2025-11-04'),
    );
>>>>>>> main
  });
});
