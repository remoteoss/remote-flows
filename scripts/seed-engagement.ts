import { fillSchema } from './fill-schema';

type FormSchema = Record<string, unknown>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
    readonly headers: Record<string, string>,
  ) {
    super(message);
  }
}

const TOLERATED_ENGAGEMENT_STATUSES = [404, 422];

const isFormNotAvailable = (err: ApiError) =>
  err.status === 422 &&
  (err.body as { message?: string } | undefined)?.message ===
    'Form not available for requested country';

export type EngagementStepResult = 'submitted' | 'skipped' | 'tolerated';

interface EngagementStepOptions {
  country: string;
  employmentId: string;
  fetchSchema: (form: string) => Promise<FormSchema>;
  submit: (urlPath: string, body: unknown) => Promise<unknown>;
}

export async function runEngagementStep({
  country,
  employmentId,
  fetchSchema,
  submit,
}: EngagementStepOptions): Promise<EngagementStepResult> {
  let engagementSchema: FormSchema;
  try {
    engagementSchema = await fetchSchema('engagement_agreement_details');
  } catch (err) {
    if (
      err instanceof ApiError &&
      (err.status === 404 || isFormNotAvailable(err))
    ) {
      console.log(
        `No engagement_agreement_details schema for ${country} - skipping.`,
      );
      return 'skipped';
    }
    throw err;
  }

  if (
    Object.keys((engagementSchema as { properties?: object }).properties || {})
      .length === 0
  ) {
    return 'skipped';
  }

  const { values: engagementDetails, skipped } = fillSchema(engagementSchema);
  console.log(
    'engagement_agreement_details payload:',
    JSON.stringify(engagementDetails, null, 2),
  );
  if (skipped.length) {
    console.log('Skipped (unfillable) fields:', skipped.join(', '));
  }

  try {
    await submit(
      `/v2/employments/${employmentId}/engagement-agreement-details`,
      { engagement_agreement_details: engagementDetails },
    );
  } catch (err) {
    if (
      err instanceof ApiError &&
      TOLERATED_ENGAGEMENT_STATUSES.includes(err.status)
    ) {
      console.warn(
        `Tolerated ${err.status} on engagement_agreement_details (${err.message}) - continuing.`,
      );
      if (err.body) {
        console.warn(
          typeof err.body === 'string'
            ? err.body
            : JSON.stringify(err.body, null, 2),
        );
      }
      return 'tolerated';
    }
    throw err;
  }
  console.log('engagement_agreement_details submitted.');
  return 'submitted';
}
