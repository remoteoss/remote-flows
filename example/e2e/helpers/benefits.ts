import { Page, test } from '@playwright/test';
import { fillRadio, fillSelect } from './general';

type JsfOption = { value: unknown; label: string };

type JsfField = {
  name: string;
  type?: string;
  inputType?: string;
  isVisible?: boolean;
  deprecated?: boolean;
  options?: JsfOption[];
  fields?: JsfField[];
};

type CreateHeadlessForm = (
  schema: Record<string, unknown>,
  options?: { initialValues?: Record<string, unknown> },
) => { fields: JsfField[] };

let createHeadlessFormFn: CreateHeadlessForm | undefined;

async function getCreateHeadlessForm(): Promise<CreateHeadlessForm> {
  if (!createHeadlessFormFn) {
    // @remoteoss/remote-json-schema-form-kit is ESM-only; this file compiles to CommonJS.
    const mod = await import('@remoteoss/remote-json-schema-form-kit');
    createHeadlessFormFn =
      mod.createHeadlessForm as unknown as CreateHeadlessForm;
  }
  return createHeadlessFormFn;
}

/**
 * Registers a listener for the Benefits step's schema response. Call this BEFORE triggering the
 * step transition that will request it (e.g. before submitting Contract Details) — Playwright
 * only observes responses that happen after the listener is registered.
 */
export function watchForBenefitsSchema(
  page: Page,
): Promise<Record<string, unknown>> {
  return page
    .waitForResponse((response) =>
      /\/benefit-offers\/schema(\?|$)/.test(response.url()),
    )
    .then((response) => response.json())
    .then((body) => (body?.data?.schema ?? {}) as Record<string, unknown>);
}

type CollectedField = {
  key: string;
  inputType: string;
  options: JsfOption[];
};

/** Walks the fields returned by createHeadlessForm, mirroring the name-joining rule the real
 * form components use (FieldSetField / JSONSchemaFormFields): nested under a fieldset's own
 * name, unless the fieldset is `fieldset-flat`, whose children are named at the root. */
function collectFillableFields(
  fields: JsfField[] | undefined,
  prefix: string,
): CollectedField[] {
  const result: CollectedField[] = [];

  for (const field of fields ?? []) {
    if (field.isVisible === false || field.deprecated) continue;

    const inputType = field.type ?? field.inputType ?? '';
    const key = prefix ? `${prefix}.${field.name}` : field.name;

    if (inputType === 'fieldset') {
      result.push(...collectFillableFields(field.fields, key));
    } else if (inputType === 'fieldset-flat') {
      result.push(...collectFillableFields(field.fields, ''));
    } else if (inputType === 'radio' || inputType === 'select') {
      result.push({ key, inputType, options: field.options ?? [] });
    }
  }

  return result;
}

const MAX_ITERATIONS = 20;

/**
 * Fills the Benefits step generically instead of hardcoding a country's benefit-group UUIDs
 * (as the Spain-only helper does): re-derives the visible fields from the intercepted schema via
 * the same createHeadlessForm engine the app uses, picks each radio/select's first option, and
 * repeats — since some fields (e.g. a benefit's "value") only become visible once a sibling
 * field, like "filter", has a value.
 */
export async function fillOnboardingBenefitsStepDynamically(
  page: Page,
  schemaPromise: Promise<Record<string, unknown>>,
): Promise<void> {
  const isLocked = await page.getByText('Locked Benefit').first().isVisible();

  if (!isLocked) {
    const schema = await schemaPromise;
    const createHeadlessForm = await getCreateHeadlessForm();

    const values: Record<string, unknown> = {};
    const skipped = new Set<string>();

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const { fields } = createHeadlessForm(schema, { initialValues: values });
      const pending = collectFillableFields(fields, '').filter(
        (field) => !(field.key in values) && !skipped.has(field.key),
      );

      if (pending.length === 0) break;

      for (const field of pending) {
        if (field.options.length === 0) {
          skipped.add(field.key);
          test.info().annotations.push({
            type: 'benefits-field-skipped',
            description: `${field.key} (${field.inputType}) has no options; left unfilled.`,
          });
          continue;
        }

        const [choice] = field.options;

        if (field.inputType === 'radio') {
          await fillRadio(page, String(choice.value), field.key);
        } else {
          await fillSelect(page, choice.label, field.key);
        }

        values[field.key] = choice.value;
      }
    }
  }

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}
