export function PrettifiedValuesRenderer({
  values,
}: {
  values: Record<string, unknown>;
}) {
  return (
    <div className='onboarding-values'>
      {Object.entries(values).map(([key, value]) => {
        if (Array.isArray(value)) {
          return (
            <pre key={key}>
              {key}: {value.join(', ')}
            </pre>
          );
        }

        // Handle prettified values from meta.fields
        if (
          typeof value === 'object' &&
          value !== null &&
          'prettyValue' in value
        ) {
          const prettyObj = value as { prettyValue: unknown };
          return (
            <pre key={key}>
              {key}: {String(prettyObj.prettyValue)}
            </pre>
          );
        }

        // Handle nested objects (like fieldsets)
        if (typeof value === 'object') {
          return (
            <pre key={key}>
              {key}: {JSON.stringify(value)}
            </pre>
          );
        }

        if (typeof value === 'string' || typeof value === 'number') {
          return (
            <pre key={key}>
              {key}: {value}
            </pre>
          );
        }
        return null;
      })}
    </div>
  );
}
