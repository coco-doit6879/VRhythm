import { test, expect, type Page, type TestInfo } from '@playwright/test';

const names = [['nguyet','Đàn nguyệt'],['tyba','Đàn tỳ bà'],['nhi','Đàn nhị'],['bau','Đàn bầu'],['sao','Sáo trúc'],['tranh','Đàn tranh']];
const lessonTypes = ['Theory', 'Video', 'Quiz', 'Practical'];
const course = (instrument = 'Sáo trúc') => ({ id: 91, title: `Nhập môn ${instrument}`, instrument, description: 'Bắt đầu từ tư thế, cách tạo âm và những nốt nhạc đầu tiên.', accessType: 'Free', isEnrolled: true, isUnlocked: true, isCompleted: false, chapters: [{ id: 11, title: 'Những bước đầu tiên', sortOrder: 1, lessons: lessonTypes.map((type, i) => ({ id: 101+i, title: `${type} · Làm quen thanh âm`, type, sortOrder: i, isCompleted: false })) }, { id: 12, title: 'Luyện tập giai điệu', sortOrder: 2, lessons: [] }] });

async function audit(page: Page, info: TestInfo, name: string) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.app-shell')).toHaveCSS('background-color', 'rgb(24, 43, 36)');
  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    font: document.querySelector('h1') ? getComputedStyle(document.querySelector('h1')!).fontFamily : '',
    targets: [...document.querySelectorAll('main .primary, main input, main summary')].filter(el => el.getBoundingClientRect().width > 0 && !(el instanceof HTMLInputElement && ['radio','checkbox'].includes(el.type))).every(el => el.getBoundingClientRect().height >= 44),
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  if (geometry.font) expect(geometry.font).toContain('Playfair Display');
  expect(geometry.targets).toBe(true);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
}

test('Consistency instrument learning covers all six populated roadmaps', async ({ page }, testInfo) => {
  let name = 'Sáo trúc';
  await page.route('**/api/courses', route => route.fulfill({ json: [course(name)] }));
  await page.route('**/api/courses/91', route => route.fulfill({ json: course(name) }));
  for (const [id, instrument] of names) {
    name = instrument;
    await page.goto(`/learn/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Học ${instrument.toLocaleLowerCase('vi')}`);
    await expect(page.locator('.course-overview')).toHaveCount(1);
    await expect(page.locator('.instrument-page-hero')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.course-roadmap details')).toHaveCount(2);
    await page.getByText('Chương 2 · Luyện tập giai điệu').click();
    await expect(page.locator('.course-roadmap details').last()).toHaveAttribute('open', '');
    await expect(page.getByRole('button', { name: 'Vào học', exact: true })).toBeVisible();
    await expect.poll(() => page.locator('.instrument-page-hero img').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await audit(page, testInfo, `learn-${id}`);
  }
});

test('Consistency learning empty error and async scroll reveal', async ({ page }, testInfo) => {
  let mode = 'empty';
  await page.route('**/api/courses', route => route.fulfill({ status: mode === 'error' ? 503 : 200, json: mode === 'course' ? [course()] : [] }));
  await page.route('**/api/courses/91', route => route.fulfill({ json: { ...course(), isEnrolled: false, isUnlocked: false } }));
  await page.goto('/learn/sao');
  await expect(page.getByRole('heading', { name: 'Chưa có khóa học đang mở' })).toBeVisible();
  await audit(page, testInfo, 'empty-course');
  mode = 'error'; await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
  await audit(page, testInfo, 'error-course');
  mode = 'course';
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await page.locator('.course-overview').scrollIntoViewIfNeeded();
  await expect(page.locator('.course-overview')).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'Đăng nhập để đăng ký học' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('Consistency account pages and profile states', async ({ page }, testInfo) => {
  for (const path of ['/login', '/register', '/profile']) {
    await page.goto(path);
    if (path !== '/profile') await expect(page.locator('.social-button')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await audit(page, testInfo, path.slice(1));
  }
  await page.evaluate(() => localStorage.setItem('vrhythm_web_auth', JSON.stringify({ userId: 1, fullName: 'Nguyễn Minh An', email: 'minhan@example.com', role: 'Learner', token: 'test-fixture-only' })));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Nguyễn Minh An' })).toBeVisible();
  await audit(page, testInfo, 'profile-signed-in');
});

test('Consistency all four lesson formats and locked lesson', async ({ page }, testInfo) => {
  let unlocked = true;
  await page.route('**/api/courses/91', route => route.fulfill({ json: { ...course(), isUnlocked: unlocked } }));
  await page.route('**/api/lessons/101', route => route.fulfill({ json: { id: 101, title: 'Làm quen thanh âm', type: 'Theory', theory: { content: 'Lắng nghe âm thanh và giữ tư thế thoải mái.\nLuyện tập chậm, đều đặn theo nhịp của bạn.' } } }));
  await page.route('**/api/lessons/102', route => route.fulfill({ json: { id: 102, title: 'Quan sát cách tạo âm', type: 'Video', video: { content: 'Quan sát và luyện tập theo hướng dẫn.' } } }));
  await page.route('**/api/lessons/102/video-url?*', route => route.fulfill({ json: '' }));
  await page.route('**/api/quizzes/103', route => route.fulfill({ json: { title: 'Kiến thức nhập môn', passPercentage: 70, questions: [{ id: 1, prompt: 'Nên bắt đầu luyện tập như thế nào?', options: [{ id: 1, text: 'Chậm và đều đặn' }, { id: 2, text: 'Nhanh nhất có thể' }] }] } }));
  await page.route('**/api/practical/104', route => route.fulfill({ json: { title: 'Luyện nốt đầu tiên', expectedNotes: [{ sortOrder: 0, note: 'C4' }, { sortOrder: 1, note: 'D4' }] } }));
  for (const [i, type] of lessonTypes.entries()) {
    await page.goto(`/lesson/91/chapter/11/lesson/${101+i}`);
    await expect(page.locator('.practice-card')).toBeVisible();
    await page.locator('.lesson-sidebar summary').click();
    if (type === 'Quiz') {
      await page.getByLabel('Chậm và đều đặn').check();
      await expect(page.getByRole('button', { name: 'Nộp bài' })).toBeEnabled();
    }
    await audit(page, testInfo, `lesson-${type}`);
  }
  unlocked = false;
  await page.goto('/lesson/91/chapter/11/lesson/101');
  await expect(page.getByRole('alert')).toContainText('mở khóa');
  await audit(page, testInfo, 'lesson-locked');
});
