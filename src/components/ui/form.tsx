import * as React from 'react';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { cn, sanitizeHtml } from '@/src/lib/utils';
import { Label } from '@/src/components/ui/label';
import { useTransformer } from '@/src/context';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot='form-item'
        {...props}
        className={cn('grid gap-2', className)}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<'label'>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot='form-label'
      data-error={!!error}
      className={cn(
        'text-base-color mb-1 data-[error=true]:text-destructive',
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
}

const FormControl = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(({ children, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  const controlProps = {
    'data-slot': 'form-control',
    id: formItemId,
    'aria-describedby': !error
      ? `${formDescriptionId}`
      : `${formDescriptionId} ${formMessageId}`,
    'aria-invalid': !!error,
    ...props,
  };

  if (!React.isValidElement(children)) {
    return <>{children}</>;
  }

  return React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    // WE NEED TO FIX: react-hooks/refs - Passing a ref to a function may read its value during render
    // eslint-disable-next-line react-hooks/refs
    { ...(children.props as object), ...controlProps, ref },
  );
});

FormControl.displayName = 'FormControl';

export function BaseFormDescription<T extends React.ElementType = 'p'>({
  helpCenter,
  className,
  children,
  as,
  id,
  ...props
}: React.ComponentProps<'p'> & {
  helpCenter?: React.ReactNode;
  children?: React.ReactNode | (() => React.ReactNode);
  as?: T;
  id?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'className' | 'id'>) {
  const Component = as || 'p';
  const transformHtmlToComponents = useTransformer();
  // we check if children is a string, happens in 95% of the cases I believe
  if (typeof children === 'string') {
    const sanitized = sanitizeHtml(children);
    // if we have a transformer, we use it to transform the children
    if (transformHtmlToComponents) {
      const transformed = transformHtmlToComponents(sanitized);
      return (
        <Component
          data-slot='form-description'
          id={id}
          className={cn('text-base-color text-xs', className)}
          data-transformed='true'
          data-sanitized='true'
          {...props}
        >
          {transformed} {helpCenter && helpCenter}
        </Component>
      );
    }
    // if we don't have a transformer, we sanitize the children and render it as a string
    return (
      <Component
        data-slot='form-description'
        id={id}
        className={cn('text-base-color text-xs', className)}
        data-sanitized='true'
        data-children-type='string'
        {...props}
      >
        <span dangerouslySetInnerHTML={{ __html: sanitized }} />{' '}
        {helpCenter && helpCenter}
      </Component>
    );
  }

  // this happens when in theory we pass a ReactNode, I don't really know if this case works in the real world
  // I believe we added when we started but scared to remove it
  return (
    <Component
      data-slot='form-description'
      id={id}
      className={cn('text-base-color text-xs', className)}
      data-sanitized='false'
      data-children-type='other'
      {...props}
    >
      {typeof children === 'function' ? children() : children}
      {helpCenter && helpCenter}
    </Component>
  );
}

function FormDescription<T extends React.ElementType = 'p'>({
  ...props
}: React.ComponentProps<'p'> & {
  helpCenter?: React.ReactNode;
  children?: React.ReactNode | (() => React.ReactNode);
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'className' | 'id'>) {
  const { formDescriptionId } = useFormField();
  return <BaseFormDescription id={formDescriptionId} {...props} />;
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot='form-message'
      id={formMessageId}
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
