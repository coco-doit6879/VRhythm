import { test, expect } from '@playwright/test';

test('Explore layout, images, wrapping and touch targets', async ({ page }, testInfo) => {
  await page.goto('/explore');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mỗi nhạc cụ,một câu chuyệnvăn hóa.');
  expect(await page.getByRole('heading', { level: 1 }).evaluate(el => getComputedStyle(el).fontFamily)).toContain('Playfair Display');
  await expect(page.locator('.ex-card')).toHaveCount(6);
  await expect(page.locator('.nav button[aria-current=page]')).toHaveText('Khám phá');
  const cards = page.locator('.ex-card');
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('img')).toBeVisible();
    await expect.poll(() => card.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const boxes = await card.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const image = el.querySelector('.ex-art')!.getBoundingClientRect();
      const title = el.querySelector('h3')!.getBoundingClientRect();
      return { width: rect.width, imageBottom: image.bottom, titleTop: title.top, overflow: el.scrollWidth - el.clientWidth };
    });
    expect(boxes.width).toBeGreaterThan(280);
    expect(boxes.titleTop).toBeGreaterThan(boxes.imageBottom);
    expect(boxes.overflow).toBeLessThanOrEqual(1);
  }
  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    smallTargets: [...document.querySelectorAll('.ex-card-link, .ex-intro-aside>a, .ex-closing>a')].filter(el => el.getBoundingClientRect().height < 44).length,
    columns: getComputedStyle(document.querySelector('.ex-grid')!).gridTemplateColumns.split(' ').length,
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.smallTargets).toBe(0);
  expect(geometry.columns).toBe(page.viewportSize()!.width < 621 ? 1 : 2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('explore-full.png'), fullPage: true });
  await testInfo.attach('Explore full page', { path: testInfo.outputPath('explore-full.png'), contentType: 'image/png' });
});

test('Explore shows all instruments without filters and preserves story routes', async ({ page }) => {
  await page.goto('/explore');
  await expect(page.getByRole('group', { name: 'Lọc theo họ nhạc cụ' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Tất cả|Họ dây|Họ hơi/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Đọc câu chuyện Sáo trúc' })).toHaveAttribute('href', '/explore/sao');
  await expect(page.locator('.ex-card')).toHaveCount(6);
  await page.getByRole('link', { name: 'Đọc câu chuyện Đàn nguyệt' }).press('Enter');
  await expect(page).toHaveURL(/\/explore\/nguyet$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Đàn nguyệt');
});

test('Explore navigation and learning CTA remain available', async ({ page }) => {
  await page.route('**/api/courses', route => route.fulfill({ json: [] }));
  await page.goto('/explore');
  if (page.viewportSize()!.width <= 760) {
    await page.getByRole('button', { name: 'Mở menu' }).click();
  }
  await expect(page.getByRole('button', { name: 'Khám phá', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Trang chủ', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Việt Nam');
  await page.goto('/explore');
  await page.getByRole('link', { name: 'Chọn nhạc cụ để học', exact: true }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole('heading', { name: 'Bạn muốn học nhạc cụ nào?' })).toBeVisible();
});

test('Home and login smoke regression', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Việt Nam');
  await expect(page.getByRole('button', { name: 'Bật âm thanh' })).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/login');
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
});
