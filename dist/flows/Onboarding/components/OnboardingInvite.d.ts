import * as react_jsx_runtime from 'react/jsx-runtime';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { F as FieldError } from '../../../mutations-C70g1hf2.js';
import { S as SuccessResponse } from '../../../types.gen-BSxAhJ_V.js';
import '../../../remoteFlows-S2ZmIMR3.js';
import 'yup';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';

type OnboardingInviteProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onError'> & {
    onSuccess?: ({ data, employmentStatus, }: {
        data: SuccessResponse;
        employmentStatus: 'invited' | 'created_awaiting_reserve';
    }) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: FieldError[];
    }) => void;
    onSubmit?: () => void | Promise<void>;
    render: (props: {
        employmentStatus: 'invited' | 'created_awaiting_reserve';
    }) => ReactNode;
} & Record<string, unknown>;
declare function OnboardingInvite({ onSubmit, onSuccess, onError, render, ...props }: OnboardingInviteProps): react_jsx_runtime.JSX.Element;

export { OnboardingInvite, type OnboardingInviteProps };
