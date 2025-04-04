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
  {
    description: '',
    inputType: 'radio',
    isVisible: true,
    label: 'Have you informed the employee of the termination?',
    name: 'customer_informed_employee',
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
    schema: string().required('Customer is required'),
    type: 'string',
  },
  {
    description: 'We’ll use this for post-termination communication.',
    inputType: 'text',
    isVisible: true,
    label: 'Employee’s personal email',
    name: 'employer_confirmed_email',
    required: true,
    schema: string().required('Personal email is required'),
    type: 'string',
  },
];
