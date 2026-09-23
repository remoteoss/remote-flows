import { Locator, Page, expect, test } from '@playwright/test';

const MAX_ROUNDS = 5;

/**
 * Completes every Pre-Onboarding Requirement shown in the Review step (e.g. acknowledging the
 * Time Tracking Policy, then reviewing and signing the ILA). Requirements can depend on each
 * other — the ILA document is blocked until the acknowledgement is checked — so this repeats a
 * few rounds, each round checking whichever unblocked item is available, until nothing is left
 * to do.
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

  for (let round = 0; round < MAX_ROUNDS; round++) {
    let didSomething = false;

    const uncheckedBox = page
      .locator(
        '[data-testid^="acknowledgement-checkbox-"][data-state="unchecked"]:not([disabled])',
      )
      .first();

    if (await uncheckedBox.count()) {
      const testId = await uncheckedBox.getAttribute('data-testid');
      await uncheckedBox.click();
      await expect(page.getByTestId(testId as string)).toHaveAttribute(
        'data-state',
        'checked',
      );
      didSomething = true;
    }

    const reviewButton = page
      .getByRole('button', { name: 'Review document', disabled: false })
      .first();

    if (await reviewButton.count()) {
      await signPreOnboardingDocument(page, reviewButton, signature);
      didSomething = true;
    }

    if (!didSomething) break;
  }
}

async function signPreOnboardingDocument(
  page: Page,
  reviewButton: Locator,
  signature: string,
) {
  await reviewButton.click();

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
