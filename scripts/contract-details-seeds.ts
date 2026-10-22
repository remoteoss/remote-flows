export const CONTRACT_DETAILS_SEEDS: Record<string, Record<string, unknown>> = {
  CHN: { province_of_residency: 'SH' },
  FRA: { has_wage_portage_higher_degree: 'yes' },
  JAM: { work_hours_per_week: 40 },
  KOR: {
    work_week_schedule: {
      start_time: '09:00',
      end_time: '18:00',
      lunch_start_time: '12:00',
      lunch_end_time: '13:00',
      working_hours: 8,
    },
  },
  ROU: { compensation_currency_code: 'RON' },
};

const DEFAULT_CONTRACT_DETAILS_SEED = { job_title: 'Software Engineer' };

export function contractDetailsSeedsFor(country: string) {
  return {
    ...DEFAULT_CONTRACT_DETAILS_SEED,
    ...CONTRACT_DETAILS_SEEDS[country],
  };
}
