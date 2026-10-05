import { act, renderHook } from '@testing-library/react';
import { FieldValues } from 'react-hook-form';
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

const renderBuildOnce = (initialProps: {
  schema?: Record<string, unknown>;
  initialValues?: FieldValues;
  jsfModify?: JSFModify;
}) =>
  renderHook(
    (props) =>
      useHeadlessForm({
        schema: props.schema ?? schema,
        initialValues: props.initialValues,
        options: { jsfModify: props.jsfModify },
        strategy: 'buildOnce',
      }),
    { initialProps },
  );

describe('useHeadlessForm buildOnce', () => {
  it('resolves visibility from initialValues on the first render and keeps it', async () => {
    const { result } = renderBuildOnce({
      initialValues: { has_signing_bonus: 'yes' },
    });

    expect(isVisible(result.current.form?.fields, 'signing_bonus_amount')).toBe(
      true,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(isVisible(result.current.form?.fields, 'signing_bonus_amount')).toBe(
      true,
    );
  });

  it('rebuilds a resolved form when initialValues arrive after the schema', () => {
    const { result, rerender } = renderBuildOnce({ initialValues: {} });
    const formBeforeEmployment = result.current.form;

    rerender({ initialValues: { has_signing_bonus: 'yes' } });

    expect(result.current.form).not.toBe(formBeforeEmployment);
    expect(isVisible(result.current.form?.fields, 'signing_bonus_amount')).toBe(
      true,
    );
  });

  it('keeps the form when initialValues and options are recreated with the same content on every render', async () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useHeadlessForm({
        schema,
        initialValues: { has_signing_bonus: 'yes' },
        options: { jsfModify: renamedBonus('Bonus') },
        strategy: 'buildOnce',
      });
    });
    const builtForm = result.current.form;

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.form).toBe(builtForm);
    expect(renders).toBeLessThan(5);
  });

  it('rebuilds with the last validated values when jsfModify changes', async () => {
    const { result, rerender } = renderBuildOnce({
      jsfModify: renamedBonus('Bonus'),
    });

    await act(async () => {
      await result.current.handleValidation({ has_signing_bonus: 'yes' });
    });
    const replacedForm = result.current.form;

    rerender({ jsfModify: renamedBonus('Welcome bonus') });

    expect(result.current.form).not.toBe(replacedForm);
    expect(isVisible(result.current.form?.fields, 'signing_bonus_amount')).toBe(
      true,
    );
  });

  it('lets the last validated values win over initialValues after a rebuild', async () => {
    const { result, rerender } = renderBuildOnce({
      initialValues: { has_signing_bonus: 'yes' },
      jsfModify: renamedBonus('Bonus'),
    });

    await act(async () => {
      await result.current.handleValidation({ has_signing_bonus: 'no' });
    });

    rerender({
      initialValues: { has_signing_bonus: 'yes' },
      jsfModify: renamedBonus('Welcome bonus'),
    });

    expect(isVisible(result.current.form?.fields, 'signing_bonus_amount')).toBe(
      false,
    );
  });

  it('builds a new schema from initialValues instead of the previous schema values', async () => {
    const { result, rerender } = renderBuildOnce({ initialValues: {} });

    await act(async () => {
      await result.current.handleValidation({ has_signing_bonus: 'yes' });
    });

    rerender({ schema: { ...schema }, initialValues: {} });

    expect(isVisible(result.current.form?.fields, 'signing_bonus_amount')).toBe(
      false,
    );
  });
});
