import { FieldComponentProps } from '@remoteoss/remote-flows';
import { defaultComponents } from '@remoteoss/remote-flows/default-components';

const DefaultNumberInput = defaultComponents.number!;

export function CurrencyNumberInput(props: FieldComponentProps) {
  const currency = props.fieldData.additionalProps?.currency;

  if (!currency) {
    return <DefaultNumberInput {...props} />;
  }

  return (
    <DefaultNumberInput
      {...props}
      fieldData={{
        ...props.fieldData,
        label: `${props.fieldData.label} (${currency})`,
      }}
    />
  );
}
