import userEvent from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { ErrorContextProvider } from '@/src/components/error-handling/ErrorContext';
import { Components } from '@/src/types/remoteFlows';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

/**
 * Wrapper component for tests that need ErrorContext, QueryClient, and FormFields providers
 * Use with renderHook or render as: render(<Component />, { wrapper: TestProviders })
 */
export const TestProviders = ({
  children,
  components,
}: PropsWithChildren<{ components?: Components }>) => (
  <ErrorContextProvider>
    <QueryClientProvider client={queryClient}>
      <FormFieldsProvider components={components || {}}>
        {children}
      </FormFieldsProvider>
    </QueryClientProvider>
  </ErrorContextProvider>
);

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

  // Wait for the radio group to be available
  await waitFor(() => {
    screen.getByRole('radiogroup', { name: new RegExp(radioName, 'i') });
  });

  const radioGroup = screen.getByRole('radiogroup', {
    name: new RegExp(radioName, 'i'),
  });

  // Find the radio button
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

export async function selectDayInCalendar(day: string, fieldName: string) {
  const user = userEvent.setup();
  const datePickerButton = await screen.findByTestId(
    `date-picker-button-${fieldName}`,
  );
  await user.click(datePickerButton);
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  const calendar = screen.getByRole('dialog');
  expect(calendar).toBeInTheDocument();
  const dateButton = within(calendar).getByRole('button', {
    name: new RegExp(`^${day}$`, 'i'), // Also use ^ and $ for exact match
  });
  await user.click(dateButton);
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
}
