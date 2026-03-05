import * as react_jsx_runtime from 'react/jsx-runtime';
import { J as JSFFields } from '../../remoteFlows-DL-yjkRb.js';
import { T as TerminationFormValues } from '../../types-B6gTjRpk.js';
import 'react';
import 'yup';
import '../../types.gen-C6jD_TP6.js';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '../../mutations-qZ0G6FAl.js';
import '@remoteoss/json-schema-form';
import '@remoteoss/json-schema-form-v0-deprecated';
import '../useStepState.js';
import './TerminationBack.js';
import './TerminationSubmit.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';

type TerminationFormProps = {
    onSubmit: (payload: TerminationFormValues) => void;
    fields?: JSFFields;
    defaultValues?: TerminationFormValues;
};
declare function TerminationForm({ defaultValues, fields, onSubmit, }: TerminationFormProps): react_jsx_runtime.JSX.Element;

export { TerminationForm };
