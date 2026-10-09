import { test, expect } from '@playwright/test';

test('Landing scroll reveals sections and preserves visible content on return', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const chapter = page.locator('.lp-chapter-copy').first();
  await expect(chapter).toHaveCSS('opacity', '0');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter).toHaveCSS('opacity', '1');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('chapter-revealed.png') });
  await page.locator('.lp-final-copy').scrollIntoViewIfNeeded();
  await expect(page.locator('.lp-final-copy')).toHaveCSS('opacity', '1');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter).toHaveCSS('opacity', '1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.lp-index-list > li').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.lp-index-list > li')).toHaveCount(6);
});

test('Landing reduced motion keeps every section readable', async ({ page }, testInfo) => {
  await page.goto('/');
  const copy = page.locator('.lp-chapter-copy').first();
  await expect(copy).toHaveCSS('opacity', '1');
  await expect(copy).toHaveCSS('transform', 'none');
  await page.getByRole('link', { name: 'Lật mở những thanh âm' }).click();
  await expect(page).toHaveURL(/#nhac-cu$/);
  await expect(page.locator('#lp-index-title')).toBeInViewport();
  await expect(page.locator('.lp-index-list > li')).toHaveCount(6);
  await page.screenshot({ path: testInfo.outputPath('index-reduced-motion.png') });
});
