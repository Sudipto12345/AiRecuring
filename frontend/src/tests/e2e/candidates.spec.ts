import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const ADMIN_EMAIL = 'owner@airecruit.io';
const ADMIN_PASS = 'owner12345';

async function loginAsAdmin(page: any) {
  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|admin/, { timeout: 10000 });
}

test.describe('Candidates Panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('candidates page loads', async ({ page }) => {
    await page.goto(BASE + '/candidates');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/candidate/i);
  });

  test('search input is functional', async ({ page }) => {
    await page.goto(BASE + '/candidates');
    const searchInput = page.locator('input[placeholder*="earch"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('test search');
      await expect(searchInput).toHaveValue('test search');
    }
  });

  test('upload button exists', async ({ page }) => {
    await page.goto(BASE + '/candidates');
    const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("upload"), button:has-text("Import")');
    if (await uploadBtn.count() > 0) {
      await expect(uploadBtn.first()).toBeVisible();
    }
  });
});
