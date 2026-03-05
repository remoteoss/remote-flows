import * as react_jsx_runtime from 'react/jsx-runtime';
import { c as JSFField } from '../../../remoteFlows-c5WoOLBg.js';
import 'react';
import 'yup';
import '../../../types.gen-C7DkFdEI.js';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';

type AnnualGrossSalaryProps = JSFField & {
    currency: string;
    desiredCurrency: string;
    annual_gross_salary_conversion_properties?: {
        label?: string;
        description?: string;
    };
};
declare const AnnualGrossSalary: ({ currency, desiredCurrency, annual_gross_salary_conversion_properties, ...props }: AnnualGrossSalaryProps) => react_jsx_runtime.JSX.Element;

export { AnnualGrossSalary };
