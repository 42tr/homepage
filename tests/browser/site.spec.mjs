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
