import { contractDetailsSeedsFor } from './contract-details-seeds';

describe('contractDetailsSeedsFor', () => {
  it('seeds an eligible job title for countries without their own seeds', () => {
    expect(contractDetailsSeedsFor('EGY')).toEqual({
      job_title: 'Software Engineer',
    });
  });

  it('merges the job title with the country seeds', () => {
    expect(contractDetailsSeedsFor('JAM')).toEqual({
      job_title: 'Software Engineer',
      work_hours_per_week: 40,
    });
  });
});
