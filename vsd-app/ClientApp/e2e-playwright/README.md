# CVAP Victim Application — E2E Test Documentation

## Application Overview

The **Crime Victim Assistance Program (CVAP)** web application allows victims of violent crime in BC to apply for benefits online. The application is accessible at `http://localhost:4200/cvapwebform` in development.

---

## Application Workflow

### Entry Points

| Route                              | Description                                      |
| ---------------------------------- | ------------------------------------------------ |
| `/cvapwebform/`                    | Landing page — sign in or continue anonymously   |
| `/cvapwebform/application`         | Application type selector                        |
| `/cvapwebform/application/victim`  | Victim application form                          |
| `/cvapwebform/application/ifm`     | Immediate Family Member form                     |
| `/cvapwebform/application/witness` | Witness form                                     |
| `/cvapwebform/drafts`              | Saved drafts dashboard (requires authentication) |

### Landing Page

- **Sign In with BC Services Card** — authenticates user, pre-fills personal info, enables draft saving.
- **Continue Without Signing In** — anonymous, all fields manual, no draft saving.
- Quick-exit button always visible (closes site quickly for safety).

### Application Selector (`/application`)

1. Dropdown: `Victim Application | Immediate Family Member Application | Witness Application`
2. After selecting Victim Application, choose who is completing:
   - Completing this application for myself (`ob=100000000`)
   - A parent completing for a minor child (`ob=100000001`)
   - A legal representative / guardian (`ob=100000002`)
3. Radio: **Did the crime occur in BC?** Yes / No
4. Button: **CONTINUE TO VICTIM APPLICATION** → navigates to `/application/victim?ob=<value>`

---

## Victim Application Form (10 Steps)

The form uses a **Material Vertical Stepper** in the left sidebar. Each step validates on Continue. Steps are accessible by clicking the stepper buttons directly.

### Step 0 — Overview

- Displays eligibility information, benefit types, and instructions.
- **Required:** Checkbox — "I have read and understood all the above information."
- Blocked if checkbox is not checked.

### Step 1 — Victim Information & Addresses

**Applicant Name section:**

- First Name _(required)_
- Middle Name
- Last Name _(required)_
- Checkbox: "I also go by other names" → reveals Other First Name, Other Last Name, Date of Name Change

**Other Details section:**

- Gender (M / F / X radio or new selector depending on feature flag `useUpdatedComplianceFields`)
- Pronouns (conditional on feature flag)
- Birthdate (date picker)
- Marital Status _(required)_ — dropdown: Married, Common Law, Widowed, Divorced, Separated, Single, Prefer not to answer

**Contact Information section:**

- Primary Phone Number _(required if different from victim)_
- Alternate Phone Number
- Email Address
- Confirm Email Address
- Checkbox: "I give permission to be contacted via this method"
- Checkbox: "I authorize CVAP to leave a voicemail on this phone #"
- Checkbox: consent to email communication

**Primary Mailing Address section:**

- Checkbox: "I do not live at the following address"
- Country (default: Canada), Province/State, City, Postal/ZIP, Street Address

**Alternate Mailing Address section (optional)**

### Step 2 — Crime Information

- **Type of crime** (text, required)
- **Did the crime occur over multiple days?** (Yes/No)
- **Unsure of exact dates** (checkbox)
- **Date(s) of crime** — single date or date range (required)
  - Warning displayed if crime pre-dates victim's birthdate
  - "Why did you not apply sooner?" appears if crime date > 1 year ago
- **Crime Location(s)** — city/town in BC (at least one required, can add multiple)
- **Was the crime reported to police?** (Yes/No)
  - If Yes: RCMP detachment or other police agency, file number, officer details

### Step 3 — Medical & Dental Information

- **Provincial medical coverage (MSP)?** (Yes/No) — if Yes: Province, Personal Health Number
- **Other health coverage?** (Yes/No) — if Yes: Provider name, Plan number
- **Did you receive medical treatment?** → hospital visit details
- **Did you receive psychological/counselling treatment?**
- **Did you receive dental treatment?**

### Step 4 — Expense & Loss Information

At least one benefit checkbox required:

- Medical expenses
- Dental expenses
- Prescription drug expenses
- Counselling
- Lost employment income (reimbursed at minimum wage)
- Repair/replacement of personal property worn at time of crime
- Protective measures (security devices)
- _(Additional options for IFM/Witness: transportation, funeral, income support, etc.)_

### Step 5 — Employment Income

- Are you employed? (Yes/No)
- If requesting lost income: employer details, income information

### Step 6 — Application on Behalf of Victim

- Pre-filled based on `ob` query param from Application Selector
- For on-behalf applications: relationship to victim, representative details

### Step 7 — Declaration

- **Information Collection Notice** — FoIPPA reference
- **Checkbox:** Declaration that information is true and correct _(required)_
- **Digital Signature pad** — click to open, draw signature _(required)_

### Step 8 — Authorization and Consent

- **Full Name input** — "I, [name], hereby authorize..." _(required)_
- Authorizes CVAP to contact: healthcare providers, police, WCB, employer, insurance, CRA, MCFD
- **Checkbox:** Authority notification consent _(required)_
- **Checkbox:** Read and understood terms _(required)_
- **Digital Signature pad** _(required)_
- **Release of Information** (optional) — Yes/No; if Yes, add authorized persons

### Step 9 — Review & Submit

- Full form review in print-view mode
- Buttons:
  - **PRINT PDF**
  - **DOWNLOAD PDF**
  - **SUBMIT VICTIM APPLICATION AND EXIT**
  - **SUBMIT AND START NEW VICTIM APPLICATION** (clones form data)
  - **SUBMIT AND START NEW IFM APPLICATION** (clones form data)

---

## Draft Saving (Authenticated Users Only)

- Authenticated users see a **Save Draft** button and auto-save indicator
- Auto-save triggers 60 seconds after last user interaction when form has changed
- Countdown shown: "Saving in N seconds..."
- After save: "Saved at HH:MM:SS"
- Draft ID is passed via `?draftId=` query parameter to reload

---

## E2E Test Structure

```
e2e-playwright/
  smoke.spec.ts                 # Quick sanity checks for critical path (8 tests)
  victim-application.spec.ts    # Full feature coverage (40+ tests)
  helpers/
    navigation.ts               # Reusable page navigation helpers
playwright.config.ts            # Playwright configuration
```

---

## Running Tests

```bash
# Install dependencies (first time only)
npm install
npx playwright install chromium

# Run all e2e tests
npx playwright test

# Run only smoke tests
npx playwright test e2e-playwright/smoke.spec.ts

# Run full victim application tests
npx playwright test e2e-playwright/victim-application.spec.ts

# Run with browser visible (headed mode)
npx playwright test --headed

# Run specific test by name
npx playwright test --grep "should display CVAP program title"

# View HTML report after test run
npx playwright show-report e2e-playwright-report
```

---

## Test Coverage Summary

| Area                                   | Tests  |
| -------------------------------------- | ------ |
| Landing Page                           | 3      |
| Application Selector                   | 5      |
| Step 0: Overview                       | 6      |
| Step 1: Victim Information & Addresses | 6      |
| Step 2: Crime Information              | 5      |
| Step 3: Medical & Dental Information   | 3      |
| Step 4: Expense & Loss Information     | 2      |
| Step 7: Declaration                    | 2      |
| Step 8: Authorization                  | 4      |
| Cancellation Flow                      | 2      |
| Stepper Navigation                     | 4      |
| Smoke Tests                            | 8      |
| **Total**                              | **50** |

---

## Key Findings from Live Exploration

1. **URL Pattern:** Application type is set via URL path (`/victim`, `/ifm`, `/witness`). On-behalf-of mode is set via `?ob=` query param.
2. **Stepper is immediately clickable** — users can jump to any step without completing previous ones; validation only fires on Continue.
3. **Feature flags control UI variants** — the gender/pronoun fields have two versions controlled by `useUpdatedComplianceFields`.
4. **Draft saving requires authentication** — the BC Services Card sign-in flow unlocks draft persistence and auto-save.
5. **Cloning** — on submit, the user can clone the form data into a new IFM or Victim application; data is stored in `StateService`.
6. **Signatures** — both Declaration and Authorization require digital signatures via a canvas-based signature pad.
7. **Validation** — errors are shown inline per field using `<app-field>` wrapper; a summary banner appears at the bottom of each step page if there are errors when CONTINUE is clicked.
