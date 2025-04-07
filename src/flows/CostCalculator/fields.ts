import {
  CostCalculatorFormOptions,
  Field,
} from '@/src/flows/CostCalculator/types';
import { string } from 'yup';

export const generateFields = (
  fields?: CostCalculatorFormOptions['fields'],
): Field[] => {
  const countryLabel = fields?.country.label || 'Country';
  const regionLabel = fields?.region.label || 'Region';
  const currencyLabel = fields?.currency.label || 'Currency';
  const salaryLabel = fields?.salary.label || 'Salary';
  return [
    {
      description: '',
      inputType: 'select',
      isVisible: true,
      label: countryLabel,
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
      label: regionLabel,
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
      label: currencyLabel,
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
      label: salaryLabel,
      name: 'salary',
      options: [],
      required: true,
      schema: string()
        .typeError('Salary must be a number')
        .required('Salary is required'),
      type: 'integer',
    },
  ];
};
