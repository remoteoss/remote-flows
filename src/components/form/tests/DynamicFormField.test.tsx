import { render } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { DynamicFormField } from '@/src/components/form/DynamicFormField';

const Stub = () => null;

function Harness({
  value,
  fieldDefault,
  setValue,
}: {
  value: number[];
  fieldDefault: number[];
  setValue: () => void;
}) {
  const methods = useForm({ defaultValues: { days: value } });

  return (
    <FormProvider {...methods} setValue={setValue}>
      <DynamicFormField
        field={{ readOnly: true, default: fieldDefault }}
        name='days'
        FieldComponent={Stub}
      />
    </FormProvider>
  );
}

describe('DynamicFormField', () => {
  it('leaves a read-only value alone when it already equals the default', () => {
    const setValue = vi.fn();

    render(
      <Harness value={[1, 2]} fieldDefault={[1, 2]} setValue={setValue} />,
    );

    expect(setValue).not.toHaveBeenCalled();
  });
});
