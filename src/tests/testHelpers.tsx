import userEvent from '@testing-library/user-event';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { getQueryClient } from '@/src/queryConfig';
import { Components } from '@/src/types/remoteFlows';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { defaultComponents } from '@/src/tests/defaultComponents';
import { defaultComponents as defaultRemoteFlowsComponents } from '@/src/default-components';

export const queryClient = getQueryClient();

/**
 * Wrapper component for tests that need ErrorContext, QueryClient, and FormFields providers
 * Use with renderHook or render as: render(<Component />, { wrapper: TestProviders })
 */
export const TestProviders = ({
  children,
  components,
}: PropsWithChildren<{ components?: Components }>) => {
  const mergedComponents = {
    ...defaultRemoteFlowsComponents,
    ...defaultComponents,
    ...components,
  } as Components;
  return (
    <QueryClientProvider client={queryClient}>
      <FormFieldsProvider components={mergedComponents}>
        {children}
      </FormFieldsProvider>
    </QueryClientProvider>
  );
};
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

  // Wait for the radio group to be available - use role-based query for specificity
  await waitFor(() => {
    screen.getByRole('radiogroup', { name: new RegExp(radioName, 'i') });
  });

  // Get the specific radiogroup by role (not just by text)
  const radioGroup = screen.getByRole('radiogroup', {
    name: new RegExp(radioName, 'i'),
  });

  // Find the radio button within that group
  const radioButton = within(radioGroup).getByRole('radio', {
    name: new RegExp(radioValue, 'i'),
  });

  // Use userEvent to click the radio button
  await user.click(radioButton);

  // Wait for the radio button to be checked
  await waitFor(() => {
    expect(radioButton).toBeChecked();
  });
}

export async function fillSelect(selectName: string, selectValue: string) {
  const user = userEvent.setup();
  const select = await screen.findByRole('combobox', {
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

export async function fillDatePicker(date: string, label: string) {
  const datePickerInput = await screen.findByLabelText(label);
  expect(datePickerInput).toBeInTheDocument();
  await fireEvent.change(datePickerInput, { target: { value: date } });
}

export async function fillDatePickerByTestId(date: string, testId: string) {
  const dateInput = await screen.findByTestId(testId);
  await fireEvent.change(dateInput, { target: { value: date } });
}
