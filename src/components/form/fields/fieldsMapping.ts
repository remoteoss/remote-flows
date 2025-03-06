import { FieldsetField } from '@/src/components/form/fields/Fieldset';
import { NumberInputField } from '@/src/components/form/fields/NumberInputField';
import { RadioField } from '@/src/components/form/fields/RadioField';
import { SelectField } from '@/src/components/form/fields/SelectField';

export const fieldsMapConfig = {
  radio: RadioField,
  number: NumberInputField,
  fieldset: FieldsetField,
  select: SelectField,
};
