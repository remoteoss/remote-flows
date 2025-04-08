import { RemoteFlows, useCostCalculator } from '@remoteoss/remote-flows';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { useCallback } from 'react';
import './App.css';
import React from 'react';

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return <p data-slot="form-description" id={formDescriptionId} {...props} />;
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p data-slot="form-message" id={formMessageId} {...props}>
      {body}
    </p>
  );
}

type InputModeAttrsProps = Pick<
  React.ComponentProps<'input'>,
  'type' | 'inputMode' | 'pattern'
>;

const inputModeAttrs: InputModeAttrsProps = {
  type: 'text',
  inputMode: 'decimal',
  pattern: '^[0-9.]*$',
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

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

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof HTMLLabelElement>) {
  const { error, formItemId } = useFormField();

  return (
    <label
      data-slot="form-label"
      data-error={!!error}
      className={className}
      htmlFor={formItemId}
      {...props}
    />
  );
}

const FormControl = React.forwardRef<
  React.ComponentRef<typeof HTMLDivElement>,
  React.ComponentPropsWithoutRef<typeof HTMLDivElement>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <div
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

export function TextField({ name, description, label, type, onChange }: any) {
  const { control } = useFormContext();
  const isTypeNumber = type === 'number';
  const typeAttrs = isTypeNumber ? inputModeAttrs : { type };
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={`RemoteFlows__TextField__Item__${name}`}>
          <FormLabel className="RemoteFlows__TextField__Label">
            {label}
          </FormLabel>
          <FormControl>
            <input
              {...field}
              value={field.value ?? ''}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(event);
                onChange?.(event);
              }}
              {...typeAttrs}
              className="RemoteFlows__TextField__Input"
              placeholder={label}
            />
          </FormControl>
          {description && (
            <FormDescription className="RemoteFlows__TextField__Description">
              {description}
            </FormDescription>
          )}
          {fieldState.error && (
            <FormMessage className="RemoteFlows__TextField__Error" />
          )}
        </FormItem>
      )}
    />
  );
}

const InputText = (props) => {
  return <input type="text" className="form-input" {...props} />;
};

const InputNumber = ({ label, id, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input type="number" id={id} className="form-input" {...props} />
    </div>
  );
};

const Select = ({ label, id, options, onChange, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <select
        id={id}
        className="form-select"
        {...props}
        onChange={(evt) => onChange(evt.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const fieldsMap = {
  text: TextField,
  number: InputNumber,
  select: Select,
};

const JSONSchemaFormFields = ({ fields }: { fields: any }) => {
  if (!fields || fields.length === 0) return null;

  return (
    <>
      {fields.map((field) => {
        if (field.isVisible === false || field.deprecated) {
          return null; // Skip hidden or deprecated fields
        }

        const FieldComponent = fieldsMap[field.inputType];

        return FieldComponent ? (
          <FieldComponent key={field.name} {...field} />
        ) : (
          <p className="error">
            Field type {field.inputType as string} not supported
          </p>
        );
      })}
    </>
  );
};

const useValidationYupResolver = <T extends AnyObjectSchema>(
  validationSchema: T,
) => {
  return useCallback(
    async (data: FieldValues) => {
      return await validationSchema.validate(data, {
        abortEarly: false,
      });
    },
    [validationSchema],
  );
};

function iterateErrors(error: ValidationError) {
  const errors = (error as ValidationError).inner.reduce(
    (
      allErrors: Record<string, { type: string; message: string }>,
      currentError: ValidationError,
    ) => {
      return {
        ...allErrors,
        [currentError.path as string]: {
          type: currentError.type ?? 'validation',
          message: currentError.message,
        },
      };
    },
    {} as Record<string, { type: string; message: string }>,
  );

  return errors;
}

export const useValidationFormResolver = <T extends AnyObjectSchema>(
  validationSchema: T,
): Resolver<InferType<T>> => {
  const yupValidation = useValidationYupResolver(validationSchema);
  return useCallback(
    async (data: FieldValues) => {
      let values;
      let errors = {};

      try {
        values = await yupValidation(data);
      } catch (error) {
        errors = iterateErrors(error as ValidationError);
      }

      if (Object.keys(errors).length > 0) {
        return {
          values: {},
          errors: errors,
        };
      }

      return {
        values,
        errors: {},
      };
    },
    [validationSchema],
  );
};

const Form = FormProvider;

export const CustomCostCalculatorForm = () => {
  const costCalculatorBag = useCostCalculator();

  const resolver = useValidationFormResolver(
    costCalculatorBag.validationSchema,
  );

  const form = useForm({
    resolver,
    defaultValues: {
      country: '',
      currency: '',
      region: '',
      salary: '',
    },
    shouldUnregister: true,
    mode: 'onBlur',
  });

  const handleSubmit = async (values: any) => {
    try {
      const validatedResults = await costCalculatorBag.handleValidation({
        country: 'PRT',
        currency: 'USD',
        salary: '1000',
      });

      console.log({ validatedResults });
    } catch (error) {
      console.log({ error });
    }

    console.log('validatedResults', validatedResults);
  };

  return (
    <div>
      <button onClick={handleSubmit}>hello</button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(costCalculatorBag.handleSubmit)}>
          <JSONSchemaFormFields fields={costCalculatorBag.fields} />
          <button type="submit">Submit</button>
        </form>
      </Form>
    </div>
  );
};

export const CustomCostCalculator = () => {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };

  return (
    <RemoteFlows auth={() => fetchToken()}>
      <CustomCostCalculatorForm />
    </RemoteFlows>
  );
};
