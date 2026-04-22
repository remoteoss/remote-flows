import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fillRadio } from '@/src/tests/testHelpers';

export async function fillHasSimilarRoles(value: 'Yes' | 'No') {
  await fillRadio(
    'Do you currently have team members in similar roles to this hire?',
    value,
  );
}

export async function assertWorkingDaysVisible(shouldBeVisible: boolean) {
  await waitFor(() => {
    const workingDaysField = screen.queryByText(/Select the work days/i);
    if (shouldBeVisible) {
      expect(workingDaysField).toBeInTheDocument();
    } else {
      expect(workingDaysField).not.toBeInTheDocument();
    }
  });
}

export async function assertWorkingDaysValue(expectedValue: string[]) {
  await waitFor(() => {
    const formValuesElement = screen.queryByTestId('debug-form-values');
    if (formValuesElement) {
      const values = JSON.parse(formValuesElement.textContent || '{}');
      expect(values.working_days).toEqual(expectedValue);
    } else {
      throw new Error('Debug form values element not found');
    }
  });
}

export async function getFormValue(fieldName: string) {
  const formValuesElement = screen.getByTestId('debug-form-values');
  const values = JSON.parse(formValuesElement.textContent || '{}');
  return values[fieldName];
}

export async function waitForFormToLoad() {
  await waitFor(() => {
    expect(
      screen.getByText(/Do you currently have team members in similar roles/i),
    ).toBeInTheDocument();
  });
}

export function getDefaultWorkingDays() {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
}

export async function selectWorkingDays(days: string[]) {
  const workingDaysSelect = await screen.findByTestId('working_days');
  
  for (const day of days) {
    const option = within(workingDaysSelect).getByRole('option', {
      name: new RegExp(day, 'i'),
    });
    await userEvent.click(option);
  }
}
