import { getInitialValues } from '@/src/components/form/utils';
import { Fields } from '@remoteoss/json-schema-form';

type useFormProps = {
  fields: Fields;
};

export const useForm = ({ fields }: useFormProps) => {
  const fieldValues = {};
  const initialValues = getInitialValues(fields, fieldValues);

  return {
    initialValues,
  };
};
