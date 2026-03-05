import * as react_jsx_runtime from 'react/jsx-runtime';
import { ButtonHTMLAttributes } from 'react';

type ContractReviewButtonProps = {
    render: (props: {
        reviewCompleted: boolean;
    }) => React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;
declare function ContractReviewButton({ render, onClick, ...props }: ContractReviewButtonProps): react_jsx_runtime.JSX.Element;

export { ContractReviewButton };
