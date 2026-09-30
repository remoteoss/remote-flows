import { renderHook, waitFor } from '@testing-library/react';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import { contractDetailsSchemaV1Portugal } from '@/src/flows/Onboarding/tests/fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';

const { 'x-rmt-meta': _meta, ...schema } = contractDetailsSchemaV1Portugal.data;

const isVisible = (fields: $TSFixMe[] | undefined, name: string) =>
  fields?.find((field) => field.name === name)?.isVisible;

describe('useHeadlessForm buildOnce', () => {
  it('replays the latest values into a rebuilt form and leaves the replaced one untouched', async () => {
    const { result, rerender } = renderHook(
      ({ options }) =>
        useHeadlessForm({
          schema,
          values: { has_signing_bonus: 'yes' },
          options,
          strategy: 'buildOnce',
        }),
      { initialProps: { options: { jsfModify: {} } } },
    );
    const replacedForm = result.current.form;

    rerender({ options: { jsfModify: {} } });

    await waitFor(() =>
      expect(
        isVisible(result.current.form?.fields, 'signing_bonus_amount'),
      ).toBe(true),
    );
    expect(result.current.form).not.toBe(replacedForm);
    expect(isVisible(replacedForm?.fields, 'signing_bonus_amount')).toBe(false);
  });
});
