import {
  NumberField,
  NumberFieldProps,
} from '@/src/components/form/fields/NumberField';

// TODO: We use the number field and the the number type is what the partner overrides
// TODO: this needs to be changed in the future with the changes from https://github.com/remoteoss/remote-flows/pull/128
export const MoneyField = (props: NumberFieldProps) => {
  return <NumberField maxLength={15} {...props} />;
};
