import { FieldComponentProps } from '@remoteoss/remote-flows';
import { defaultComponents } from '@remoteoss/remote-flows/default-components';

const DefaultNumberInput = defaultComponents.number!;

type NumberFieldData = FieldComponentProps['fieldData'] & {
  additionalProps?: { currency?: string };
};

export function CurrencyNumberInput(props: FieldComponentProps) {
  const fieldData = props.fieldData as NumberFieldData;
  const currency = fieldData.additionalProps?.currency;

  if (!currency) {
    return <DefaultNumberInput {...props} />;
  }

  return (
    <DefaultNumberInput
      {...props}
      fieldData={{ ...fieldData, label: `${fieldData.label} (${currency})` }}
    />
  );
}
