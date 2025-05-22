import userEvent from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/react';

/**
 * Assert that a specific radio option is selected within a radio group
 * @param radioName The name or label of the radio group
 * @param expectedValue The expected selected value
 */
export async function assertRadioValue(
  radioName: string,
  expectedValue: string,
) {
  // Wait for the radio group to be available
  await waitFor(() => {
    const radioGroup = screen.getByRole('radiogroup', {
      name: new RegExp(radioName, 'i'),
    });
    expect(radioGroup).toBeInTheDocument();
  });

  // Get the radio group
  const radioGroup = screen.getByRole('radiogroup', {
    name: new RegExp(radioName, 'i'),
  });
  expect(radioGroup).toBeInTheDocument();

  // Find all radio buttons within the group
  const radioButtons = within(radioGroup).getAllByRole('radio');

  // Find the radio button that matches the expected value
  const matchingRadioButton = within(radioGroup).getByRole('radio', {
    name: new RegExp(expectedValue, 'i'),
  });

  // Assert that the matching radio button is checked
  expect(matchingRadioButton).toBeChecked();

  // For additional verification, ensure no other radio buttons are checked
  const otherRadioButtons = radioButtons.filter(
    (button) => button !== matchingRadioButton,
  );

  otherRadioButtons.forEach((button) => {
    expect(button).not.toBeChecked();
  });
}

export async function fillRadio(radioName: string, radioValue: string) {
  const user = userEvent.setup();
  await waitFor(() => {
    const radioGroup = screen.getByRole('radiogroup', {
      name: new RegExp(radioName, 'i'),
    });
    expect(radioGroup).toBeInTheDocument();
  });
  const radioGroup = screen.getByRole('radiogroup', {
    name: new RegExp(radioName, 'i'),
  });
  expect(radioGroup).toBeInTheDocument();

  const radioButton = within(radioGroup).getByRole('radio', {
    name: new RegExp(radioValue, 'i'),
  });
  expect(radioButton).toBeInTheDocument();

  await user.click(radioButton);
}

export async function fillSelect(selectName: string, selectValue: string) {
  const user = userEvent.setup();
  const select = screen.getByRole('combobox', {
    name: new RegExp(selectName, 'i'),
  });
  expect(select).toBeInTheDocument();

  await user.click(select);

  const option = screen.getByRole('option', {
    name: new RegExp(selectValue, 'i'),
  });
  expect(option).toBeInTheDocument();

  await user.click(option);
}

export async function fillCheckbox(checkboxName: string) {
  const user = userEvent.setup();
  const checkbox = screen.getByRole('checkbox', {
    name: new RegExp(checkboxName, 'i'),
  });
  expect(checkbox).toBeInTheDocument();
  await user.click(checkbox);
}

export async function selectDayInCalendar(day: string, fieldName: string) {
  const user = userEvent.setup();
  const datePickerButton = screen.getByTestId(
    `date-picker-button-${fieldName}`,
  );
  await user.click(datePickerButton);
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  const calendar = screen.getByRole('dialog');
  expect(calendar).toBeInTheDocument();
  const dateButton = screen.getByRole('button', {
    name: new RegExp(day, 'i'),
  });
  await user.click(dateButton);
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
}
