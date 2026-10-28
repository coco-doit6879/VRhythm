import { test, expect } from '@playwright/test';

test('Packages editorial layout, typography, no AI icons and touch targets', async ({ page }, testInfo) => {
  await page.route('**/api/billing/packages', route => route.fulfill({
    json: [
      {
        id: 1,
        code: 'free-starter',
        name: 'Học Miễn Phí',
        price: 0,
        billingCycle: 'Vĩnh viễn',
        description: 'Khám phá các nốt nhạc đầu tiên',
        features: ['Khóa học nhập môn nền tảng', 'Luyện phát âm nốt cơ bản'],
        isPopular: false,
      },
      {
        id: 2,
        code: 'flute-plus',
        name: 'Gói Chuyên Sâu (Plus)',
        price: 59000,
        billingCycle: '30 ngày',
        description: 'Mở khóa trọn vẹn toàn bộ hệ thống nhạc cụ dân tộc',
        features: ['Mở khóa toàn bộ khóa nâng cao', 'Chấm điểm AI Pitch Detector'],
        isPopular: true,
      },
    ],
  }));
  await page.goto('/packages');
  await page.evaluate(() => document.fonts.ready);

  // Check heading text and the editorial serif font family
  const h1 = page.locator('#packages-title');
  await expect(h1).toBeVisible();
  await expect(h1).toContainText('Chinh phục nhạc cụ');
  await expect(h1).toContainText('cùng VRhythm Premium');
  expect(await h1.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Playfair Display');

  // Verify no AI icons (lucide-sparkles or robot emoji)
  await expect(page.locator('.lucide-sparkles')).toHaveCount(0);
  const pageText = await page.locator('.packages-page').innerText();
  expect(pageText).not.toContain('🤖');

  // Verify navigation active state
  await expect(page.locator('.nav button[aria-current=page]')).toHaveText('Gói học');

  // Verify pricing cards are present
  await expect(page.locator('.package-card')).toHaveCount(2);
  await expect(page.locator('#package-free')).toBeVisible();
  await expect(page.locator('#package-premium')).toBeVisible();

  // Verify comparison table
  await expect(page.locator('.packages-compare-table')).toBeVisible();

  // Verify touch targets and no horizontal overflow
  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    smallTargets: [...document.querySelectorAll('.packages-card-btn, .packages-closing .primary, .packages-back-link')].filter(el => el.getBoundingClientRect().height < 44).length,
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.smallTargets).toBe(0);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('packages-full.png'), fullPage: true });
});
