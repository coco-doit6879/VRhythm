import { test, expect } from '@playwright/test';

test('Other instrument routes remain available as a not-yet-open state', async ({ page }, testInfo) => {
  for (const id of ['nguyet', 'tyba', 'nhi', 'bau', 'tranh']) {
    for (const route of ['explore', 'learn']) {
      await page.goto(`/${route}/${id}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nhạc cụ này chưa mở');
      await expect(page.locator('.course-overview,.story-facts')).toHaveCount(0);
      await expect(page.getByRole('link', { name: 'Quay lại Khám phá' })).toHaveAttribute('href', '/explore');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
  }
  await page.screenshot({ path: testInfo.outputPath('instrument-not-open.png'), fullPage: true });
});
test('Flute detail uses the supplied portrait and retains article navigation', async ({ page }, testInfo) => {
  await page.goto('/explore/sao');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sáo trúc');
  const portrait = page.locator('.flute-portrait img');
  await expect(portrait).toHaveAttribute('src', '/images/flute-performance-portrait.jpg');
  await expect.poll(() => portrait.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1326);
  await expect(page.locator('img[src*="girl_playing_flute"]')).toHaveCount(0);
  await expect(page.locator('img[src*="sao_truc_dan_nhac_cheo"]')).toHaveCount(0);
  const portraitBox = await portrait.boundingBox();
  expect(portraitBox!.height / portraitBox!.width).toBeCloseTo(1988 / 1326, 2);
  await page.getByRole('link', { name: 'Cấu tạo', exact: true }).click();
  await expect(page).toHaveURL(/#cau-tao$/);
  await expect(page.getByRole('heading', { name: 'Cấu tạo của sáo ngang sáu lỗ' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bắt đầu học sáo trúc' })).toHaveAttribute('href', '/learn/sao');
  await expect(page.locator('.flute-sources li')).toHaveCount(5);
  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    contentOverflow: document.querySelector('.flute-content')!.scrollWidth - document.querySelector('.flute-content')!.clientWidth,
    copy: document.querySelector('.flute-heading-copy')!.getBoundingClientRect().toJSON(),
    photo: document.querySelector('.flute-portrait')!.getBoundingClientRect().toJSON(),
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.contentOverflow).toBeLessThanOrEqual(1);
  if (page.viewportSize()!.width <= 720) expect(geometry.photo.top).toBeGreaterThan(geometry.copy.bottom);
  else expect(geometry.photo.left).toBeGreaterThan(geometry.copy.right);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('flute.png'), fullPage: true });
});
