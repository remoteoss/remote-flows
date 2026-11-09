import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { DynamicFormField } from '@/src/components/form/DynamicFormField';
import { $TSFixMe } from '@/src/types/remoteFlows';

const ShowDisabled = ({ disabled }: { disabled?: boolean }) => (
  <output data-testid='disabled'>{String(disabled)}</output>
);

function Harness({
  field,
  value,
  setValue,
}: {
  field: $TSFixMe;
  value: unknown;
  setValue: () => void;
}) {
  const methods = useForm({ defaultValues: { days: value } });

  return (
    <FormProvider {...methods} setValue={setValue}>
      <DynamicFormField
        field={field}
        name='days'
        FieldComponent={ShowDisabled}
      />
    </FormProvider>
  );
}

describe('DynamicFormField', () => {
  it('leaves a locked value alone when it already equals the default', () => {
    const setValue = vi.fn();

    render(
      <Harness
        field={{ disabled: true, default: [1, 2] }}
        value={[1, 2]}
        setValue={setValue}
      />,
    );

    expect(setValue).not.toHaveBeenCalled();
  });

  it('writes a changed default into a field disabled in the schema', () => {
    const setValue = vi.fn();

    render(
      <Harness
        field={{ disabled: true, default: '16' }}
        value='15'
        setValue={setValue}
      />,
    );

    expect(setValue).toHaveBeenCalledWith('days', '16', { shouldDirty: true });
  });

  it('hands the field component a single disabled prop for a read-only field', () => {
    render(
      <Harness field={{ readOnly: true }} value='15' setValue={vi.fn()} />,
    );

    expect(screen.getByTestId('disabled')).toHaveTextContent('true');
  });
});
