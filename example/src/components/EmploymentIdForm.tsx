import { useState } from 'react';

type EmploymentIdFormProps = {
  defaultValue?: string;
  submitLabel: string;
  onSubmit: (employmentId: string) => void;
};

export function EmploymentIdForm({
  defaultValue = '',
  submitLabel,
  onSubmit,
}: EmploymentIdFormProps) {
  const [employmentId, setEmploymentId] = useState(defaultValue);

  return (
    <form
      className='onboarding-form-container'
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(employmentId);
      }}
    >
      <div className='onboarding-form-group'>
        <label htmlFor='employmentId' className='onboarding-form-label'>
          Employment ID:
        </label>
        <input
          id='employmentId'
          type='text'
          value={employmentId}
          onChange={(event) => setEmploymentId(event.target.value)}
          placeholder='Enter employment ID'
          className='onboarding-form-input'
        />
      </div>
      <button type='submit' className='onboarding-form-button'>
        {submitLabel}
      </button>
    </form>
  );
}
