export { c as cn } from './utils-BNfPRL0G.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import { C as Components } from './remoteFlows-BlCKwGdn.js';
import 'clsx';
import 'yup';
import './types.gen-CIMOKNAn.js';
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

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    size?: "link" | "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const Button: react.ForwardRefExoticComponent<Omit<react.ClassAttributes<HTMLButtonElement> & react.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<(props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    size?: "link" | "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string>, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const defaultComponents: Components;

export { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, buttonVariants, defaultComponents };
