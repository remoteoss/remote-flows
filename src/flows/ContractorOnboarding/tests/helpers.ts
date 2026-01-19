import { fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  fillRadio,
  fillSelect,
  fillDatePickerByTestId,
} from '@/src/tests/testHelpers';
import { getYearMonthDate } from '@/src/common/dates';

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

export async function fillContractorSubscription() {
  await fillRadio('Payment terms', 'Contractor Management Plus');
}

export async function fillContractDetails(
  values?: Partial<{
    serviceAndDeliverables: string;
    serviceStartDate: string;
    contractorNoticePeriodAmount: number;
    companyNoticePeriodAmount: number;
    invoicingFrequency: string;
    compensationGrossAmount: string;
    compensationCurrencyCode: string;
    periodUnit: string;
  }>,
) {
  const currentDate = getYearMonthDate(new Date());
  const defaultValues = {
    serviceAndDeliverables: 'Service and Deliverables project manager role',
    serviceStartDate: `${currentDate.year}-${currentDate.month}-${currentDate.day}`,
    contractorNoticePeriodAmount: 15,
    companyNoticePeriodAmount: 15,
    invoicingFrequency: 'bi_weekly',
    compensationGrossAmount: '1000',
    compensationCurrencyCode: 'USD',
    periodUnit: 'hourly',
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
    await fillDatePickerByTestId(
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
      'payment_terms.invoicing_frequency',
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
      'payment_terms.compensation_currency_code',
      newValues?.compensationCurrencyCode,
    );
  }

  if (newValues?.periodUnit) {
    await fillSelect('payment_terms.period_unit', newValues?.periodUnit);
  }
}

export async function fillSignature(
  values?: Partial<{
    signature: string;
  }>,
  signatureFieldLabel?: string,
) {
  const signatureFieldLabelText = signatureFieldLabel || 'Enter full name';
  const defaultValues = {
    signature: 'John Doe',
  };

  const newValues = {
    ...defaultValues,
    ...values,
  };

  const reviewButton = screen.getByRole('button', { name: /Review/i });

  reviewButton.click();

  await waitFor(() => {
    expect(screen.getByText(/Contract Document/i)).toBeInTheDocument();
  });

  // Press Escape to close the drawer
  const user = userEvent.setup();
  await user.keyboard('{Escape}');

  await waitFor(() => {
    expect(
      screen.getByLabelText(new RegExp(signatureFieldLabelText, 'i')),
    ).toBeInTheDocument();
  });

  if (newValues?.signature) {
    fireEvent.change(
      screen.getByLabelText(new RegExp(signatureFieldLabelText, 'i')),
      {
        target: { value: newValues?.signature },
      },
    );
  }
}