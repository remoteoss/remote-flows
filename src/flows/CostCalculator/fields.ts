import { Field } from '@/src/flows/CostCalculator/types';

export const staticFields: Field[] = [
  {
    description: '',
    inputType: 'select',
    isVisible: true,
    label: 'Country',
    name: 'country',
    options: [],
    required: true,

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

    type: 'integer',
  },
];
