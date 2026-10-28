import { test, expect } from '@playwright/test';

test('Learning editorial layout and course states', async ({ page }, info) => {
  await page.route('**/api/courses', route => route.fulfill({ json: [{ instrument: 'Sáo trúc' }] }));
  await page.goto('/learn');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.learning-card')).toHaveCount(6);
  await expect(page.locator('.learning-card-footer small', { hasText: '1 khóa học đang mở' })).toHaveCount(1);
  await expect(page.locator('.nav button[aria-current=page]')).toHaveText('Học tập');
  for (const card of await page.locator('.learning-card').all()) {
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.locator('img').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const geometry = await card.evaluate(el => ({
      overflow: el.scrollWidth - el.clientWidth,
      art: el.querySelector('.learning-card-art')!.getBoundingClientRect().bottom,
      title: el.querySelector('h3')!.getBoundingClientRect().top,
      target: el.querySelector('a')!.getBoundingClientRect().height,
    }));
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    expect(geometry.title).toBeGreaterThan(geometry.art);
    expect(geometry.target).toBeGreaterThanOrEqual(44);
  }
  const layout = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    columns: getComputedStyle(document.querySelector('.learning-grid')!).gridTemplateColumns.split(' ').length,
    font: getComputedStyle(document.querySelector('h1')!).fontFamily,
  }));
  expect(layout.overflow).toBeLessThanOrEqual(1);
  expect(layout.columns).toBe(page.viewportSize()!.width < 621 ? 1 : page.viewportSize()!.width <= 1000 ? 2 : 3);
  expect(layout.font).toContain('Playfair Display');
  await expect(page.getByRole('link', { name: 'Xem lộ trình học Sáo trúc' })).toHaveAttribute('href', '/learn/sao');
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath('learning-full.png'), fullPage: true });
});

test('Learning loading and error retain catalogue and retry', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let fail = true;
  await page.route('**/api/courses', async route => {
    if (fail) { await gate; await route.fulfill({ status: 503, json: {} }); }
    else await route.fulfill({ json: [] });
  });
  await page.goto('/learn');
  await expect(page.getByRole('status')).toContainText('Đang cập nhật');
  await expect(page.locator('.learning-card')).toHaveCount(6);
  release();
  await expect(page.getByRole('alert')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.learning-card-footer small', { hasText: 'Chưa có khóa học đang mở' })).toHaveCount(6);
});

test('Explore and Learning reveal on scroll and respect reduced motion', async ({ page }, info) => {
  await page.route('**/api/courses', route => route.fulfill({ json: [] }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [path, selector] of [['/explore', '.ex-card'], ['/learn', '.learning-card']]) {
    await page.goto(path);
    const last = page.locator(selector).last();
    await expect(last).toHaveCSS('opacity', '0');
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveCSS('opacity', '1');
    await expect(page.locator('.topbar')).toHaveCSS('background-color', 'rgb(24, 43, 36)');
    await page.screenshot({ path: info.outputPath(`${path.slice(1)}-revealed.png`) });
    await page.evaluate(() => scrollTo(0, 0));
    await expect(last).toHaveCSS('opacity', '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator(selector).first()).toHaveCSS('opacity', '1');
    await expect(page.locator(selector).first()).toHaveCSS('transform', 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }
});
