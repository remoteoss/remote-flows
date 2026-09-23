import { Page, expect, test } from '@playwright/test';

/**
 * Completes the Pre-Onboarding Requirements shown in the Review step for this sandbox company:
 * acknowledges the Time Tracking Policy checkbox, then reviews and signs the ILA (blocked until
 * the acknowledgement is checked).
 */
export async function completePreOnboardingRequirements(
  page: Page,
  signature: string,
) {
  const hasRequirements = await page
    .getByText('Pre-Onboarding Requirements')
    .isVisible();

  if (!hasRequirements) {
    test.info().annotations.push({
      type: 'pre-onboarding-requirements-absent',
      description: 'No Pre-Onboarding Requirements section rendered; skipped.',
    });
    return;
  }

  const checkbox = page.locator('[data-testid^="acknowledgement-checkbox-"]');
  await checkbox.click();
  await expect(checkbox).toHaveAttribute('data-state', 'checked');

  await signPreOnboardingDocument(page, signature);
}

async function signPreOnboardingDocument(page: Page, signature: string) {
  await page.getByRole('button', { name: 'Review document' }).click();

  const documentDialog = page.locator(
    '[data-slot="full-screen-dialog-content"]',
  );
  await documentDialog.waitFor({ state: 'visible' });
  await documentDialog.getByRole('button', { name: 'Sign Document' }).click();

  const signatureDialog = page.locator('[data-slot="dialog-content"]');
  await signatureDialog.waitFor({ state: 'visible' });
  await signatureDialog
    .getByLabel('Your full name (signature)')
    .fill(signature);
  await signatureDialog.getByRole('button', { name: 'Sign Document' }).click();

  await documentDialog.waitFor({ state: 'hidden' });
}
