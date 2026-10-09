import { test, expect } from '@playwright/test';

const packages = [
  { code: 'flute-free', name: 'Miễn phí', amountVnd: 0, accessDays: 0, checkoutMode: 'Free', courses: [{ id: 1, title: 'Luyện nốt đầu tiên', accessType: 'Free' }] },
  { code: 'flute-plus', name: 'Plus', amountVnd: 59000, accessDays: 30, checkoutMode: 'Demo', courses: [{ id: 2, title: 'Hơi đều và chuyển nốt', accessType: 'Paid' }, { id: 3, title: 'Luyện câu nhạc', accessType: 'Paid' }] },
];
const order = { id: 'ba15f81a-ef11-4f57-b0cc-a3da9a7384bd', packageCode: 'flute-plus', amountVnd: 59000, accessDays: 30, status: 'Pending', isDemo: true, createdAt: new Date().toISOString(), expiresAt: '2099-01-01T00:00:00Z' };

async function signedIn(page: import('@playwright/test').Page) {
  await page.addInitScript(() => localStorage.setItem('vrhythm_web_auth', JSON.stringify({ userId: 7, fullName: 'Người học', email: 'learner@example.test', role: 'Learner', token: 'fixture-only', expiresAt: '2099-01-01T00:00:00Z' })));
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/billing/packages', route => route.fulfill({ json: packages }));
});

test('Packages price, copy, geometry and anonymous login stay simple', async ({ page }, info) => {
  await page.goto('/packages');
  await expect(page.getByRole('heading', { name: 'Plus', exact: true })).toBeVisible();
  await expect(page.locator('.package-option').last()).toContainText('59.000đ');
  await expect(page.locator('.package-option').last()).toContainText('không tự gia hạn');
  await expect(page.getByRole('link', { name: 'Học miễn phí' })).toHaveAttribute('href', '/learn/sao');
  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    columns: getComputedStyle(document.querySelector('.packages-list')!).gridTemplateColumns.split(' ').length,
    targets: [...document.querySelectorAll('.packages-page button,.packages-page a')].every(el => el.getBoundingClientRect().height >= 44),
    font: getComputedStyle(document.querySelector('h1')!).fontFamily,
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.columns).toBe(page.viewportSize()!.width <= 650 ? 1 : 2);
  expect(geometry.targets).toBe(true);
  expect(geometry.font).toContain('Playfair Display');
  await page.screenshot({ path: info.outputPath('packages.png'), fullPage: true });
  await page.getByRole('button', { name: 'Đăng nhập để thử' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem('vrhythm_return_to'))).toBe('/packages');
});

test('Packages creates priced server order and completes demo without unlock request', async ({ page }, info) => {
  await signedIn(page);
  let created = 0;
  let submitted: Record<string, unknown> = {};
  let unlocks = 0;
  await page.route('**/api/courses/*/unlock', route => { unlocks++; return route.fulfill({ status: 400, json: {} }); });
  await page.route('**/api/billing/orders', route => { created++; submitted = route.request().postDataJSON(); return route.fulfill({ json: order }); });
  await page.route('**/api/billing/orders/*/demo', route => route.fulfill({ json: { ...order, status: 'DemoSucceeded' } }));
  await page.goto('/packages');
  await page.getByRole('button', { name: 'Thử thanh toán', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Chờ thử thanh toán' })).toBeVisible();
  expect(Object.keys(submitted).sort()).toEqual(['packageCode', 'requestId']);
  expect(submitted.packageCode).toBe('flute-plus');
  expect(created).toBe(1);
  await expect(page).toHaveURL(/\?order=/);
  await page.getByRole('button', { name: 'Thử thành công', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Đã hoàn tất lượt thử' })).toBeVisible();
  await expect(page.locator('.checkout-summary')).toContainText('không cấp quyền truy cập Plus');
  expect(unlocks).toBe(0);
  await page.screenshot({ path: info.outputPath('checkout-demo-complete.png'), fullPage: true });
  await page.getByRole('button', { name: 'Chọn lại gói' }).click();
  await expect(page).toHaveURL(/\/packages$/);
  await expect(page.locator('.package-option')).toHaveCount(2);
});

test('Packages reload restores own order, cancellation and unavailable payment', async ({ page }) => {
  await signedIn(page);
  await page.route('**/api/billing/orders/*', route => route.fulfill({ json: order }));
  await page.route('**/api/billing/orders/*/demo', route => route.fulfill({ json: { ...order, status: 'Cancelled' } }));
  await page.goto(`/packages?order=${order.id}`);
  await expect(page.getByRole('heading', { name: 'Chờ thử thanh toán' })).toBeVisible();
  await page.getByRole('button', { name: 'Hủy lượt thử' }).click();
  await expect(page.getByRole('heading', { name: 'Đã hủy lượt thử' })).toBeVisible();
  await page.route('**/api/billing/packages', route => route.fulfill({ json: packages.map(item => item.checkoutMode === 'Demo' ? { ...item, checkoutMode: 'Unavailable' } : item) }));
  await page.goto('/packages');
  await expect(page.getByRole('button', { name: 'Thanh toán chưa mở' })).toBeDisabled();
});

test('Packages failed create remains retryable and failed demo stays distinct', async ({ page }) => {
  await signedIn(page);
  let fail = true;
  await page.route('**/api/billing/orders', route => route.fulfill(fail ? { status: 503, json: { message: 'Thanh toán chưa khả dụng.' } } : { json: order }));
  await page.route('**/api/billing/orders/*/demo', route => route.fulfill({ json: { ...order, status: 'Failed' } }));
  await page.goto('/packages');
  await page.getByRole('button', { name: 'Thử thanh toán', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Thanh toán chưa khả dụng.');
  fail = false;
  await page.getByRole('button', { name: 'Thử thanh toán', exact: true }).click();
  await page.getByRole('button', { name: 'Thử thất bại' }).click();
  await expect(page.getByRole('heading', { name: 'Lượt thử chưa thành công' })).toBeVisible();
});
