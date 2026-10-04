import { defineConfig } from '@playwright/test';

const sizes = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
export default defineConfig({
  testDir: './tests/ui',
  timeout: 30_000,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5175', trace: 'retain-on-failure', screenshot: 'only-on-failure', reducedMotion: 'reduce' },
  projects: ['chromium', 'webkit'].flatMap(browserName => sizes.map(({ name, width, height }) => ({
    name: `${browserName}-${name}`,
    use: { browserName: browserName as 'chromium' | 'webkit', viewport: { width, height } },
  }))),
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5175 --strictPort', url: 'http://127.0.0.1:5175', reuseExistingServer: !process.env.CI },
});
