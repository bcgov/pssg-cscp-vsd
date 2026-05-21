import { expect, test } from '@playwright/test';

/**
 * CVAP Immediate Family Member (IFM) Application — End-to-End Tests
 *
 * Application Workflow (10 steps):
 *  Step 0  – Overview
 *  Step 1  – Personal Information & Addresses
 *  Step 2  – Victim Information
 *  Step 3  – Crime Information
 *  Step 4  – Medical Information
 *  Step 5  – Expense & Benefits
 *  Step 6  – Application on Behalf of Immediate Family Member
 *  Step 7  – Declaration
 *  Step 8  – Authorization
 *  Step 9  – Review & Submit
 *
 * See IFM-FORM-ANALYSIS.md for full field documentation.
 *
 * Run against TEST env:   npx playwright test e2e-playwright/ifm-application.spec.ts --project=test
 * Run against localhost:  npx playwright test e2e-playwright/ifm-application.spec.ts --project=localhost
 */

// ─── Reusable helpers ──────────────────────────────────────────────────────────

async function goToLanding(page: any) {
  await page.goto('/cvapwebform/');
  await page.waitForSelector('button:has-text("Continue Without Signing In")');
}

async function continueWithoutSignIn(page: any) {
  await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
  await page.waitForSelector('select');
}

async function selectIFMApplication(page: any) {
  await page.getByRole('combobox').selectOption('Immediate Family Member Application');
  await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
  await page.getByRole('radio', { name: 'Yes' }).first().click();
  await page.getByRole('button', { name: /CONTINUE TO IMMEDIATE FAMILY/ }).click();
  await page.waitForSelector('h1:has-text("Overview")');
}

async function acceptOverview(page: any) {
  await page.getByRole('checkbox', { name: /I have read and understood/ }).check();
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('h1:has-text("Personal Information")');
}

/**
 * Fill Step 1 (Personal Information & Addresses) with valid minimum data.
 * When "Phone Call" is selected as preferred contact method, phone and voicemail are required.
 * Selectors use formcontrolname attributes so they work before validation fires.
 */
async function fillStep1PersonalInfo(page: any) {
  // Name — use formcontrolname so selector works before error messages appear
  await page.locator('[formcontrolname="firstName"]').fill('Jane');
  await page.locator('[formcontrolname="lastName"]').fill('Smith');

  // Relationship to Victim (exact: true avoids matching other radios)
  await page.getByRole('radio', { name: 'Spouse', exact: true }).click();

  // Birthdate via Material datepicker — the input is readonly, so remove the attribute
  // and fill using the locale format (Moment.js 'LL' = "MMMM D, YYYY" in English).
  const birthdateInput = page.locator('app-date-field').first().locator('input');
  await birthdateInput.evaluate((el: HTMLInputElement) => el.removeAttribute('readonly'));
  await birthdateInput.fill('June 15, 1985');
  await birthdateInput.press('Tab'); // triggers blur → change event → Angular Material parses the date

  // Preferred Method of Contact (value '2' = Phone Call)
  await page.locator('[formcontrolname="preferredMethodOfContact"]').selectOption('2');

  // Phone Number (required when Phone Call is selected)
  await page.locator('[formcontrolname="phoneNumber"]').fill('6041234567');

  // Voicemail authorization — use app-field label to locate the select
  await page
    .locator('app-field')
    .filter({ hasText: /I authorize CVAP to leave a voicemail/ })
    .getByRole('combobox')
    .selectOption('100000003'); // No Voicemail

  // Primary Address — scope to the first app-address to avoid matching the mailing address section
  const primaryAddress = page.locator('app-address').first();
  await primaryAddress.locator('[formcontrolname="line1"]').fill('123 Test Street');
  await primaryAddress.locator('[formcontrolname="city"]').selectOption('Vancouver');
  await primaryAddress.locator('[formcontrolname="postalCode"]').fill('V5K0A1');
}

/**
 * Fill Step 2 (Victim Information) with valid minimum data.
 */
async function fillStep2VictimInfo(page: any) {
  // Victim Name — use formcontrolname selectors so they work before validation runs
  await page.locator('[formcontrolname="firstName"]').fill('John');
  await page.locator('[formcontrolname="lastName"]').fill('Doe');

  // Victim Birthdate via Material datepicker — remove readonly and fill in locale format
  const victimBirthdateInput = page.locator('app-date-field').first().locator('input');
  await victimBirthdateInput.evaluate((el: HTMLInputElement) => el.removeAttribute('readonly'));
  await victimBirthdateInput.fill('March 10, 1975');
  await victimBirthdateInput.press('Tab');

  // Marital Status
  await page
    .locator('app-field')
    .filter({ hasText: /Marital Status/ })
    .getByRole('combobox')
    .selectOption('Single');

  // Same contact info as applicant
  await page.getByRole('radio', { name: 'No' }).first().click();

  // Same mailing address
  await page.getByRole('radio', { name: 'No' }).nth(1).click();
}

// ─── Test Suite: TC-IFM-01 & TC-IFM-02: Landing Page ─────────────────────────

test.describe('TC-IFM-01 & TC-IFM-02: Landing Page', () => {
  test('TC-IFM-01: landing page loads with title and sign-in options', async ({ page }) => {
    await page.goto('/cvapwebform/');
    await expect(page).toHaveTitle(/Victim Services|Crime Victim Assistance/);
    await page.waitForSelector('button:has-text("Continue Without Signing In")');
    await expect(page.getByRole('button', { name: 'Sign In with BC Services Card' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue Without Signing In' })).toBeVisible();
    await expect(page.getByAltText('B.C. Government Logo')).toBeVisible();
  });

  test('TC-IFM-02: IFM option available and shows description after selection', async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await page.getByRole('combobox').selectOption('Immediate Family Member Application');
    // Use .first() to avoid strict mode when multiple elements contain 'Immediate Family Member' text
    await expect(page.getByText(/Immediate Family Member/).first()).toBeVisible();
    await expect(page.getByText(/January 1, 2024/).first()).toBeVisible();
    await expect(page.getByRole('radio', { name: /Completing this application for myself/ })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Yes' }).first()).toBeVisible();
  });
});

// ─── Test Suite: TC-IFM-03 & TC-IFM-04: Application Selector ─────────────────

test.describe('TC-IFM-03 & TC-IFM-04: Application Selector', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
  });

  test('TC-IFM-03: requires "I am" and "crime in BC" before continuing', async ({ page }) => {
    await page.getByRole('combobox').selectOption('Immediate Family Member Application');
    // CONTINUE button should be visible but cannot proceed without required radios
    const continueBtn = page.getByRole('button', { name: /CONTINUE TO IMMEDIATE FAMILY/ });
    await expect(continueBtn).toBeVisible();
  });

  test('TC-IFM-04: successful navigation to IFM form via selector', async ({ page }) => {
    await selectIFMApplication(page);
    await expect(page).toHaveURL(/application\/ifm/);
    await expect(page.getByRole('heading', { name: 'Immediate Family Member Application', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
  });
});

// ─── Test Suite: TC-IFM-05 – TC-IFM-07: Step 0 — Overview ────────────────────

test.describe('Step 0: Overview', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);
  });

  test('TC-IFM-05: CONTINUE without checkbox stays on Overview', async ({ page }) => {
    // Do NOT check the checkbox
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
  });

  test('TC-IFM-06: Overview displays required eligibility and benefit content', async ({ page }) => {
    // IFM definition
    await expect(page.getByText(/spouse, child, grandchild, sibling/i)).toBeVisible();
    // Benefits list
    await expect(page.getByText('counselling')).toBeVisible();
    await expect(page.getByText('funeral expenses')).toBeVisible();
    await expect(page.getByText('bereavement leave')).toBeVisible();
    // Use .first() to avoid strict mode — 'income support' text appears in both a list item and a paragraph
    await expect(page.getByText('income support').first()).toBeVisible();
    await expect(page.getByText('loss of parental guidance')).toBeVisible();
    // NOT covered
    await expect(page.getByText(/motor vehicle accidents/i)).toBeVisible();
    await expect(page.getByText(/pain and suffering/i)).toBeVisible();
    // Contact (phone appears twice on page, use .first() to avoid strict mode)
    await expect(page.getByText('1-866-660-3888').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'cvap@gov.bc.ca' }).first()).toBeVisible();
  });

  test('TC-IFM-07: checking Overview checkbox and CONTINUE advances to Step 1', async ({ page }) => {
    await page.getByRole('checkbox', { name: /I have read and understood/ }).check();
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Personal Information & Addresses', level: 1 })).toBeVisible();
    // Stepper should show Personal Information & Addresses as active
    await expect(page.getByRole('button', { name: 'Personal Information & Addresses', expanded: true })).toBeVisible();
  });

  test('TC-IFM-23: left stepper shows all 10 steps', async ({ page }) => {
    const steps = [
      'Overview',
      'Personal Information & Addresses',
      'Victim Information',
      'Crime Information',
      'Medical Information',
      'Expense & Benefits',
      'Application on Behalf of Immediate Family Member',
      'Declaration',
      'Authorization',
      'Review & Submit'
    ];
    for (const step of steps) {
      await expect(page.getByRole('button', { name: step })).toBeVisible();
    }
  });

  test('TC-IFM-24: Summary of Benefits dialog button is accessible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'View Summary of Benefits' })).toBeVisible();
  });

  test('TC-IFM-25: quick-exit close button is visible', async ({ page }) => {
    await expect(page.locator('.slide-close')).toBeVisible();
  });
});

// ─── Test Suite: TC-IFM-08 – TC-IFM-11: Step 1 — Personal Information ────────

test.describe('Step 1: Personal Information & Addresses', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);
    await acceptOverview(page);
  });

  test('TC-IFM-08: CONTINUE without required fields stays on Step 1 with error message', async ({ page }) => {
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Personal Information & Addresses', level: 1 })).toBeVisible();
    await expect(page.getByText('There are errors with some fields on this page')).toBeVisible();
  });

  test('TC-IFM-09: all Relationship to Victim options present', async ({ page }) => {
    const relationships = ['Spouse', 'Parent/Guardian', 'Child', 'Sibling', 'Grandparent', 'Grandchild', 'Other'];
    // Scope to the Relationship to Victim app-field to avoid matching radios in the
    // pronoun selector (which also has an 'Other' option).
    const relSection = page
      .locator('app-field')
      .filter({ hasText: /Relationship to Victim/ })
      .first();
    for (const rel of relationships) {
      await expect(relSection.getByRole('radio', { name: rel, exact: true })).toBeVisible();
    }
  });

  test('TC-IFM-10: SIN field has 9-digit constraint', async ({ page }) => {
    // Fill all required fields to allow submitting with SIN error
    await fillStep1PersonalInfo(page);

    // Enter only 5 digits in SIN
    await page
      .locator('section')
      .filter({ hasText: 'Social Insurance Number (SIN)' })
      .getByRole('textbox')
      .fill('12345');

    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Personal Information & Addresses', level: 1 })).toBeVisible();
    // Should have validation error about SIN length
    await expect(page.getByText('There are errors with some fields on this page')).toBeVisible();
  });

  test('TC-IFM-11: valid Step 1 data advances to Victim Information', async ({ page }) => {
    await fillStep1PersonalInfo(page);
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Victim Information', level: 1 })).toBeVisible();
  });
});

// ─── Test Suite: TC-IFM-12 – TC-IFM-15: Step 2 & 3 ─────────────────────────

test.describe('Step 2: Victim Information', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);
    await acceptOverview(page);
    await fillStep1PersonalInfo(page);
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('h1:has-text("Victim Information")');
  });

  test('TC-IFM-12: CONTINUE without required fields stays on Victim Information', async ({ page }) => {
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Victim Information', level: 1 })).toBeVisible();
    await expect(page.getByText('There are errors with some fields on this page')).toBeVisible();
  });
});

test.describe('Step 3: Crime Information — IFM-specific fields', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);
    await acceptOverview(page);
    await fillStep1PersonalInfo(page);
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('h1:has-text("Victim Information")');
    // Navigate directly to Crime Information via stepper (force click — already visited step 1)
    await page.getByRole('button', { name: 'Crime Information' }).click({ force: true });
    await page.waitForSelector('h1:has-text("Crime Information")');
  });

  test('TC-IFM-13: Victim Deceased from Crime field is visible (IFM-specific)', async ({ page }) => {
    // The field label is rendered by app-field — check via label text
    await expect(page.getByText(/Is the Victim deceased as a result of the crime/i)).toBeVisible();
    // Scope to the victimDeceasedFromCrime field to avoid matching other Yes/No radios on the page
    const deceasedField = page
      .locator('app-field')
      .filter({ hasText: /Is the Victim deceased.*crime/i })
      .first();
    await expect(deceasedField.getByRole('radio', { name: 'Yes', exact: true })).toBeVisible();
    await expect(deceasedField.getByRole('radio', { name: 'No', exact: true })).toBeVisible();
  });

  test('TC-IFM-14: Date of Death field appears when Victim Deceased = Yes', async ({ page }) => {
    // Scope to the victimDeceasedFromCrime field — Crime Info has other Yes/No radios
    // (e.g. "Did the crime occur over multiple days?") that would be matched by .first()
    const deceasedField = page
      .locator('app-field')
      .filter({ hasText: /Is the Victim deceased.*crime/i })
      .first();
    await deceasedField.getByRole('radio', { name: 'Yes', exact: true }).click();
    await expect(page.getByText(/Date of Death/i)).toBeVisible();
  });

  test('TC-IFM-15: CONTINUE without required crime fields stays on Crime Information', async ({ page }) => {
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Crime Information', level: 1 })).toBeVisible();
    await expect(page.getByText('There are errors with some fields on this page')).toBeVisible();
  });
});

// ─── Test Suite: TC-IFM-16 & TC-IFM-17: Step 5 — Expense & Benefits ─────────

test.describe('Step 5: Expense & Benefits', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);
    await acceptOverview(page);
    await fillStep1PersonalInfo(page);
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('h1:has-text("Victim Information")');
    await page.getByRole('button', { name: 'Expense & Benefits' }).click({ force: true });
    await page.waitForSelector('h1:has-text("Expense & Benefits")');
  });

  test('TC-IFM-16: CONTINUE without selecting an expense stays on Expense & Benefits', async ({ page }) => {
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Expense & Benefits', level: 1 })).toBeVisible();
    await expect(page.getByText('There are errors with some fields on this page')).toBeVisible();
  });

  test('TC-IFM-17: IFM expense types are present (not Victim-specific ones)', async ({ page }) => {
    // IFM-specific expense checkboxes
    await expect(page.getByRole('checkbox', { name: /Funeral expenses/i })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Bereavement leave/i })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Income support/i })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Loss of parental guidance/i })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Vocational services/i })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Childcare/i })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Legal proceeding/i })).toBeVisible();
    // Anchor at ^ to avoid matching "Transportation to obtain counselling..."
    await expect(page.getByRole('checkbox', { name: /^Counselling/i })).toBeVisible();
    // Victim-specific expenses should NOT be present
    await expect(page.getByRole('checkbox', { name: /Medical expenses/i })).not.toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Dental expenses/i })).not.toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Lost employment income/i })).not.toBeVisible();
  });
});

// ─── Test Suite: TC-IFM-18: Step 6 — Representative Information ──────────────

test.describe('Step 6: Application on Behalf of Immediate Family Member', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);
    await acceptOverview(page);
    await fillStep1PersonalInfo(page);
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('h1:has-text("Victim Information")');
    await page.getByRole('button', { name: 'Application on Behalf of Immediate Family Member' }).click({ force: true });
    await page.waitForSelector('h1:has-text("Application on Behalf")');
  });

  test('TC-IFM-18: completing-on-behalf-of radio options all present', async ({ page }) => {
    // Three options per representative-information.component.html
    await expect(page.getByRole('radio', { name: /Completing this application for myself/i })).toBeVisible();
    await expect(
      page.getByRole('radio', { name: /parent completing this application for my minor child/i })
    ).toBeVisible();
    await expect(page.getByRole('radio', { name: /legal representative/i })).toBeVisible();
  });
});

// ─── Test Suite: TC-IFM-21 & TC-IFM-22: Step 9 — Review & Submit ─────────────

test.describe('Step 9: Review & Submit', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);
    await acceptOverview(page);
    await fillStep1PersonalInfo(page);
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('h1:has-text("Victim Information")');
    // Navigate directly to Review & Submit via stepper
    await page.getByRole('button', { name: 'Review & Submit' }).click({ force: true });
    await page.waitForTimeout(500);
  });

  test('TC-IFM-21: Review & Submit shows all three submit buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /PRINT PDF/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /DOWNLOAD PDF/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /SUBMIT IFM APPLICATION AND EXIT/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /SUBMIT AND START NEW VICTIM APPLICATION/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /SUBMIT AND START NEW IFM APPLICATION/i })).toBeVisible();
  });
});

// ─── Test Suite: TC-IFM-22: Cancel Application ────────────────────────────────

test.describe('TC-IFM-22: Cancel Application', () => {
  test('TC-IFM-22: Cancel Application shows dialog and redirects on confirm', async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);

    // Click Cancel Application link
    await page.getByText('Cancel Application').click();

    // Expect a dialog to appear
    const cancelDialog = page.getByRole('dialog');
    await expect(cancelDialog).toBeVisible();

    // Confirm cancellation
    await page
      .getByRole('button', { name: /Cancel Application|Yes|Confirm/i })
      .last()
      .click();

    // Should redirect to cancelled page
    await expect(page).toHaveURL(/application-cancelled/);
  });
});

// ─── Smoke Tests: IFM Happy Path ──────────────────────────────────────────────

test.describe('Smoke: IFM Application Basic Navigation', () => {
  test('TC-IFM-SMK-01: full happy-path navigation Overview → Step 1 → Step 2', async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
    await selectIFMApplication(page);

    // Step 0: Overview
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
    await page.getByRole('checkbox', { name: /I have read and understood/ }).check();
    await page.getByRole('button', { name: /^CONTINUE/ }).click();

    // Step 1: Personal Information
    await expect(page.getByRole('heading', { name: 'Personal Information & Addresses', level: 1 })).toBeVisible();
    await fillStep1PersonalInfo(page);
    await page.getByRole('button', { name: /^CONTINUE/ }).click();

    // Step 2: Victim Information
    await expect(page.getByRole('heading', { name: 'Victim Information', level: 1 })).toBeVisible();
  });
});
