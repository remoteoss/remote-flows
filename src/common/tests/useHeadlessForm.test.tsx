import { renderHook, waitFor } from '@testing-library/react';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import { JSFModify } from '@/src/flows/types';
import { contractDetailsSchemaV1Portugal } from '@/src/flows/Onboarding/tests/fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';

const { 'x-rmt-meta': _meta, ...schema } = contractDetailsSchemaV1Portugal.data;

const isVisible = (fields: $TSFixMe[] | undefined, name: string) =>
  fields?.find((field) => field.name === name)?.isVisible;

const renamedBonus = (title: string): JSFModify => ({
  fields: { signing_bonus_amount: { title } },
});

describe('useHeadlessForm buildOnce', () => {
  it('replays the latest values into a rebuilt form and leaves the replaced one untouched', async () => {
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
    const replacedForm = result.current.form;

    rerender({ jsfModify: renamedBonus('Welcome bonus') });

    await waitFor(() =>
      expect(
        isVisible(result.current.form?.fields, 'signing_bonus_amount'),
      ).toBe(true),
    );
    expect(result.current.form).not.toBe(replacedForm);
    expect(isVisible(replacedForm?.fields, 'signing_bonus_amount')).toBe(false);
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
    const builtForm = result.current.form;

    await waitFor(() =>
      expect(
        isVisible(result.current.form?.fields, 'signing_bonus_amount'),
      ).toBe(true),
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.form).toBe(builtForm);
    expect(renders).toBeLessThan(5);
  });
});
