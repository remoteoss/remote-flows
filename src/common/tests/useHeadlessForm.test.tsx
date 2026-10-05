import { renderHook, waitFor } from '@testing-library/react';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import { JSFModify } from '@/src/flows/types';
import {
  basicInformationSchemaV3Portugal,
  contractDetailsSchemaV1Portugal,
} from '@/src/flows/Onboarding/tests/fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';

const { 'x-rmt-meta': _meta, ...schema } = contractDetailsSchemaV1Portugal.data;

const findField = (fields: $TSFixMe[] | undefined, name: string) =>
  fields?.find((field) => field.name === name);

const isVisible = (fields: $TSFixMe[] | undefined, name: string) =>
  findField(fields, name)?.isVisible;

const renamedBonus = (title: string): JSFModify => ({
  fields: { signing_bonus_amount: { title } },
});

describe('useHeadlessForm buildOnce', () => {
  it('hands out the form only once its visibility matches the values', async () => {
    const { result } = renderHook(() =>
      useHeadlessForm({
        schema,
        values: { has_signing_bonus: 'yes' },
        strategy: 'buildOnce',
      }),
    );

    expect(result.current.form).toBeNull();
    expect(result.current.isBuilding).toBe(true);

    await waitFor(() => expect(result.current.form).not.toBeNull());
    expect(result.current.isBuilding).toBe(false);
    expect(isVisible(result.current.form?.fields, 'signing_bonus_amount')).toBe(
      true,
    );
  });

  it('keeps the resolved form while a changed jsfModify rebuilds, then replays the latest values into the new one', async () => {
    const { result, rerender } = renderHook(
      ({ jsfModify }) =>
        useHeadlessForm({
          schema,
          values: { has_signing_bonus: 'yes' },
          options: { jsfModify },
          strategy: 'buildOnce',
        }),
      { initialProps: { jsfModify: renamedBonus('Bonus') } },
    );
    await waitFor(() => expect(result.current.form).not.toBeNull());
    const replacedForm = result.current.form;

    rerender({ jsfModify: renamedBonus('Welcome bonus') });

    expect(result.current.form).toBe(replacedForm);
    expect(result.current.isBuilding).toBe(false);
    await waitFor(() => expect(result.current.form).not.toBe(replacedForm));
    const rebuiltFields = result.current.form?.fields;
    expect(findField(rebuiltFields, 'signing_bonus_amount')?.label).toBe(
      'Welcome bonus',
    );
    expect(isVisible(rebuiltFields, 'signing_bonus_amount')).toBe(true);
  });

  it('stops handing out the previous form when the schema changes', async () => {
    const { 'x-rmt-meta': _basicMeta, ...otherSchema } =
      basicInformationSchemaV3Portugal.data;
    const { result, rerender } = renderHook(
      ({ currentSchema }) =>
        useHeadlessForm({
          schema: currentSchema,
          values: {},
          strategy: 'buildOnce',
        }),
      { initialProps: { currentSchema: schema as Record<string, unknown> } },
    );
    await waitFor(() => expect(result.current.form).not.toBeNull());

    rerender({ currentSchema: otherSchema });

    expect(result.current.form).toBeNull();
    expect(result.current.isBuilding).toBe(true);
    await waitFor(() =>
      expect(
        findField(result.current.form?.fields, 'has_seniority_date'),
      ).toBeDefined(),
    );
  });

  it('keeps the form when options are recreated with the same content on every render', async () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useHeadlessForm({
        schema,
        values: { has_signing_bonus: 'yes' },
        options: {
          jsfModify: {
            fields: { signing_bonus_amount: { title: 'Bonus' } },
          },
        },
        strategy: 'buildOnce',
      });
    });

    await waitFor(() => expect(result.current.form).not.toBeNull());
    const builtForm = result.current.form;
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.form).toBe(builtForm);
    expect(renders).toBeLessThan(5);
  });
});
