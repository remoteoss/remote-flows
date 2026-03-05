import * as react_jsx_runtime from 'react/jsx-runtime';
import { ButtonHTMLAttributes } from 'react';
import { N as NormalizedFieldError } from '../../../mutations-C70g1hf2.js';
import '../../../remoteFlows-S2ZmIMR3.js';
import 'yup';
import '../../../types.gen-BSxAhJ_V.js';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';

type SaveDraftButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onError'> & {
    onSuccess?: () => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare const SaveDraftButton: ({ onSuccess, onError, className, children, disabled, ...props }: SaveDraftButtonProps) => react_jsx_runtime.JSX.Element;

export { SaveDraftButton };
