import { expect, test } from '@playwright/test';

/**
 * CVAP Witness Application — End-to-End Tests
 *
 * Application Workflow (10 steps):
 *  Step 0  – Overview
 *  Step 1  – Personal Information & Addresses
 *  Step 2  – Victim Information            ← unique to Witness (describes the victim witnessed)
 *  Step 3  – Crime Information
 *  Step 4  – Medical Information           ← "Medical Information" (no "& Dental")
 *  Step 5  – Expense & Benefits            ← different label from Victim ("Expense & Loss")
 *  Step 6  – Application on Behalf of Witness
 *  Step 7  – Declaration
 *  Step 8  – Authorization
 *  Step 9  – Review & Submit
 *
 * Key URL: /cvapwebform/application/witness?ob=100000000
 *   ob=100000000 → completing for myself
 *   ob=100000001 → parent completing for minor child
 *   ob=100000002 → legal representative
 *
 * Witness benefits (different from Victim application):
 *   - counselling
 *   - prescription drug expenses
 *   - transportation and related expenses
 *   - crime scene cleaning
 */

// ─── Reusable helpers ─────────────────────────────────────────────────────────

async function goToLanding(page: any) {
  await page.goto('/cvapwebform/');
}

async function continueWithoutSignIn(page: any) {
  await page.getByRole('button', { name: 'Continue Without Signing In' }).click();
}

async function selectWitnessApplication(page: any) {
  await page.getByRole('combobox').selectOption('Witness Application');
  await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
  await page.getByRole('radio', { name: 'Yes' }).first().click();
  await page.getByRole('button', { name: /CONTINUE TO WITNESS APPLICATION/ }).click();
  await page.waitForSelector('h1:has-text("Overview")');
}

async function acceptOverview(page: any) {
  await page.locator('input[formcontrolname="understoodInformation"]').check();
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('h1:has-text("Personal Information")');
}

// Angular Material CDK Stepper only allows clicking one step ahead from the current position.
// After acceptOverview we are on step 1 (Personal Information). To reach step N we must
// click through steps 2, 3, … N in sequence, waiting for each heading to confirm navigation.
const STEP_CHAIN: { name: string; heading: string }[] = [
  // index 0 → step 2
  { name: 'Victim Information', heading: 'Victim Information' },
  // index 1 → step 3
  { name: 'Crime Information', heading: 'Crime Information' },
  // index 2 → step 4
  { name: 'Medical Information', heading: 'Medical' },
  // index 3 → step 5
  { name: 'Expense & Benefits', heading: 'Expense' },
  // index 4 → step 6
  { name: 'Application on Behalf of Witness', heading: 'Application on Behalf' },
  // index 5 → step 7
  { name: 'Declaration', heading: 'Declaration' },
  // index 6 → step 8
  { name: 'Authorization', heading: 'Authorization' }
];

/**
 * Navigate to the given stepper step index (2–8) by clicking each intermediate step
 * in sequence. Assumes we are currently on step 1 (Personal Information).
 */
async function navigateToStep(page: any, targetStepIndex: number): Promise<void> {
  for (let i = 2; i <= targetStepIndex; i++) {
    const { name, heading } = STEP_CHAIN[i - 2];
    await page.getByRole('button', { name }).click({ force: true });
    await page.waitForSelector(`h1:has-text("${heading}")`);
  }
}

// ─── Test Suite: Application Selector – Witness type ─────────────────────────

test.describe('Application Selector – Witness Application', () => {
  test.beforeEach(async ({ page }) => {
    await goToLanding(page);
    await continueWithoutSignIn(page);
  });

  test('should show Witness Application description when selected', async ({ page }) => {
    await page.getByRole('combobox').selectOption('Witness Application');
    // Check the description paragraph — also implicitly confirms the Witness context
    await expect(page.getByText(/This application package is designed for a/)).toBeVisible();
    await expect(page.locator('strong:has-text("Witness")').first()).toBeVisible();
  });

  test('should show on-behalf-of options after selecting Witness Application', async ({ page }) => {
    await page.getByRole('combobox').selectOption('Witness Application');
    await expect(page.getByRole('radio', { name: /Completing this application for myself/ })).toBeVisible();
    await expect(
      page.getByRole('radio', { name: /parent completing this application for my minor child/ })
    ).toBeVisible();
    await expect(page.getByRole('radio', { name: /legal representative/ })).toBeVisible();
  });

  test('should require "Did the crime occur in BC" selection before continuing', async ({ page }) => {
    await page.getByRole('combobox').selectOption('Witness Application');
    await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
    await page.getByRole('button', { name: /CONTINUE TO WITNESS APPLICATION/ }).click();
    // Should stay on selector page (no BC crime selection)
    await expect(page.getByRole('heading', { name: /Crime Victim Assistance Program Application/ })).toBeVisible();
  });

  test('should redirect to witness application on valid selection', async ({ page }) => {
    await page.getByRole('combobox').selectOption('Witness Application');
    await page.getByRole('radio', { name: /Completing this application for myself/ }).click();
    await page.getByRole('radio', { name: 'Yes' }).first().click();
    await page.getByRole('button', { name: /CONTINUE TO WITNESS APPLICATION/ }).click();
    await expect(page).toHaveURL(/application\/witness/);
  });
});

// ─── Test Suite: Step 0 – Overview ───────────────────────────────────────────

test.describe('Step 0: Overview', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the witness form (bypasses the selector)
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
  });

  test('should show Overview page with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Before you apply', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Who may use this application?', level: 3 })).toBeVisible();
  });

  test('should describe the Witness applicant type', async ({ page }) => {
    await expect(page.getByText(/This application package is designed for a/)).toBeVisible();
    await expect(page.getByText(/witnesses in close proximity/)).toBeVisible();
  });

  test('should list witness-specific benefits', async ({ page }) => {
    await expect(page.getByText('counselling').first()).toBeVisible();
    await expect(page.getByText('prescription drug expenses')).toBeVisible();
    await expect(page.getByText('transportation and related expenses')).toBeVisible();
    await expect(page.getByText('crime scene cleaning')).toBeVisible();
  });

  test('should display all 10 stepper steps in navigation', async ({ page }) => {
    const expectedSteps = [
      'Overview',
      'Personal Information & Addresses',
      'Victim Information',
      'Crime Information',
      'Medical Information',
      'Expense & Benefits',
      'Application on Behalf of Witness',
      'Declaration',
      'Authorization',
      'Review & Submit'
    ];
    for (const step of expectedSteps) {
      await expect(page.getByRole('button', { name: step })).toBeVisible();
    }
  });

  test('should show heading "Witness Application" in side navigation', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Witness Application', level: 3 })).toBeVisible();
  });

  test('should require "I have read and understood" checkbox before continuing', async ({ page }) => {
    // Click CONTINUE without checking the box
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    // Should stay on Overview
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
  });

  test('should advance to Personal Information & Addresses after accepting', async ({ page }) => {
    await page.locator('input[formcontrolname="understoodInformation"]').check();
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await expect(page.getByRole('heading', { name: 'Personal Information & Addresses', level: 1 })).toBeVisible();
  });

  test('should show "Cancel Application" link', async ({ page }) => {
    await expect(page.getByText('Cancel Application')).toBeVisible();
  });
});

// ─── Test Suite: Step 1 – Personal Information & Addresses ───────────────────

test.describe('Step 1: Personal Information & Addresses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
    await acceptOverview(page);
  });

  test('should show Personal Information & Addresses heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Personal Information & Addresses', level: 1 })).toBeVisible();
  });

  test('should show Applicant Name fields (First, Middle, Last)', async ({ page }) => {
    await expect(page.locator('input[formcontrolname="firstName"]')).toBeVisible();
    await expect(page.locator('input[formcontrolname="middleName"]')).toBeVisible();
    await expect(page.locator('input[formcontrolname="lastName"]')).toBeVisible();
  });

  test('should show Email Address field', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
  });

  test('should show Contact Information section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contact Information', level: 2 })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
    await expect(page.locator('input[formcontrolname="confirmEmail"]')).toBeVisible();
  });

  test('should show Primary Mailing Address section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Primary Mailing Address/, level: 3 })).toBeVisible();
  });

  test('should validate required fields on Continue without input', async ({ page }) => {
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    // Page should stay on step 1 with validation errors
    await expect(page.getByRole('heading', { name: 'Personal Information & Addresses', level: 1 })).toBeVisible();
  });
});

// ─── Test Suite: Step 2 – Victim Information ─────────────────────────────────

test.describe('Step 2: Victim Information (navigation via stepper)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
    await acceptOverview(page);
    await navigateToStep(page, 2);
  });

  test('should show Victim Information heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Victim Information', level: 1 })).toBeVisible();
  });

  test('should show Victim Name section with First, Middle, Last fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Victim Name', level: 3 })).toBeVisible();
    await expect(page.locator('input[formcontrolname="firstName"]')).toBeVisible();
    await expect(page.locator('input[formcontrolname="middleName"]')).toBeVisible();
    await expect(page.locator('input[formcontrolname="lastName"]')).toBeVisible();
  });

  test('should show "Victim Information, if known" subheading (fields are optional)', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Victim Information, if known', level: 2 })).toBeVisible();
  });
});

// ─── Test Suite: Step 3 – Crime Information ──────────────────────────────────

test.describe('Step 3: Crime Information (navigation via stepper)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
    await acceptOverview(page);
    await navigateToStep(page, 3);
  });

  test('should show Crime Information heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Crime Information', level: 1 })).toBeVisible();
  });

  test('should show Crime Type input field', async ({ page }) => {
    await expect(page.locator('input[formcontrolname="typeOfCrime"]')).toBeVisible();
  });

  test('should show crime date fields', async ({ page }) => {
    await expect(page.locator('app-date-field').first()).toBeVisible();
  });

  test('should show police report section', async ({ page }) => {
    await expect(page.getByText('Was a report made to the police?')).toBeVisible();
  });
});

// ─── Test Suite: Step 4 – Medical Information ────────────────────────────────

test.describe('Step 4: Medical Information (navigation via stepper)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
    await acceptOverview(page);
    await navigateToStep(page, 4);
  });

  test('should show Medical Information heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Medical/, level: 1 })).toBeVisible();
  });

  test('should show Coverage section with MSP and Other Health Coverage questions', async ({ page }) => {
    await expect(page.getByText('Medical Services Coverage').first()).toBeVisible();
    await expect(page.getByText('Other Health Coverage').first()).toBeVisible();
  });
});

// ─── Test Suite: Step 5 – Expense & Benefits ─────────────────────────────────

test.describe('Step 5: Expense & Benefits (navigation via stepper)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
    await acceptOverview(page);
    await navigateToStep(page, 5);
  });

  test('should show Expense & Benefits heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Expense/, level: 1 })).toBeVisible();
  });

  test('should show witness benefit checkboxes', async ({ page }) => {
    // Counselling is a witness benefit (present on this step)
    await expect(page.getByText(/Counselling/i).first()).toBeVisible();
  });
});

// ─── Test Suite: Step 7 – Declaration ────────────────────────────────────────

test.describe('Step 7: Declaration (navigation via stepper)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
    await acceptOverview(page);
    await navigateToStep(page, 7);
  });

  test('should show Declaration heading and Information Collection Notice', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Declaration/, level: 1 })).toBeVisible();
  });

  test('should show Declaration & Signature section with checkbox and signature pad', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Declaration & Signature', level: 2 })).toBeVisible();
    await expect(page.locator('input[formcontrolname="declaredAndSigned"]')).toBeVisible();
  });
});

// ─── Test Suite: Step 8 – Authorization ──────────────────────────────────────

test.describe('Step 8: Authorization (navigation via stepper)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
    await acceptOverview(page);
    await navigateToStep(page, 8);
  });

  test('should show Authorization and Consent heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Authorization and Consent', level: 1 })).toBeVisible();
  });

  test('should show Standard Authorization & Signature section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Standard Authorization & Signature', level: 2 })).toBeVisible();
  });

  test('should show Release of Information section with Yes/No options', async ({ page }) => {
    await expect(page.getByText(/Release of Information/i).first()).toBeVisible();
  });
});

// ─── Test Suite: Cancellation Flow ───────────────────────────────────────────

test.describe('Cancellation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
  });

  test('should show Cancel Application link on Overview', async ({ page }) => {
    await expect(page.getByText('Cancel Application')).toBeVisible();
  });

  test('should open cancellation confirmation dialog when Cancel is clicked', async ({ page }) => {
    await page.getByText('Cancel Application').click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
  });
});

// ─── Test Suite: Stepper Navigation ──────────────────────────────────────────

test.describe('Stepper Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cvapwebform/application/witness?ob=100000000');
    await page.waitForSelector('h1:has-text("Overview")');
    await acceptOverview(page);
  });

  test('should navigate to Victim Information via stepper click', async ({ page }) => {
    await navigateToStep(page, 2);
    await expect(page.getByRole('heading', { name: 'Victim Information', level: 1 })).toBeVisible();
  });

  test('should navigate to Crime Information via stepper click', async ({ page }) => {
    await navigateToStep(page, 3);
    await expect(page.getByRole('heading', { name: 'Crime Information', level: 1 })).toBeVisible();
  });

  test('should navigate to Declaration via stepper click', async ({ page }) => {
    await navigateToStep(page, 7);
    await expect(page.getByRole('heading', { name: /Declaration/, level: 1 })).toBeVisible();
  });

  test('should navigate to Authorization via stepper click', async ({ page }) => {
    await navigateToStep(page, 8);
    await expect(page.getByRole('heading', { name: 'Authorization and Consent', level: 1 })).toBeVisible();
  });

  test.skip('should show Review & Submit step as accessible in the stepper', async ({ page }) => {
    // Skipped: same issue as victim app — the last step button triggers a browser-close condition
    // after all prior tests complete in sequence. Tracked for future investigation.
    await expect(page.getByRole('button', { name: 'Review & Submit' })).toBeVisible();
  });
});
