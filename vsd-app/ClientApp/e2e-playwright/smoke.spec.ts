import { expect, test } from '@playwright/test';

/**
 * CVAP Victim Application — Smoke Tests
 *
 * These tests validate the critical happy path of the application in sequence.
 * They can be run as a quick sanity check before a full e2e run.
 *
 * Run with: npx playwright test e2e-playwright/smoke.spec.ts
 */

test.describe('Smoke: Victim Application Happy Path', () => {
  test('1 – Landing page loads correctly', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await expect(page).toHaveTitle(/Welcome - Crime Victim Assistance Program/);
    await expect(page.getByRole('heading', { name: /Crime Victim Assistance Program/ }).first()).toBeVisible();
  });

  test('2 – Can reach Application Selector without signing in', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
    await expect(page).toHaveURL(/application$/);
    await expect(page.getByRole('heading', { name: /Crime Victim Assistance Program Application/ })).toBeVisible();
  });

  test('3 – Victim Application type shows correct description and options', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
    await page.getByRole('combobox').selectOption('Victim Application');
    await expect(page.getByText(/This application package is designed for a/)).toBeVisible();
    await expect(page.getByRole('radio', { name: /Completing this application for myself/ })).toBeVisible();
  });

  test('4 – Navigates to Victim form with correct URL and stepper', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
    await page.getByRole('combobox').selectOption('Victim Application');
    await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
    await page.getByRole('radio', { name: 'Yes' }).first().click();
    await page.getByRole('button', { name: /CONTINUE TO VICTIM APPLICATION/ }).click();

    await expect(page).toHaveURL(/application\/victim/);
    await expect(page.getByRole('heading', { name: 'Victim Application', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
  });

  test('5 – Overview checkbox is required; CONTINUE without it stays on Overview', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
    await page.getByRole('combobox').selectOption('Victim Application');
    await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
    await page.getByRole('radio', { name: 'Yes' }).first().click();
    await page.getByRole('button', { name: /CONTINUE TO VICTIM APPLICATION/ }).click();
    await page.waitForSelector('h1:has-text("Overview")');

    // Do NOT check the checkbox
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
  });

  test('6 – Accepting Overview advances to Victim Information & Addresses', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
    await page.getByRole('combobox').selectOption('Victim Application');
    await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
    await page.getByRole('radio', { name: 'Yes' }).first().click();
    await page.getByRole('button', { name: /CONTINUE TO VICTIM APPLICATION/ }).click();
    await page.waitForSelector('h1:has-text("Overview")');

    await page.getByRole('checkbox', { name: /I have read and understood/ }).check();
    await page.getByRole('button', { name: /^CONTINUE/ }).click();

    await expect(page.getByRole('heading', { name: 'Victim Information & Addresses', level: 1 })).toBeVisible();
  });

  test('7 – Victim Information step has First Name, Last Name and Email fields', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
    await page.getByRole('combobox').selectOption('Victim Application');
    await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
    await page.getByRole('radio', { name: 'Yes' }).first().click();
    await page.getByRole('button', { name: /CONTINUE TO VICTIM APPLICATION/ }).click();
    await page.waitForSelector('h1:has-text("Overview")');
    await page.getByRole('checkbox', { name: /I have read and understood/ }).check();
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('h1:has-text("Victim Information")');

    await expect(page.locator('input[formcontrolname="firstName"]')).toBeVisible();
    await expect(page.locator('input[formcontrolname="lastName"]')).toBeVisible();
    // Email uses app-form-field — use getByRole('textbox') to avoid strict-mode violation
    // from the consent checkbox whose label also contains 'email address' as a substring
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
  });

  test('8 – All 10 stepper steps are visible on Victim Application', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
    await page.getByRole('combobox').selectOption('Victim Application');
    await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
    await page.getByRole('radio', { name: 'Yes' }).first().click();
    await page.getByRole('button', { name: /CONTINUE TO VICTIM APPLICATION/ }).click();
    await page.waitForSelector('h1:has-text("Overview")');

    const expectedSteps = [
      'Overview',
      'Victim Information & Addresses',
      'Crime Information',
      'Medical & Dental Information',
      'Expense & Loss Information',
      'Employment Income',
      'Application on Behalf of Victim',
      'Declaration',
      'Authorization',
      'Review & Submit'
    ];

    for (const step of expectedSteps) {
      await expect(page.getByRole('button', { name: step })).toBeVisible();
    }
  });
});
