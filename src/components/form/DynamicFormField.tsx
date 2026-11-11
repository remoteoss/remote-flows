import equal from 'fast-deep-equal';
import omit from 'lodash.omit';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldExtra } from '@/src/components/form/FieldExtra';
import { InvoiceNumberSequence } from '@/src/components/form/InvoiceNumberSequence';
import { Statement } from '@/src/components/form/Statement';
import { isFieldLocked } from '@/src/components/form/utils';
import { StatementComponentProps } from '@/src/types/fields';
import { $TSFixMe } from '@/src/types/remoteFlows';

type DynamicFormFieldProps = {
  field: $TSFixMe;
  name: string;
  FieldComponent: React.ComponentType<$TSFixMe>;
  component?: React.ComponentType<$TSFixMe>;
};

function useLockedDefault(name: string, locked: boolean, field: $TSFixMe) {
  const { getValues, setValue } = useFormContext();
  const { default: computedDefault } = field;

  useEffect(() => {
    if (
      locked &&
      computedDefault !== undefined &&
      !equal(getValues(name), computedDefault)
    ) {
      setValue(name, computedDefault, { shouldDirty: true });
    }
  }, [locked, computedDefault, name, getValues, setValue]);
}

export function DynamicFormField({
  field,
  name,
  FieldComponent,
  component,
}: DynamicFormFieldProps) {
  const locked = isFieldLocked(field);

  useLockedDefault(name, locked, field);

  return (
    <>
      <FieldComponent
        {...omit(field, 'WrapperComponent')}
        name={name}
        component={component}
        disabled={locked}
      />
      {field.statement ? (
        field.meta?.invoiceNumberSequence ? (
          <InvoiceNumberSequence
            title={field.statement.title as string | undefined}
            sequence={field.meta.invoiceNumberSequence as string}
          />
        ) : (
          <Statement
            {...(field.statement as StatementComponentProps['data'])}
          />
        )
      ) : null}
      <FieldExtra extra={field.extra} />
    </>
  );
}
