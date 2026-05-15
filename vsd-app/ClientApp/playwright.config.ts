import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Target: Crime Victim Assistance Program (CVAP) web application
 * Base URL: http://localhost:4200/cvapwebform
 *
 * Run with:  npx playwright test
 * Report:    npx playwright show-report
 */
export default defineConfig({
  testDir: './e2e-playwright',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'e2e-playwright-report' }], ['list']],
  use: {
    baseURL: 'http://localhost:4200/cvapwebform',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 10_000,
    navigationTimeout: 30_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
