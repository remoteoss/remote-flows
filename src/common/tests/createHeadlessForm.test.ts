import {
  createHeadlessForm,
  setJsfEngineFallback,
} from '../createHeadlessForm';

// The v0 engine attaches a yup schema to each field; the v1 engine does not.
const isV0Field = (field: unknown) =>
  (field as { schema?: unknown }).schema !== undefined;

const schemaWithoutMeta = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name',
      'x-jsf-presentation': { inputType: 'text' },
    },
  },
  required: ['name'],
};

describe('createHeadlessForm', () => {
  afterEach(() => {
    setJsfEngineFallback();
  });

  it('should run schemas without x-rmt-meta on the v0 engine by default', () => {
    const form = createHeadlessForm(schemaWithoutMeta);

    expect(isV0Field(form.fields[0])).toBe(true);
  });

  it('should run schemas without x-rmt-meta on the v1 engine when the fallback is v1', () => {
    setJsfEngineFallback('v1');

    const form = createHeadlessForm(schemaWithoutMeta);

    expect(isV0Field(form.fields[0])).toBe(false);
  });

  it('should respect a declared jsfVersion over the fallback', () => {
    const form = createHeadlessForm({
      ...schemaWithoutMeta,
      'x-rmt-meta': { jsfVersion: '1' },
    });

    expect(isV0Field(form.fields[0])).toBe(false);
  });

  it('should respect a declared jsfOldVersion when the fallback is v1', () => {
    setJsfEngineFallback('v1');

    const form = createHeadlessForm({
      ...schemaWithoutMeta,
      'x-rmt-meta': { jsfOldVersion: true },
    });

    expect(isV0Field(form.fields[0])).toBe(true);
  });
});
