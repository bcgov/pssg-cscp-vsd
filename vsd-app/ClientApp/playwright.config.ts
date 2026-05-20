import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Target: Crime Victim Assistance Program (CVAP) web application
 *
 * Projects:
 *   localhost  http://localhost:4200          npm run e2e
 *   dev        http://dev.justice.gov.bc.ca   npm run e2e:dev
 *   test       http://test.justice.gov.bc.ca  npm run e2e:test
 *
 * Report: npm run e2e:report
 */
export default defineConfig({
  testDir: './e2e-playwright',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'e2e-playwright-report' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 10_000,
    navigationTimeout: 30_000
  },
  projects: [
    {
      name: 'localhost',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4200' }
    },
    {
      name: 'dev',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://dev.justice.gov.bc.ca' }
    },
    {
      name: 'test',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://test.justice.gov.bc.ca' }
    }
  ]
});
