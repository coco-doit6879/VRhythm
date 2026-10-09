import { test, expect } from '@playwright/test';

test('Flute chat browser uses isolated real API for identity, retrieval and cache', async ({ page }, info) => {
  test.skip(process.env.VRHYTHM_BROWSER_CHAT !== '1', 'Requires isolated SQLite API bridge on port 5206; deterministic model');
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('learner@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('browser-fixture-password');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).last().click();
  await expect(page).toHaveURL(/\/learn$/);
  await page.getByRole('button', { name: 'Hỏi về sáo', exact: true }).click();
  for (const cached of [false, true]) {
    await page.getByLabel('Câu hỏi của bạn').fill(`Cách luyện hơi đều (${info.project.name})`);
    const response = page.waitForResponse(res => res.url().endsWith('/api/chat/messages') && res.request().method() === 'POST');
    await page.getByRole('button', { name: 'Gửi câu hỏi' }).click();
    const result = await (await response).json();
    expect(result.status).toBe('Answered');
    expect(result.cached).toBe(cached);
    expect(result.sources.length).toBeGreaterThan(0);
    await expect(page.getByRole('log')).toContainText('Luyện chậm và giữ hơi đều.');
    await expect(page.getByLabel('Câu hỏi của bạn')).toHaveValue('');
  }
  await expect(page.locator('.flute-chat-turn')).toHaveCount(2);
});
