import { Field } from '@/src/flows/CostCalculator/types';
import { string } from 'yup';

export const fields: Field[] = [
  {
    description:
      'Confidential requests are visible only to you. Non-confidential requests are visible to all admins in your company.',
    inputType: 'radio',
    isVisible: true,
    label: 'Is this request confidential?',
    name: 'is_confidential',
    options: [
      {
        label: 'Yes',
        value: 'yes',
      },
      {
        label: 'No',
        value: 'no',
      },
    ],
    required: true,
    schema: string().required('Request is required'),
    type: 'string',
  },
];
