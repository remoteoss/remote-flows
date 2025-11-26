import { getYearMonthDate } from '@/src/common/dates';
import { fillRadio, fillDatePickerByTestId } from '@/src/tests/testHelpers';
import { fireEvent, waitFor, screen } from '@testing-library/react';

// Helper function to generate unique employment IDs for each test
let employmentIdCounter = 0;
export const generateUniqueEmploymentId = () => {
  employmentIdCounter++;
  return `test-employment-${employmentIdCounter}-${Date.now()}`;
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
  const currentDate = getYearMonthDate(new Date());
  const defaultValues = {
    fullName: 'John Doe',
    personalEmail: 'john.doe@gmail.com',
    workEmail: 'john.doe@remote.com',
    jobTitle: 'Software Engineer',
    provisionalStartDate: `${currentDate.year}-${currentDate.month}-${currentDate.day}`,
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
    await fillDatePickerByTestId(
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
