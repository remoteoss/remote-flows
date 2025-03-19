import { RemoteFlows, useCostCalculator } from '@remoteoss/remote-flows';
import type { Field, SupportedTypes } from '@remoteoss/remote-flows';
import './CostCalculatorHookVersion.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  text: ({ name, label, placeholder, onChange }) => (
    <input
      type="text"
      name={name}
      id={name}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  number: ({ name, label, placeholder, onChange }) => (
    <input
      type="number"
      name={name}
      id={name}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  select: ({ name, label, options, onChange }) => {
    return (
      <select
        name={name}
        id={name}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
  radio: ({ name, label, options, onChange }) => (
    <div className="radio-group">
      <label>{label}</label>
      {options.map((option) => (
        <div key={option.value} className="radio-option">
          <input
            type="radio"
            id={option.value}
            name={name}
            value={option.value}
            onChange={(e) => onChange(e.target.value)}
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

  const handleSubmit = (values) => {
    console.log({ values });
    // build payload

    submitCostCalculator(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <JSONSchemaFormFields fields={fields} />

      <button type="submit">Submit</button>
    </form>
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
