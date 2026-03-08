import * as react_jsx_runtime from 'react/jsx-runtime';
import { C as Components, J as JSFFields } from '../../../remoteFlows-BlCKwGdn.js';
import 'react';
import 'yup';
import '../../../types.gen-CIMOKNAn.js';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';

type CreateCompanyFormProps = {
    onSubmit: (payload: Record<string, unknown>) => Promise<void>;
    components?: Components;
    fields?: JSFFields;
    defaultValues: Record<string, unknown>;
};
declare function CreateCompanyForm({ defaultValues, onSubmit, components, }: CreateCompanyFormProps): react_jsx_runtime.JSX.Element;

export { CreateCompanyForm };
