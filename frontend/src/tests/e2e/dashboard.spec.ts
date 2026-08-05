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

test.describe('Dashboard Panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('dashboard loads with stats', async ({ page }) => {
    await page.goto(BASE + '/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/dashboard|welcome/i);
  });

  test('navigation sidebar is visible', async ({ page }) => {
    await page.goto(BASE + '/dashboard');
    await expect(page.locator('nav, [role="navigation"], aside')).toBeVisible();
  });
});
