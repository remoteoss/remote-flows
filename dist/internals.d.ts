export { c as cn } from './utils-DrK8IyIN.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import 'clsx';
import 'yup';
import './remoteFlows-DI0ouAyb.js';
import './types.gen-BxpagbHP.js';
import './types-ZWIpiFgj.js';
import 'react-hook-form';

interface CardProps extends react.ComponentProps<'div'> {
    direction?: 'row' | 'col';
}
declare function Card({ className, direction, ...props }: CardProps): react_jsx_runtime.JSX.Element;
declare function CardHeader({ className, ...props }: react.ComponentProps<'header'>): react_jsx_runtime.JSX.Element;
declare function CardTitle<T extends react.ElementType = 'h2'>({ className, as, ...props }: react.ComponentProps<'h2'> & {
    as?: T;
} & Omit<react.ComponentPropsWithoutRef<T>, 'children' | 'className'>): react_jsx_runtime.JSX.Element;
declare function CardDescription({ className, ...props }: react.ComponentProps<'p'>): react_jsx_runtime.JSX.Element;
declare function CardContent({ className, ...props }: react.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;
declare function CardFooter({ className, ...props }: react.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;

declare const alertVariants: (props?: ({
    variant?: "warning" | "default" | "destructive" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Alert({ className, variant, ...props }: react.ComponentProps<'div'> & VariantProps<typeof alertVariants>): react_jsx_runtime.JSX.Element;
declare function AlertTitle({ className, ...props }: react.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;
declare function AlertDescription({ className, ...props }: react.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;

type FileUploaderProps = {
    onChange: (files: File[]) => void;
    className?: string;
    multiple?: boolean;
    accept?: string;
    files?: File[];
    id?: string;
};
declare function FileUploader({ onChange, className, multiple, accept, files: externalFiles, id, }: FileUploaderProps): react_jsx_runtime.JSX.Element;

declare function Input({ className, type, ...props }: react.ComponentProps<'input'>): react_jsx_runtime.JSX.Element;

export { Alert, AlertDescription, AlertTitle, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, FileUploader, Input };
