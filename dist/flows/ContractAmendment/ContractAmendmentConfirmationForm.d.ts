import * as react_jsx_runtime from 'react/jsx-runtime';
import { P as PostCreateContractAmendmentError, b as ContractAmendmentResponse } from '../../types.gen-CtACO7H3.js';
import { FieldValues } from 'react-hook-form';

type ContractAmendmentConfirmationFormProps = {
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
    onError?: (error: PostCreateContractAmendmentError) => void;
    /**
     * Callback function to be called when the contract amendment is successfully submitted.
     * @param data
     * @returns
     */
    onSuccess?: (data: ContractAmendmentResponse) => void | Promise<void>;
};
declare function ContractAmendmentConfirmationForm({ onSubmit, onError, onSuccess, }: ContractAmendmentConfirmationFormProps): react_jsx_runtime.JSX.Element | null;

export { ContractAmendmentConfirmationForm };
