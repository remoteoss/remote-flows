import {
  fillCheckbox,
  fillRadio,
  selectDayInCalendar,
} from '@/src/tests/testHelpers';
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

export async function fillContractDetails() {
  const newValues = {
    hasSigningBonus: 'No',
    offerOtherBonuses: 'No',
    offerCommision: 'No',
    offerEquityCompensation: 'No',
    workingHoursExemption: 'No',
    typeOfEmployment: 'Full-time',
    experienceLevel: 'Level 2 - Entry Level',
    paidTimeOff: 'Unlimited paid time off',
    workAddress: "Same as the employee's residential address",
    contractDuration: true,
    salaryInstallmentsConfirmation: true,
    workFromHomeAllowanceAck: true,
    annualTrainingHoursAck: true,
    annualGrossSalary: '20000',
    probationLength: '40',
    roleDescription:
      'A Product Manager is responsible for guiding the development and success of a product from concept to launch. They act as the bridge between business, design, and engineering teams, ensuring alignment with user needs and company goals. Product Managers conduct market research, define product requirements, prioritize features, and manage the product roadmap. They communicate clearly with stakeholders, analyze performance data, and make decisions to optimize user experience and business outcomes. Strategic thinking, problem-solving, and leadership are key traits. A Product Manager must balance customer desires, technical feasibility, and business viability to deliver valuable, innovative products in a competitive market.',
  };

  if (newValues?.annualGrossSalary) {
    fireEvent.change(screen.getByLabelText(/Test Label/i), {
      target: { value: newValues?.annualGrossSalary },
    });
  }

  if (newValues?.probationLength) {
    fireEvent.change(screen.getByLabelText(/Probation period, in days/i), {
      target: { value: newValues?.probationLength },
    });
  }

  if (newValues?.roleDescription) {
    fireEvent.change(screen.getByLabelText(/Role description/i), {
      target: { value: newValues?.roleDescription },
    });
  }

  if (newValues?.contractDuration) {
    fillCheckbox('Contract duration');
  }

  if (newValues?.salaryInstallmentsConfirmation) {
    fillCheckbox(
      'I confirm the annual gross salary includes 13th and 14th salaries',
    );
  }

  if (newValues?.workFromHomeAllowanceAck) {
    fillCheckbox("I acknowledge Portugal's work-from-home allowance");
  }

  if (newValues?.annualTrainingHoursAck) {
    fillCheckbox("I acknowledge Portugal's annual training requirement");
  }

  if (newValues?.workAddress) {
    await fillRadio('Local', newValues?.workAddress);
  }

  if (newValues?.hasSigningBonus) {
    await fillRadio('Offer a signing bonus?', newValues?.hasSigningBonus);
  }

  if (newValues?.offerOtherBonuses) {
    await fillRadio('Offer other bonuses?', newValues?.offerOtherBonuses);
  }

  if (newValues?.paidTimeOff) {
    await fillRadio('Paid time off policy', newValues?.paidTimeOff);
  }

  if (newValues?.offerCommision) {
    await fillRadio('Offer commission?', newValues?.offerCommision);
  }

  if (newValues?.offerEquityCompensation) {
    await fillRadio(
      'Will this employee receive equity?',
      newValues?.offerEquityCompensation,
    );
  }

  if (newValues?.workingHoursExemption) {
    await fillRadio(
      'Will this employee need to work outside regular work hours?',
      newValues?.workingHoursExemption,
    );
  }

  if (newValues?.typeOfEmployment) {
    await fillRadio('Type of employee', newValues?.typeOfEmployment);
  }

  if (newValues?.experienceLevel) {
    await fillRadio('Experience level', newValues?.experienceLevel);
  }
}
