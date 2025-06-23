import { NormalizedFieldError } from '@remoteoss/remote-flows';

export const AlertError = ({
  errors,
}: {
  errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  };
}) => {
  if (errors.apiError) {
    return (
      <div className="alert-error">
        <p>{errors.apiError}</p>
        <ul>
          {errors.fieldErrors.map((fieldError) => (
            <li key={fieldError.field}>
              {fieldError.messages.map((message) => (
                <span key={message}>
                  <strong>{fieldError.userFriendlyLabel}</strong>: {message}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>
    );
  }
};
