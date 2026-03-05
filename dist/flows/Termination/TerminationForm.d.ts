import * as react_jsx_runtime from 'react/jsx-runtime';
import { J as JSFFields } from '../../remoteFlows-c5WoOLBg.js';
import { T as TerminationFormValues } from '../../types-C6de8vLk.js';
import 'react';
import 'yup';
import '../../types.gen-C7DkFdEI.js';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '../../mutations-DRPi1_As.js';
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
