import { Field } from '@/src/flows/CostCalculator/types';
import { string } from 'yup';

export const fields: Field[] = [
  {
    description: '',
    inputType: 'select',
    isVisible: true,
    label: 'Country',
    name: 'country',
    options: [],
    required: true,
    schema: string().required('Country is required'),
    type: 'string',
  },
  {
    description: '',
    inputType: 'select',
    isVisible: false,
    label: 'Region',
    name: 'region',
    options: [],
    required: false,
    schema: string(),
    type: 'string',
  },
  {
    description: '',
    inputType: 'select',
    isVisible: true,
    label: 'Currency',
    name: 'currency',
    options: [],
    required: true,
    schema: string().required('Currency is required'),
    type: 'string',
  },
  {
    description: '',
    inputType: 'number', // money
    isVisible: true,
    label: 'Salary',
    name: 'salary',
    options: [],
    required: true,
    schema: string()
      .typeError('Salary must be a number')
      .required('Salary is required'),
    type: 'integer',
  },
  {
    description:
      'Please be as specific as you can. Include details about the employee’s response, if applicable.',
    inputType: 'textarea',
    isVisible: true,
    label: 'Description',
    name: 'description',
    options: [],
    required: true,
    schema: string().required('Description is required'),
    type: 'string',
    maxLength: 500,
  },
];
