import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

type ForcedValueFieldProps = {
  name: string;
  value: string;
  description: string;
  statement?: {
    title: string /** I am not sure but I believe title isn't getting ouput correctly by json-schema-form */;
    description: string;
  };
  label: string;
};

export function ForcedValueField({
  name,
  value,
  description,
  statement,
  label,
}: ForcedValueFieldProps) {
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue(name, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {statement ? (
        <>
          <p
            className={`text-sm RemoteFlows__ForcedValue__Title__${name}`}
            dangerouslySetInnerHTML={{ __html: statement?.title || label }}
          />
          <p
            className={`text-xs RemoteFlows__ForcedValue__Description__${name}`}
            dangerouslySetInnerHTML={{
              __html: statement?.description,
            }}
          />
        </>
      ) : (
        <p
          className={`text-xs RemoteFlows__ForcedValue__Description__${name}`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}
