import { RemoteFlows, useCostCalculator } from '@remoteoss/remote-flows';
import './App.css';

const InputText = ({ label, id, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input type="text" id={id} className="form-input" {...props} />
    </div>
  );
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
  text: InputText,
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

export const CustomCostCalculatorForm = () => {
  const costCalculatorBag = useCostCalculator();

  return (
    <div>
      <form onSubmit={costCalculatorBag.handleSubmit}>
        <JSONSchemaFormFields fields={costCalculatorBag.fields} />
        <button type="submit">Submit</button>
      </form>
      {/* Add your custom form fields here */}
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
