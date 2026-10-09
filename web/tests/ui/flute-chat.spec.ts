import { test, expect } from '@playwright/test';

async function setup(page: import('@playwright/test').Page, signedIn = true, mode = 'Demo') {
  if (signedIn) await page.addInitScript(() => localStorage.setItem('vrhythm_web_auth', JSON.stringify({ userId: 1, fullName: 'Người học', email: 'learner@example.test', role: 'Learner', token: 'fixture-only', expiresAt: '2099-01-01T00:00:00Z' })));
  await page.route('**/api/courses', route => route.fulfill({ json: [] }));
  await page.route('**/api/courses/learning', route => route.fulfill({ json: [] }));
  await page.route('**/api/chat/status', route => route.fulfill({ json: { mode } }));
  await page.goto('/learn');
}
const reply = { answer: 'Luyện từng đoạn chậm và giữ hơi đều trước khi chuyển nốt.', status: 'Answered', sources: [{ id: 'lesson:1', title: 'Luyện hơi đều', url: '/lesson/1/chapter/1/lesson/1' }], cached: false, promptTokens: 180, completionTokens: 40 };

test('Flute chat stays collapsed, asks with sources and fits each viewport', async ({ page }, info) => {
  await setup(page);
  await expect(page.getByRole('complementary', { name: 'Hỏi về sáo trúc' })).toHaveCount(0);
  let submitted: Record<string, unknown> = {};
  await page.route('**/api/chat/messages', route => { submitted = route.request().postDataJSON(); return route.fulfill({ json: reply }); });
  await page.getByRole('button', { name: 'Hỏi về sáo', exact: true }).click();
  await expect(page.getByLabel('Câu hỏi của bạn')).toBeFocused();
  await page.getByLabel('Câu hỏi của bạn').fill('Giữ hơi đều khi chuyển nốt thế nào?');
  await page.getByRole('button', { name: 'Gửi câu hỏi' }).click();
  await expect(page.getByRole('log')).toContainText(reply.answer);
  expect(Object.keys(submitted)).toEqual(['question']);
  await expect(page.getByRole('link', { name: 'Luyện hơi đều' })).toHaveAttribute('href', reply.sources[0].url);
  const geometry = await page.locator('.flute-chat-panel').evaluate(el => {
    const box = el.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, height: innerHeight, width: innerWidth,
      overflow: document.documentElement.scrollWidth - innerWidth,
      targets: [...el.querySelectorAll('button,a')].every(target => target.getBoundingClientRect().height >= 44),
      font: getComputedStyle(el.querySelector('h2')!).fontFamily };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(0); expect(geometry.right).toBeLessThanOrEqual(geometry.width);
  expect(geometry.top).toBeGreaterThanOrEqual(88); expect(geometry.bottom).toBeLessThanOrEqual(geometry.height);
  expect(geometry.overflow).toBeLessThanOrEqual(1); expect(geometry.targets).toBe(true);
  expect(geometry.font).toContain('Playfair Display');
  await page.screenshot({ path: info.outputPath('flute-chat.png') });
  await page.getByLabel('Câu hỏi của bạn').press('Escape');
  await expect(page.getByRole('button', { name: 'Hỏi về sáo', exact: true })).toBeFocused();
});

test('Flute chat keeps failed questions retryable and shows missing sources honestly', async ({ page }) => {
  await setup(page);
  let fail = true;
  await page.route('**/api/chat/messages', route => route.fulfill(fail ? { status: 429, json: { message: 'Model miễn phí đang hết hạn mức. Vui lòng thử lại sau.' } } : { json: { ...reply, answer: 'Chưa tìm thấy tài liệu phù hợp.', status: 'NoSources', sources: [] } }));
  await page.getByRole('button', { name: 'Hỏi về sáo', exact: true }).click();
  await page.getByLabel('Câu hỏi của bạn').fill('Câu hỏi ngoài tài liệu');
  await page.getByRole('button', { name: 'Gửi câu hỏi' }).click();
  await expect(page.locator('.flute-chat').getByRole('alert')).toContainText('hết hạn mức');
  await expect(page.getByLabel('Câu hỏi của bạn')).toHaveValue('Câu hỏi ngoài tài liệu');
  fail = false;
  await page.getByRole('button', { name: 'Gửi câu hỏi' }).click();
  await expect(page.getByRole('log')).toContainText('Chưa tìm thấy tài liệu phù hợp.');
  await expect(page.locator('.flute-chat-turn a')).toHaveCount(0);
});

test('Flute chat asks guests to sign in before sending any question', async ({ page }) => {
  await setup(page, false);
  let calls = 0;
  await page.route('**/api/chat/messages', route => { calls++; return route.fulfill({ json: reply }); });
  await page.getByRole('button', { name: 'Hỏi về sáo', exact: true }).click();
  await page.getByRole('button', { name: 'Đăng nhập để hỏi' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(calls).toBe(0);
});

test('Flute chat unavailable state offers packages without a pretend conversation', async ({ page }) => {
  await setup(page, true, 'Unavailable');
  await page.getByRole('button', { name: 'Hỏi về sáo', exact: true }).click();
  await expect(page.locator('.flute-chat-compose')).toContainText('Chat Plus chưa mở');
  await expect(page.getByLabel('Câu hỏi của bạn')).toHaveCount(0);
  await expect(page.locator('.flute-chat-compose a')).toHaveAttribute('href', '/packages');
});
