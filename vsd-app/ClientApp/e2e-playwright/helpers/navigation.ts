import { Page } from '@playwright/test';

/**
 * Navigate from the landing page to the Victim Application form.
 * Steps:
 *  1. Go to / (landing)
 *  2. Click "Continue Without Signing In"
 *  3. Select "Victim Application" in the dropdown
 *  4. Select "Completing this application for myself"
 *  5. Select "Yes" for crime in BC
 *  6. Click "CONTINUE TO VICTIM APPLICATION"
 */
export async function navigateToVictimApplication(page: Page): Promise<void> {
  await page.goto('/cvapwebform/');
  await page.getByRole('button', { name: 'Continue Without Signing In' }).click();

  await page.getByRole('combobox').selectOption('Victim Application');
  await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
  await page.getByRole('radio', { name: 'Yes' }).first().click();
  await page.getByRole('button', { name: /CONTINUE TO VICTIM APPLICATION/ }).click();

  // Wait for Overview step to render
  await page.waitForSelector('h1:has-text("Overview")');
}

/**
 * Accept the Overview step (check the "I have read..." checkbox and click CONTINUE).
 */
export async function acceptOverview(page: Page): Promise<void> {
  await page.getByRole('checkbox', { name: /I have read and understood/ }).check();
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('h1:has-text("Victim Information")');
}
