import { ApiError, runEngagementStep } from './seed-engagement';

const engagementSchema = {
  type: 'object',
  properties: {
    agreement_type: { type: 'string', title: 'Agreement type' },
  },
  required: ['agreement_type'],
};

const apiError = (status: number) =>
  new ApiError(
    `POST /v2/employments/emp-1/engagement-agreement-details -> ${status}`,
    status,
    { message: 'nope' },
    {},
  );

describe('seed-onboarding', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  const run = (submit: (urlPath: string, body: unknown) => Promise<unknown>) =>
    runEngagementStep({
      country: 'CZE',
      employmentId: 'emp-1',
      fetchSchema: async () => engagementSchema,
      submit,
    });

  it.each([422, 404])(
    'continues when engagement returns %i',
    async (status) => {
      const submit = vi.fn(async () => {
        throw apiError(status);
      });

      await expect(run(submit)).resolves.toBe('tolerated');
      expect(warnSpy).toHaveBeenCalledWith(
        `Tolerated ${status} on engagement_agreement_details (POST /v2/employments/emp-1/engagement-agreement-details -> ${status}) - continuing.`,
      );
    },
  );

  it('skips when the schema fetch says the form is not available for the country', async () => {
    const submit = vi.fn();

    await expect(
      runEngagementStep({
        country: 'CZE',
        employmentId: 'emp-1',
        fetchSchema: async () => {
          throw new ApiError(
            'GET /v1/countries/CZE/engagement_agreement_details -> 422',
            422,
            { message: 'Form not available for requested country' },
            {},
          );
        },
        submit,
      }),
    ).resolves.toBe('skipped');
    expect(submit).not.toHaveBeenCalled();
  });

  it('fails when the engagement schema fetch returns 422', async () => {
    const error = apiError(422);
    const submit = vi.fn();

    await expect(
      runEngagementStep({
        country: 'CZE',
        employmentId: 'emp-1',
        fetchSchema: async () => {
          throw error;
        },
        submit,
      }),
    ).rejects.toBe(error);
    expect(submit).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('rethrows a non-API failure such as a network error', async () => {
    const error = new TypeError('fetch failed');

    await expect(
      run(async () => {
        throw error;
      }),
    ).rejects.toBe(error);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('fails on non-tolerated engagement status', async () => {
    for (const status of [500, 401]) {
      const error = apiError(status);

      await expect(
        run(async () => {
          throw error;
        }),
      ).rejects.toBe(error);
    }
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('engagement success path unchanged', async () => {
    const submit = vi.fn(async () => ({ data: {} }));

    await expect(run(submit)).resolves.toBe('submitted');
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(
      '/v2/employments/emp-1/engagement-agreement-details',
      { engagement_agreement_details: { agreement_type: expect.any(String) } },
    );
    expect(logSpy).toHaveBeenCalledWith(
      'engagement_agreement_details submitted.',
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('skips when the country has no engagement schema', async () => {
    const submit = vi.fn();
    const result = await runEngagementStep({
      country: 'CZE',
      employmentId: 'emp-1',
      fetchSchema: async () => {
        throw apiError(404);
      },
      submit,
    });

    expect(result).toBe('skipped');
    expect(submit).not.toHaveBeenCalled();
  });
});
