import { test, expect } from '@playwright/test';

test('Auth API registration validates confirmation and sends complete contract', async ({ page }, info) => {
  let payload: any;
  await page.route('**/api/courses/learning', r => r.fulfill({ json: { success: true, data: [] } }));
  await page.route('**/api/auth/register', async r => {
    payload = r.request().postDataJSON();
    expect(r.request().headers().authorization).toBeUndefined();
    await r.fulfill({ json: { success: true, data: { userId: 7, fullName: payload.fullName, email: payload.email, role: 'Learner', token: 'fixture-token' } } });
  });
  await page.goto('/register');
  await page.getByLabel('Họ và tên').fill('Người học thử');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Example123!');
  await page.getByLabel('Xác nhận mật khẩu').fill('Mismatch123!');
  await page.locator('form button').click();
  await expect(page.getByRole('alert')).toContainText('chưa khớp');
  expect(payload).toBeUndefined();
  await expect(page.locator('.social-button')).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const input of await page.locator('form input').all()) expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({ path: info.outputPath('register-validation.png'), fullPage: true });
  await page.getByLabel('Xác nhận mật khẩu').fill('Example123!');
  await page.locator('form button').click();
  await expect(page).toHaveURL(/\/learn$/);
  expect(payload).toEqual({ fullName: 'Người học thử', email: 'test@example.com', password: 'Example123!', confirmPassword: 'Example123!' });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vrhythm_web_auth')!).token)).toBe('fixture-token');
});

test('Auth API rejects validation errors failed envelopes and missing sessions', async ({ page }) => {
  let mode = 'validation';
  await page.route('**/api/auth/login', r => r.fulfill({ status: mode === 'validation' ? 400 : 200, json: mode === 'validation' ? { errors: { Email: ['Email chưa hợp lệ.'] } } : mode === 'failure' ? { success: false, message: 'Không thể đăng nhập.' } : { success: true, data: { userId: 1 } } }));
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Example123!');
  for (const [state, message] of [['validation', 'Email chưa hợp lệ.'], ['failure', 'Không thể đăng nhập.'], ['session', 'chưa cấp phiên']]) {
    mode = state;
    await page.locator('form button').click();
    await expect(page.getByRole('alert')).toContainText(message);
    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('vrhythm_web_auth'))).toBeNull();
  }
});
