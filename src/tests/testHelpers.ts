import userEvent from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/react';

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
