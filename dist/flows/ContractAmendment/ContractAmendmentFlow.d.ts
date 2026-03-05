import { ContractAmendmentConfirmationForm } from './ContractAmendmentConfirmationForm.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ContractAmendmentBack } from './ContractAmendmentBack.js';
import { ContractAmendmentForm } from './ContractAmendmentForm.js';
import { ContractAmendmentSubmit } from './ContractAmendmentSubmit.js';
import { useContractAmendment } from './hooks.js';
import { ContractAmendmentParams } from './types.js';
import '../../types.gen-C6jD_TP6.js';
import 'react-hook-form';
import 'react';
import '../../mutations-qZ0G6FAl.js';
import '../../remoteFlows-DL-yjkRb.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import '@remoteoss/json-schema-form';
import '@remoteoss/json-schema-form-v0-deprecated';
import '../useStepState.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';

type TUseContractAmendment = ReturnType<typeof useContractAmendment>;
type ContractAmendmentRenderProps = {
    /**
     * The contract amendment bag returned by the useContractAmendment hook.
     * This bag contains all the methods and properties needed to handle the contract amendment flow.
     * @see {@link useContractAmendment}
     */
    contractAmendmentBag: TUseContractAmendment;
    /**
     * The components used in the contract amendment flow.
     * This includes the form, submit button, and confirmation form.
     * @see {@link ContractAmendmentForm}
     * @see {@link ContractAmendmentSubmit}
     * @see {@link ContractAmendmentConfirmationForm}
     */
    components: {
        Form: typeof ContractAmendmentForm;
        SubmitButton: typeof ContractAmendmentSubmit;
        ConfirmationForm: typeof ContractAmendmentConfirmationForm;
        BackButton: typeof ContractAmendmentBack;
    };
};
type ContractAmendmentFlowProps = ContractAmendmentParams & {
    render: ({ contractAmendmentBag, components, }: ContractAmendmentRenderProps) => React.ReactNode;
};
declare function ContractAmendmentFlow({ employmentId, countryCode, options, render, }: ContractAmendmentFlowProps): react_jsx_runtime.JSX.Element;

export { ContractAmendmentFlow, type ContractAmendmentRenderProps };
