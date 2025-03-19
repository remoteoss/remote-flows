import {
  buildCostCalculatorFormPayload,
  RemoteFlows,
  useCostCalculator,
  useValidationFormResolver,
} from '@remoteoss/remote-flows';
import type {
  Field,
  SupportedTypes,
  CostCalculatorFormValues,
} from '@remoteoss/remote-flows';
import { useForm } from 'react-hook-form';
import './CostCalculatorHookVersion.css';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import React from 'react';

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

const TextField = (props) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field }) => (
        <input
          {...field}
          onChange={(event) => {
            field.onChange(event);
            props.onChange?.(event);
          }}
          {...props}
        />
      )}
    />
  );
};

const InputNumber = (props) => {
  return <TextField {...props} type="number" />;
};

const SelectField = (props) => {
  console.log({ props });
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field }) => (
        <select
          {...field}
          name={props.name}
          id={props.name}
          aria-label={props.label}
          onChange={(e) => props.onChange?.(e.target.value)}
        >
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  text: TextField,
  number: InputNumber,
  select: SelectField,
  radio: ({ name, label, options }) => (
    <div className="radio-group">
      <label>{label}</label>
      {options.map((option) => (
        <div key={option.value} className="radio-option">
          <input
            type="radio"
            id={option.value}
            name={name}
            value={option.value}
          />
          <label htmlFor={option.value}>{option.label}</label>
        </div>
      ))}
    </div>
  ),
  fieldset: ({ name, label, fields }) => (
    <fieldset>
      <legend>{label}</legend>
      <JSONSchemaFormFields fields={fields} />
    </fieldset>
  ),
};

const JSONSchemaFormFields = ({ fields }: { fields: Field[] }) => {
  if (!fields || fields.length === 0) return null;

  return (
    <>
      {fields.map((field) => {
        if (field.isVisible === false || field.deprecated) {
          return null; // Skip hidden or deprecated fields
        }

        const FieldComponent = fieldsMap[field.inputType as SupportedTypes];

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

function CostCalculatorForm() {
  const {
    onSubmit: submitCostCalculator,
    fields,
    validationSchema,
  } = useCostCalculator();

  const resolver = useValidationFormResolver(validationSchema);
  const form = useForm<CostCalculatorFormValues>({
    resolver: resolver,
    defaultValues: {
      country: '',
      currency: '',
      region: '',
      salary: '',
    },
    mode: 'onBlur',
  });

  const handleSubmit = (values: CostCalculatorFormValues) => {
    console.log({ values });

    // build payload

    const payload = buildCostCalculatorFormPayload(values, {
      title: 'Estimate for a new company',
      includeBenefits: true,
      includeCostBreakdowns: true,
    });

    submitCostCalculator(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <JSONSchemaFormFields fields={fields} />

        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

export const CostCalculatorHookDemo = () => {
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
      <CostCalculatorForm />
    </RemoteFlows>
  );
};
