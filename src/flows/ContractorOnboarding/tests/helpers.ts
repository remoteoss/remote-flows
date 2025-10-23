import { fireEvent, waitFor, screen } from '@testing-library/react';
import {
  selectDayInCalendar,
  fillRadio,
  fillSelect,
} from '@/src/tests/testHelpers';

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

export async function fillContractDetails(
  values?: Partial<{
    serviceAndDeliverables: string;
    serviceStartDate: string;
    serviceEndDate: string;
    contractorNoticePeriodAmount: number;
    companyNoticePeriodAmount: number;
    invoicingFrequency: string;
    compensationGrossAmount: string;
    compensationCurrencyCode: string;
    periodUnit: string;
  }>,
) {
  const defaultValues = {
    serviceAndDeliverables: 'Service and Deliverables project manager role',
    serviceStartDate: '15',
    serviceEndDate: '15',
    contractorNoticePeriodAmount: 15,
    companyNoticePeriodAmount: 15,
    invoicingFrequency: 'Bi-weekly',
    compensationGrossAmount: '1000',
    compensationCurrencyCode: 'USD',
    periodUnit: 'Hour',
  };

  const newValues = {
    ...defaultValues,
    ...values,
  };

  await waitFor(() => {
    expect(
      screen.getByLabelText(/Services and Deliverables/i),
    ).toBeInTheDocument();
  });

  if (newValues?.serviceAndDeliverables) {
    fireEvent.change(screen.getByLabelText(/Services and Deliverables/i), {
      target: { value: newValues?.serviceAndDeliverables },
    });
  }

  if (newValues?.serviceStartDate) {
    await selectDayInCalendar(
      newValues?.serviceStartDate,
      'service_duration.provisional_start_date',
    );
  }

  if (newValues?.contractorNoticePeriodAmount) {
    fireEvent.change(
      screen.getByLabelText(/Contractor termination notice period, in days/i),
      {
        target: { value: newValues?.contractorNoticePeriodAmount },
      },
    );
  }

  if (newValues?.companyNoticePeriodAmount) {
    fireEvent.change(
      screen.getByLabelText(/Company termination notice period, in days/i),
      {
        target: { value: newValues?.companyNoticePeriodAmount },
      },
    );
  }

  if (newValues?.invoicingFrequency) {
    await fillSelect(
      'Contractor Invoicing Frequency',
      newValues?.invoicingFrequency,
    );
  }

  if (newValues?.compensationGrossAmount) {
    fireEvent.change(screen.getByLabelText(/Gross compensation amount/i), {
      target: { value: newValues?.compensationGrossAmount },
    });
  }

  if (newValues?.compensationCurrencyCode) {
    await fillSelect(
      'Gross compensation currency',
      newValues?.compensationCurrencyCode,
    );
  }

  if (newValues?.periodUnit) {
    await fillSelect('Compensation period unit', newValues?.periodUnit);
  }
}
