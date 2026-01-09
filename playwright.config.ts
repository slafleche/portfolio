import { defineConfig } from '@playwright/test';

const pad = (value) => String(value).padStart(2, '0');
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

const inCI = Boolean(process.env.CI);
const forceReuseExisting =
  process.env.PLAYWRIGHT_REUSE_EXISTING === '1';
const useExistingServer = forceReuseExisting && !inCI;
const defaultE2EPort = 3100;
const e2ePort = Number(process.env.PLAYWRIGHT_PORT ?? defaultE2EPort);
const e2eBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`;
const webServer = useExistingServer
  ? undefined
  : {
      command: `PORT=${e2ePort} yarn dev:e2e`,
      url: e2eBaseURL,
      reuseExistingServer: false,
      timeout: 120_000,
    };

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: `test-results/${timestamp}`,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  webServer,
  use: {
    baseURL: e2eBaseURL,
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
