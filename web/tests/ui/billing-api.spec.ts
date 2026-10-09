import { test, expect } from '@playwright/test';

test('Billing browser uses real isolated API for login, order and demo result', async ({ page }) => {
  test.skip(process.env.VRHYTHM_BROWSER_BILLING !== '1', 'Requires isolated backend bridge on loopback port 5206');
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('learner@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('browser-fixture-password');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).last().click();
  await expect(page).toHaveURL(/\/learn$/);
  await page.goto('/packages');
  await expect(page.locator('.package-option').last()).toContainText('59.000đ');
  await page.getByRole('button', { name: 'Thử thanh toán', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Chờ thử thanh toán' })).toBeVisible();
  await page.getByRole('button', { name: 'Thử thành công', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Đã hoàn tất lượt thử' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Đã hoàn tất lượt thử' })).toBeVisible();
  await page.getByRole('link', { name: 'Tiếp tục học sáo trúc' }).click();
  await expect(page.getByRole('button', { name: 'Xem gói Plus' })).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Vào học', exact: true })).toHaveCount(0);
});
