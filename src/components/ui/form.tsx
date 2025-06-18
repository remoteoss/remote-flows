import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import DOMPurify from 'dompurify';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { Label } from '@/src/components/ui/label';
import { cn } from '@/src/lib/utils';

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
        data-slot="form-item"
        {...props}
        className={cn('grid gap-2', className)}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
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
  React.ComponentRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});

FormControl.displayName = 'FormControl';

// Deduplicates rel values if necessary and appends noopener and noreferrer
const appendSecureRelValue = (rel: string | null) => {
  const attributes = new Set(rel ? rel.toLowerCase().split(' ') : []);

  attributes.add('noopener');
  attributes.add('noreferrer');

  return Array.from(attributes).join(' ');
};

if (DOMPurify.isSupported) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const target = node.getAttribute('target');

    // set value of target to be _blank with rel, or keep as _self if already set
    if (node.tagName === 'A' && (!target || target !== '_self')) {
      node.setAttribute('target', '_blank');
      const rel = node.getAttribute('rel');
      node.setAttribute('rel', appendSecureRelValue(rel));
    }
  });
}

function FormDescription({
  className,
  children,
  ...props
}: React.ComponentProps<'p'> & {
  children?: React.ReactNode | (() => React.ReactNode);
}) {
  const { formDescriptionId } = useFormField();

  if (typeof children === 'string') {
    return (
      <p
        data-slot="form-description"
        id={formDescriptionId}
        className={cn('text-base-color text-xs', className)}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(children, { ADD_ATTR: ['target'] }),
        }}
        {...props}
      />
    );
  }

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-base-color text-xs', className)}
      {...props}
    >
      {typeof children === 'function' ? children() : children}
    </p>
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
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
