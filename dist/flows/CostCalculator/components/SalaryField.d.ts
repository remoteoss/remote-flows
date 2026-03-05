import * as react_jsx_runtime from 'react/jsx-runtime';
import { c as JSFField } from '../../../remoteFlows-DI0ouAyb.js';
import 'react';
import 'yup';
import '../../../types.gen-BxpagbHP.js';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';

type SalaryFieldProps = JSFField & {
    currencies: {
        from: string;
        to: string;
    };
    salary_conversion_properties?: {
        label?: string;
        description?: string;
    };
    conversionType?: 'spread' | 'no_spread';
    shouldSwapOrder: boolean;
    defaultValue?: string;
};
declare const SalaryField: ({ currencies: { from, to }, shouldSwapOrder, salary_conversion_properties, conversionType, defaultValue, ...props }: SalaryFieldProps) => react_jsx_runtime.JSX.Element;

export { SalaryField };
