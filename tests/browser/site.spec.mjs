import { test, expect } from '@playwright/test';

test('home content is visible without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL);
  await expect(page.locator('h1')).toContainText('42tr');
  await expect(page.locator('.leetcode-card')).toContainText('已解答');
  await expect(page.locator('#skill-details')).toContainText('Rust');
  await context.close();
});

test('clock updates and skills toggle without framework hydration', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.clock-card .time')).toHaveText(/\d{2}:\d{2}:\d{2}/);
  const before = await page.locator('.clock-card .time').textContent();
  await expect(page.locator('.clock-card .time')).not.toHaveText(before, { timeout: 3000 });
  await page.locator('[data-skill-toggle]').click();
  await expect(page.locator('#skill-details')).toBeHidden();
  await expect(page.locator('.skill-summary')).toBeVisible();
  await page.locator('[data-skill-toggle]').click();
  await expect(page.locator('#skill-details')).toBeVisible();
  expect(await page.locator('astro-island').count()).toBe(0);
  expect(errors).toEqual([]);
});

const snapshot = {
  user_slug: 'U72xhfFR3l', updated_at: '2026-10-02T00:00:00.000Z', site_ranking: 1, rating: 2000,
  global_ranking: 7, global_total_participants: 70, local_ranking: 3, local_total_participants: 30,
  submission_calendar: '{"1":2}', question_total: 200, question_solved: 100,
};

test('leetcode card adopts the backend snapshot', async ({ page }) => {
  await page.route('**/api/leetcode', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(snapshot) }));
  await page.goto('/');
  const card = page.locator('.leetcode-card');
  await expect(card.locator('[data-leetcode="rating"]')).toHaveText('2000');
  await expect(card.locator('[data-leetcode="global_ranking"]')).toHaveText('7');
  await expect(card.locator('[data-leetcode="local_total_participants"]')).toHaveText('30');
  await expect(card.locator('[data-leetcode="questions"]')).toHaveText('100 / 200');
  await expect(card.locator('[data-leetcode-updated]')).toContainText('2026');
  expect(await card.locator('[data-leetcode-fill]').evaluate((fill) => fill.style.width)).toBe('50%');
  expect(await card.locator('[data-leetcode-ring]').getAttribute('stroke-dasharray')).toMatch(/^217\.8/);
});

test('leetcode card rejects an invalid backend snapshot', async ({ page }) => {
  await page.route('**/api/leetcode', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...snapshot, question_total: 0 }) }));
  await page.goto('/');
  await expect(page.locator('.leetcode-card [data-leetcode="questions"]')).not.toHaveText('100 / 200');
});

test('leetcode card keeps build-time data when the backend is unavailable', async ({ page }) => {
  await page.route('**/api/leetcode', (route) => route.abort());
  await page.goto('/');
  const card = page.locator('.leetcode-card');
  await expect(card).toContainText('已解答');
  await expect(card.locator('[data-leetcode="rating"]')).toHaveText(/^\d+$/);
  await expect(card.locator('[data-leetcode="questions"]')).toHaveText(/^\d+ \/ \d+$/);
});
test('resume print button works and PDF uses one A4 page', async ({ page }) => {
  await page.goto('/resume');
  await page.evaluate(() => { window.print = () => { window.printCalled = true; }; });
  await page.locator('[data-print-resume]').click();
  expect(await page.evaluate(() => window.printCalled)).toBe(true);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-resume')).toBeVisible();
  const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
  // The page tree's Count records physical PDF pages.
  expect(pdf.toString('latin1')).toMatch(/\/Type\s*\/Pages[\s\S]*?\/Count\s+1\b/);
});

for (const width of [390, 1440]) {
  test(`pages fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/resume', '/blog', '/blog/posts/post-56']) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBe(true);
      expect(await page.locator('img').evaluateAll((images) => images.filter((image) => image.complete && !image.naturalWidth).map((image) => image.src)), path).toEqual([]);
    }
  });
}

test('blog lists and article pages show live reading counts', async ({ page }) => {
  await page.goto('/blog');
  const listingCounter = page.locator('[data-blog-views="post-56"]');
  await expect(listingCounter).toBeVisible();
  await expect(listingCounter).toHaveText(/[\d,]+ 次浏览/);
  await page.goto('/blog/posts/post-56');
  await expect(page.locator('.detail-views')).toBeVisible();
  await expect(page.locator('.detail-views')).toHaveText(/[\d,]+ 次浏览/);
});

test('blog content stays readable if the counter is unavailable', async ({ page }) => {
  await page.route('**/api/blog/views', (route) => route.abort());
  await page.goto('/blog/posts/post-56');
  await expect(page.locator('.detail-title')).toBeVisible();
  await expect(page.locator('.markdown-body')).toBeVisible();
  await expect(page.locator('.detail-views')).toBeHidden();
});
