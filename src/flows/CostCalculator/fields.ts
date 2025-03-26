import { Field } from '@/src/flows/CostCalculator/types';
import { boolean, string } from 'yup';

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
    description: '',
    inputType: 'checkbox',
    isVisible: true,
    label: 'Accept Terms',
    name: 'terms',
    required: true,
    schema: boolean()
      .oneOf([true], 'You must accept the terms and conditions')
      .required('You must accept the terms and conditions'),
    type: 'boolean',
  },
];
