export { c as cn } from './utils-DxILI__L.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { Drawer as Drawer$1 } from 'vaul';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import 'clsx';
import 'yup';
import './remoteFlows-DagBfxnm.js';
import './types.gen-DZuOPZbG.js';
import './types-ZWIpiFgj.js';
import 'react-hook-form';

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    size?: "link" | "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Button({ className, variant, size, asChild, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;

interface CardProps extends React.ComponentProps<'div'> {
    direction?: 'row' | 'col';
}
declare function Card({ className, direction, ...props }: CardProps): react_jsx_runtime.JSX.Element;
declare function CardHeader({ className, ...props }: React.ComponentProps<'header'>): react_jsx_runtime.JSX.Element;
declare function CardTitle<T extends React.ElementType = 'h2'>({ className, as, ...props }: React.ComponentProps<'h2'> & {
    as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'className'>): react_jsx_runtime.JSX.Element;
declare function CardDescription({ className, ...props }: React.ComponentProps<'p'>): react_jsx_runtime.JSX.Element;
declare function CardContent({ className, ...props }: React.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;
declare function CardFooter({ className, ...props }: React.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;

declare const Collapsible: React.ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleProps & React.RefAttributes<HTMLDivElement>>;
declare const CollapsibleTrigger: React.ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const CollapsibleContent: React.ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleContentProps & React.RefAttributes<HTMLDivElement>>;

declare const Drawer: {
    ({ shouldScaleBackground, ...props }: React.ComponentProps<typeof Drawer$1.Root>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const DrawerTrigger: React.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const DrawerContent: React.ForwardRefExoticComponent<Omit<Omit<DialogPrimitive.DialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>, "ref"> & {
    showHandle?: boolean;
} & React.RefAttributes<HTMLDivElement>>;
declare const DrawerHeader: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const DrawerTitle: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;

declare function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function DialogHeader({ className, ...props }: React.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;
declare function DialogFooter({ className, ...props }: React.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;
declare function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>): react_jsx_runtime.JSX.Element;
declare function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>): react_jsx_runtime.JSX.Element;

declare function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>): react_jsx_runtime.JSX.Element;
declare function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>): react_jsx_runtime.JSX.Element;

declare const alertVariants: (props?: ({
    variant?: "warning" | "default" | "destructive" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>): react_jsx_runtime.JSX.Element;
declare function AlertTitle({ className, ...props }: React.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;
declare function AlertDescription({ className, ...props }: React.ComponentProps<'div'>): react_jsx_runtime.JSX.Element;

declare const badgeVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Badge({ className, variant, asChild, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;

type FileUploaderProps = {
    onChange: (files: File[]) => void;
    className?: string;
    multiple?: boolean;
    accept?: string;
    files?: File[];
    id?: string;
};
declare function FileUploader({ onChange, className, multiple, accept, files: externalFiles, id, }: FileUploaderProps): react_jsx_runtime.JSX.Element;

declare function Input({ className, type, ...props }: React.ComponentProps<'input'>): react_jsx_runtime.JSX.Element;

declare function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare const Checkbox: React.ForwardRefExoticComponent<Omit<CheckboxPrimitive.CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;

declare function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>): react_jsx_runtime.JSX.Element;

declare function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>): react_jsx_runtime.JSX.Element;
declare function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function SelectContent({ className, children, position, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>): react_jsx_runtime.JSX.Element;

declare const ScrollArea: React.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;

export { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, Collapsible, CollapsibleContent, CollapsibleTrigger, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, FileUploader, Input, Label, RadioGroup, RadioGroupItem, ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, badgeVariants, buttonVariants };
