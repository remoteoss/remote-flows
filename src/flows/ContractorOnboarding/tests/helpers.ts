import { fireEvent, waitFor, screen } from '@testing-library/react';
import { selectDayInCalendar, fillRadio } from '@/src/tests/testHelpers';

// Helper to generate unique employment IDs
let employmentIdCounter = 0;
export const generateUniqueEmploymentId = () => {
  employmentIdCounter++;
  return `test-contractor-employment-${employmentIdCounter}-${Date.now()}`;
};

export async function fillBasicInformation(
  values?: Partial<{
    fullName: string;
    personalEmail: string;
    workEmail: string;
    jobTitle: string;
    country: string;
    jobCategory: string;
    provisionalStartDate: string;
    hasSeniorityDate: string;
  }>,
) {
  const defaultValues = {
    fullName: 'John Doe',
    personalEmail: 'john.doe@gmail.com',
    workEmail: 'john.doe@remote.com',
    jobTitle: 'Software Engineer',
    provisionalStartDate: '15',
    hasSeniorityDate: 'No',
  };

  const newValues = {
    ...defaultValues,
    ...values,
  };

  await waitFor(() => {
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
  });

  if (newValues?.fullName) {
    fireEvent.change(screen.getByLabelText(/Full name/i), {
      target: { value: newValues?.fullName },
    });
  }

  if (newValues?.personalEmail) {
    fireEvent.change(screen.getByLabelText(/Personal email/i), {
      target: { value: newValues?.personalEmail },
    });
  }

  if (newValues?.workEmail) {
    fireEvent.change(screen.getByLabelText(/Work email/i), {
      target: { value: newValues?.workEmail },
    });
  }

  if (newValues?.jobTitle) {
    fireEvent.change(screen.getByLabelText(/Job title/i), {
      target: { value: newValues?.jobTitle },
    });
  }

  if (newValues?.provisionalStartDate) {
    await selectDayInCalendar(
      newValues?.provisionalStartDate,
      'provisional_start_date',
    );
  }

  if (newValues?.hasSeniorityDate) {
    await fillRadio(
      'Does the employee have a seniority date?',
      newValues?.hasSeniorityDate,
    );
  }
}
