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

function FormDescription<T extends React.ElementType = 'p'>({
  helpCenter,
  className,
  children,
  as,
  ...props
}: React.ComponentProps<'p'> & {
  helpCenter?: React.ReactNode;
  children?: React.ReactNode | (() => React.ReactNode);
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'className'>) {
  const { formDescriptionId } = useFormField();
  const Component = as || 'p';

  if (typeof children === 'string') {
    return (
      <>
        <Component
          data-slot='form-description'
          id={formDescriptionId}
          className={cn('text-base-color text-xs', className)}
          data-sanitized='true'
          {...props}
        >
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(children) }} />{' '}
          {helpCenter && helpCenter}
        </Component>
      </>
    );
  }

  return (
    <Component
      data-slot='form-description'
      id={formDescriptionId}
      data-sanitized='false'
      className={cn('text-base-color text-xs', className)}
      {...props}
    >
      {typeof children === 'function' ? children() : children}
      {helpCenter && helpCenter}
    </Component>
  );
}

export {
  Form,
  FormDescription,
  FormField,
  useFormField,
  FormFieldContext,
  FormItemContext,
};
