import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: 'http://74.162.71.41:5175',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});