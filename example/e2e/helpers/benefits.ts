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
export async function watchForBenefitsSchema(
  page: Page,
): Promise<Record<string, unknown>> {
  const response = await page.waitForResponse((response) =>
    /\/benefit-offers\/schema(\?|$)/.test(response.url()),
  );

  if (!response.ok()) {
    throw new Error(
      `Fetching the benefit-offers schema failed with status ${response.status()}`,
    );
  }

  const body = await response.json();
  return (body?.data?.schema ?? {}) as Record<string, unknown>;
}

type CollectedField = {
  /** Dot-joined, matches the `data-field` attribute the form renders (DOM lookup only). */
  domKey: string;
  /** Segments for writing into the nested `initialValues` object the schema engine reads. */
  valuePath: string[];
  inputType: string;
  options: JsfOption[];
};

/** Walks the fields returned by createHeadlessForm, mirroring the name-joining rule the real
 * form components use (FieldSetField / JSONSchemaFormFields): nested under a fieldset's own
 * name, unless the fieldset is `fieldset-flat`, whose children are named at the root.
 *
 * `domKey` and `valuePath` describe the same nesting but serve different consumers: the DOM only
 * understands the dot-joined string form (`data-field="uuid.filter"`), while createHeadlessForm's
 * conditional (if/then) evaluation reads a real nested object (`{ uuid: { filter: ... } }`) —
 * feeding it a flat object keyed by the dotted string instead leaves siblings unresolved and
 * conditionally-revealed fields (e.g. "value" after "filter") never appear. */
function collectFillableFields(
  fields: JsfField[] | undefined,
  domPrefix: string,
  valuePath: string[],
): CollectedField[] {
  const result: CollectedField[] = [];

  for (const field of fields ?? []) {
    if (field.isVisible === false || field.deprecated) continue;

    const inputType = field.type ?? field.inputType ?? '';
    const domKey = domPrefix ? `${domPrefix}.${field.name}` : field.name;

    if (inputType === 'fieldset') {
      result.push(
        ...collectFillableFields(field.fields, domKey, [
          ...valuePath,
          field.name,
        ]),
      );
    } else if (inputType === 'fieldset-flat') {
      result.push(...collectFillableFields(field.fields, '', []));
    } else if (inputType === 'radio' || inputType === 'select') {
      result.push({
        domKey,
        valuePath: [...valuePath, field.name],
        inputType,
        options: field.options ?? [],
      });
    }
  }

  return result;
}

function setNestedValue(
  target: Record<string, unknown>,
  path: string[],
  value: unknown,
): void {
  let cursor = target;

  for (const segment of path.slice(0, -1)) {
    const existing = cursor[segment];
    if (typeof existing !== 'object' || existing === null) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }

  cursor[path[path.length - 1]] = value;
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
    const handled = new Set<string>();

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const { fields } = createHeadlessForm(schema, { initialValues: values });
      const pending = collectFillableFields(fields, '', []).filter(
        (field) => !handled.has(field.domKey),
      );

      if (pending.length === 0) break;

      for (const field of pending) {
        handled.add(field.domKey);

        if (field.options.length === 0) {
          test.info().annotations.push({
            type: 'benefits-field-skipped',
            description: `${field.domKey} (${field.inputType}) has no options; left unfilled.`,
          });
          continue;
        }

        const [choice] = field.options;

        if (field.inputType === 'radio') {
          await fillRadio(page, String(choice.value), field.domKey);
        } else {
          await fillSelect(page, choice.label, field.domKey);
        }

        setNestedValue(values, field.valuePath, choice.value);
      }
    }
  }

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}
