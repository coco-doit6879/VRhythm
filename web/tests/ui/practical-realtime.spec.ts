import { test, expect } from '@playwright/test';

test('Practical realtime chart observes pitch and releases microphone on stop, hide and navigation', async ({ page }, info) => {
  await page.addInitScript(() => {
    const state = { frequency: 261.625565, amplitude: .2, stopped: 0, closed: 0 };
    (window as unknown as { microphoneFixture: typeof state }).microphoneFixture = state;
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: async () => ({ getTracks: () => [{ stop: () => state.stopped++ }] }) });
    class Context {
      sampleRate = 48000;
      state = 'running';
      resume() { return Promise.resolve(); }
      close() { this.state = 'closed'; state.closed++; return Promise.resolve(); }
      createMediaStreamSource() { return { connect() {} }; }
      createAnalyser() { return { fftSize: 4096, getFloatTimeDomainData(buffer: Float32Array) {
        for (let index = 0; index < buffer.length; index++) buffer[index] = state.amplitude * Math.sin(index * 2 * Math.PI * state.frequency / 48000);
      } }; }
    }
    Object.defineProperty(window, 'AudioContext', { value: Context });
  });
  await page.route('**/api/courses/91', route => route.fulfill({ json: { id: 91, title: 'Sáo nhập môn', instrument: 'Sáo trúc', accessType: 'Free', isEnrolled: true, isUnlocked: true, chapters: [{ id: 11, title: 'Luyện nốt', sortOrder: 1, lessons: [{ id: 104, title: 'Thực hành sáo trúc', type: 'Practical', sortOrder: 1 }] }] } }));
  await page.route('**/api/practical/104', route => route.fulfill({ json: { title: 'Luyện nốt', expectedNotes: [{ sortOrder: 0, note: 'D4' }] } }));
  await page.goto('/lesson/91/chapter/11/lesson/104');
  const chart = page.locator('.practice-pitch-chart');
  await expect(chart).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu nghe' }).click();
  await expect(page.locator('.pitch-readout strong')).toHaveText('C4');
  await expect.poll(() => chart.locator('.pitch-chart-heard').getAttribute('d')).toMatch(/L/);
  await page.evaluate(() => { (window as unknown as { microphoneFixture: { frequency: number } }).microphoneFixture.frequency = 523.2511306; });
  await expect(page.locator('.pitch-readout strong')).toHaveText('C5');
  await chart.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: info.outputPath('practical-realtime.png'), fullPage: true });
  await page.getByRole('button', { name: 'Dừng nghe' }).click();
  await expect(chart.getByRole('meter')).toHaveAttribute('value', '0');
  const resources = () => page.evaluate(() => {
    const state = (window as unknown as { microphoneFixture: { stopped: number; closed: number } }).microphoneFixture;
    return [state.stopped, state.closed];
  });
  expect(await resources()).toEqual([1, 1]);
  await page.getByRole('button', { name: 'Xóa lượt thu' }).click();
  await expect(chart.locator('.pitch-chart-heard')).toHaveAttribute('d', '');
  await page.getByRole('button', { name: 'Bắt đầu nghe' }).click();
  await expect(page.getByRole('button', { name: 'Dừng nghe' })).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.getByRole('button', { name: 'Bắt đầu nghe' })).toBeVisible();
  expect(await resources()).toEqual([2, 2]);
  await page.evaluate(() => Object.defineProperty(document, 'hidden', { configurable: true, value: false }));
  await page.getByRole('button', { name: 'Bắt đầu nghe' }).click();
  await expect(page.getByRole('button', { name: 'Dừng nghe' })).toBeVisible();
  await page.getByRole('button', { name: 'Quay lại khóa học' }).click();
  await expect(chart).toHaveCount(0);
  expect(await resources()).toEqual([3, 3]);
});
