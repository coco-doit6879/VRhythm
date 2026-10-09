import { test, expect } from '@playwright/test';

test('Music library shows searchable Vietnamese scores with readable sheets', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/library');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thư viện âm nhạc.');
  await expect(page.locator('.library-catalog li')).toHaveCount(3);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Lý cây xanh');
  await expect(page.locator('.sheet-time').first()).toHaveText('2');
  await expect(page.getByRole('button', { name: 'Nghe mẫu' })).toBeVisible();
  await page.getByRole('searchbox').fill('beo dat');
  await expect(page.locator('.library-catalog li')).toHaveCount(1);
  await page.getByRole('searchbox').fill('khong co bai');
  await expect(page.getByRole('status')).toContainText('Không tìm thấy');
  await page.getByRole('searchbox').fill('');
  await page.getByRole('link', { name: /Bắc kim thang/ }).click();
  await expect(page).toHaveURL(/\/library\/bac-kim-thang$/);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Bắc kim thang');
  await expect(page.locator('.sheet-svg text').filter({ hasText: '♯' }).first()).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
  const bounds = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    small: [...document.querySelectorAll('.music-library button,.music-library select,.library-catalog a')].filter(node => { const box = node.getBoundingClientRect(); return box.width < 44 || box.height < 44; }).length,
    paper: getComputedStyle(document.querySelector('.library-score')!).backgroundColor,
    clipped: [...document.querySelectorAll('.library-score-heading,.library-controls')].some(node => node.scrollWidth > node.clientWidth + 1),
  }));
  expect(bounds).toEqual({ overflow: 0, small: 0, paper: 'rgb(255, 255, 255)', clipped: false });
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('library.png'), fullPage: true });
  await page.getByRole('link', { name: /Bèo dạt mây trôi/ }).click();
  await expect(page.locator('.library-measure')).toHaveCount(21);
  await page.screenshot({ path: testInfo.outputPath('library-beo.png'), fullPage: true });
});

test('Music library plays real production PCM and stops on navigation', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { starts: 0, stops: 0, audible: false };
    Object.assign(window, { libraryAudio: state });
    const copy = AudioBuffer.prototype.copyToChannel;
    AudioBuffer.prototype.copyToChannel = function (samples, channel, offset) {
      state.audible ||= samples.some(value => Math.abs(value) > .001);
      return copy.call(this, samples, channel, offset);
    };
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (when, offset, duration) { state.starts++; return start.call(this, when, offset, duration); };
    const stop = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.stop = function (when) { state.stops++; return stop.call(this, when); };
  });
  await page.goto('/library/ly-cay-xanh');
  expect(await page.evaluate(() => (window as any).libraryAudio.starts)).toBe(0);
  await page.getByRole('button', { name: 'Nghe mẫu' }).click();
  await expect(page.getByRole('button', { name: 'Dừng', exact: true })).toBeVisible();
  await expect.poll(() => page.locator('.sheet-cursor').count()).toBe(1);
  expect(await page.evaluate(() => (window as any).libraryAudio.audible)).toBe(true);
  await page.getByRole('button', { name: 'Dừng', exact: true }).click();
  await expect(page.locator('.sheet-cursor')).toHaveCount(0);
  await page.getByRole('combobox').selectOption('0.75');
  await expect(page.locator('.library-score-heading')).toContainText('75');
  await page.getByRole('button', { name: 'Nghe mẫu' }).click();
  await expect(page.getByRole('button', { name: 'Dừng', exact: true })).toBeVisible();
  if (page.viewportSize()!.width < 621) await page.getByRole('button', { name: 'Mở menu' }).click();
  await page.getByRole('button', { name: 'Khám phá', exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  expect(await page.evaluate(() => (window as any).libraryAudio.stops)).toBeGreaterThanOrEqual(2);
});

test('Music library supports direct links and an unknown score state', async ({ page }) => {
  await page.goto('/library/not-a-score');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Không tìm thấy bản nhạc');
  await page.getByRole('link', { name: 'Quay lại thư viện' }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Lý cây xanh');
});
