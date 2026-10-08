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
});

test('Landing reduced motion keeps every section readable', async ({ page }, testInfo) => {
  await page.goto('/');
  const copy = page.locator('.lp-chapter-copy').first();
  await expect(copy).toHaveCSS('opacity', '1');
  await expect(copy).toHaveCSS('transform', 'none');
  await page.getByRole('link', { name: 'Lật mở những thanh âm' }).click();
  await expect(page).toHaveURL(/#nhac-cu$/);
  await expect(page.locator('#lp-index-title')).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath('index-reduced-motion.png') });
});


test('Landing six instruments move with scroll and stop for reduced motion', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.lp-chapter')).toHaveCount(6);
  for (const id of ['sao', 'nguyet', 'tranh', 'tyba', 'nhi', 'bau']) {
    const chapter = page.locator('#chuong-' + id);
    await expect(chapter.locator('a').first()).toHaveAttribute('href', '/learn/' + id);
  }
  const image = page.locator('#chuong-tyba .lp-chapter-art img');
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.waitForTimeout(1000);
  const before = await image.evaluate(el => getComputedStyle(el).transform);
  await page.evaluate(() => scrollBy(0, 180));
  await expect.poll(() => image.evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: info.outputPath('instrument-motion.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(image).toHaveCSS('transform', 'none');
  for (const id of ['tyba', 'nhi', 'bau']) {
    const section = page.locator('#chuong-' + id);
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator('.lp-chapter-copy')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: info.outputPath(id + '-reduced.png') });
  }
});
