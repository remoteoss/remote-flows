import * as react_jsx_runtime from 'react/jsx-runtime';
import { PropsWithChildren, ButtonHTMLAttributes } from 'react';

type OnboardingBackProps = ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>;
declare function OnboardingBack({ children, onClick, ...props }: PropsWithChildren<OnboardingBackProps>): react_jsx_runtime.JSX.Element;

export { OnboardingBack };
