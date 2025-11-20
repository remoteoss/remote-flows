export const PAYROLL_CYCLES = {
  MONTHLY: 'monthly',
  SEMI_MONTHLY: 'bi_monthly', // this inconsistency is intentional, due to legacy misnomer in the backend
  BI_WEEKLY: 'bi_weekly',
} as const;
