import { defineConfig } from '@playwright/test';

const pad = (value: number) => String(value).padStart(2, '0');
const now = new Date();
const timestamp = [
  now.getFullYear(),
  '-',
  pad(now.getMonth() + 1),
  '-',
  pad(now.getDate()),
  '_',
  pad(now.getHours()),
  '-',
  pad(now.getMinutes()),
  '-',
  pad(now.getSeconds()),
].join('');

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: `test-results/${timestamp}`,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
