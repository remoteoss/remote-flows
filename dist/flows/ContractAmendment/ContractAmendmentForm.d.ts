import * as react_jsx_runtime from 'react/jsx-runtime';
import { c as PostAutomatableContractAmendmentError, C as ContractAmendmentAutomatableResponse } from '../../types.gen-C6jD_TP6.js';
import { FieldValues } from 'react-hook-form';

type ContractAmendmentFormProps = {
    /**
     * Callback function to be called when the contract amendment form is submitted.
     * This function is called before the contract amendment is submitted.
     * It can be used to perform any additional validation or processing before
     * the contract amendment is submitted.
     * @param values
     * @returns
     */
    onSubmit?: (values: FieldValues) => void | Promise<void>;
    /**
     * Callback function to be called when the contract amendment fails.
     * @param error
     * @returns
     */
    onError?: (error: PostAutomatableContractAmendmentError | {
        message: 'no_changes_detected_contract_details';
    }) => void;
    /**
     * Callback function to be called when the contract amendment is successfully submitted.
     * This function is called after the contract amendment is submitted.
     * @param data
     * @returns
     */
    onSuccess?: (data: ContractAmendmentAutomatableResponse) => void | Promise<void>;
};
declare function ContractAmendmentForm({ onSubmit, onError, onSuccess, }: ContractAmendmentFormProps): react_jsx_runtime.JSX.Element;

export { ContractAmendmentForm };
