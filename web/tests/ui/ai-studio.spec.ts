import { test, expect } from '@playwright/test';
test('AI studio layout and anonymous library remain usable', async ({ page }, info) => {
 await page.route('**/api/ai-music/**', r => r.fulfill({json:[]}));
 await page.goto('/ai-music');
 await page.evaluate(() => document.fonts.ready);
 await expect(page.locator('.ai-studio-steps li')).toHaveCount(3);
 await expect(page.getByRole('button',{name:'Đăng nhập để tạo nhạc'})).toBeVisible();
 const layout = await page.evaluate(() => ({overflow:document.documentElement.scrollWidth-innerWidth, create:document.querySelector('.ai-music-create')!.getBoundingClientRect().toJSON(), library:document.querySelector('.ai-music-library')!.getBoundingClientRect().toJSON()}));
 expect(layout.overflow).toBeLessThanOrEqual(1);
 if(page.viewportSize()!.width<=900) expect(layout.library.top).toBeGreaterThanOrEqual(layout.create.bottom);
 else expect(layout.library.left).toBeGreaterThan(layout.create.right);
 await page.screenshot({path:info.outputPath('ai-studio.png'),fullPage:true});
});
