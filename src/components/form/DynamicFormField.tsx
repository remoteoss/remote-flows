import equal from 'fast-deep-equal';
import omit from 'lodash.omit';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldExtra } from '@/src/components/form/FieldExtra';
import { Statement } from '@/src/components/form/Statement';
import { StatementComponentProps } from '@/src/types/fields';
import { $TSFixMe } from '@/src/types/remoteFlows';

type DynamicFormFieldProps = {
  field: $TSFixMe;
  name: string;
  FieldComponent: React.ComponentType<$TSFixMe>;
  component?: React.ComponentType<$TSFixMe>;
};

function useReadOnlyDefault(name: string, field: $TSFixMe) {
  const { getValues, setValue } = useFormContext();
  const { readOnly, default: computedDefault } = field;

  useEffect(() => {
    if (
      readOnly &&
      computedDefault !== undefined &&
      !equal(getValues(name), computedDefault)
    ) {
      setValue(name, computedDefault, { shouldDirty: true });
    }
  }, [readOnly, computedDefault, name, getValues, setValue]);
}

export function DynamicFormField({
  field,
  name,
  FieldComponent,
  component,
}: DynamicFormFieldProps) {
  useReadOnlyDefault(name, field);

  return (
    <>
      <FieldComponent
        {...omit(field, 'WrapperComponent')}
        name={name}
        component={component}
      />
      {field.statement ? (
        <Statement {...(field.statement as StatementComponentProps['data'])} />
      ) : null}
      <FieldExtra extra={field.extra} />
    </>
  );
}
