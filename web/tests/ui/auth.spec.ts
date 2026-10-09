import { test, expect } from '@playwright/test';

const auth = { userId: 7, fullName: 'Người học', email: 'learner@example.com', role: 'Learner', token: 'test-fixture', expiresAt: '2099-01-01T00:00:00Z' };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/providers', route => route.fulfill({ json: { googleClientId: 'test-client' } }));
  await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({ contentType: 'application/javascript', body: `
    let callback;
    window.google = { accounts: { id: {
      initialize: options => { callback = options.callback; },
      renderButton: element => {
        const button = document.createElement('button');
        button.textContent = 'Tiếp tục với Google';
        button.onclick = () => callback({ credential: 'signed-test-fixture' });
        element.appendChild(button);
      }
    } } };
  ` }));
  await page.route('**/api/courses', route => route.fulfill({ json: [] }));
});

test('Auth Google sends credential only and restores learning destination', async ({ page }, info) => {
  let submitted: unknown;
  await page.route('**/api/auth/google', async route => { submitted = route.request().postDataJSON(); await route.fulfill({ json: auth }); });
  await page.goto('/login');
  await page.evaluate(() => sessionStorage.setItem('vrhythm_return_to', '/learn/sao'));
  await expect(page.getByRole('button', { name: 'Tiếp tục với Google' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: info.outputPath('auth-google.png'), fullPage: true });
  await page.getByRole('button', { name: 'Tiếp tục với Google' }).click();
  await expect(page).toHaveURL(/\/learn\/sao$/);
  expect(submitted).toEqual({ credential: 'signed-test-fixture' });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vrhythm_web_auth')!).role)).toBe('Learner');
});

test('Auth registration matches backend password contract and displays errors', async ({ page }) => {
  let submitted: Record<string, string> = {};
  await page.route('**/api/auth/register', async route => { submitted = route.request().postDataJSON(); await route.fulfill({ status: 400, json: { message: 'Email đã được đăng ký.' } }); });
  await page.goto('/register');
  await page.getByLabel('Họ và tên').fill('Người học');
  await page.getByLabel('Email', { exact: true }).fill('learner@example.com');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).last().click();
  await expect(page.getByRole('alert')).toHaveText('Email đã được đăng ký.');
  expect(submitted.confirmPassword).toBe('password123');
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('learner@example.com');
});

test('Auth expired session is cleared and failed Google login remains on form', async ({ page }) => {
  await page.addInitScript(value => localStorage.setItem('vrhythm_web_auth', JSON.stringify({ ...value, expiresAt: '2000-01-01T00:00:00Z' })), auth);
  await page.route('**/api/auth/google', route => route.fulfill({ status: 401, json: { message: 'Đăng nhập Google đã hết hạn.' } }));
  await page.goto('/login');
  expect(await page.evaluate(() => localStorage.getItem('vrhythm_web_auth'))).toBeNull();
  await page.getByRole('button', { name: 'Tiếp tục với Google' }).click();
  await expect(page.getByRole('alert')).toHaveText('Đăng nhập Google đã hết hạn.');
  await expect(page).toHaveURL(/\/login$/);
});
