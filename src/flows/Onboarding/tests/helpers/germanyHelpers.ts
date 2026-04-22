import { screen, waitFor } from '@testing-library/react';

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

export async function waitForFormToLoad() {
  await waitFor(() => {
    expect(
      screen.getByText(/Do you currently have team members in similar roles/i),
    ).toBeInTheDocument();
  });
}
