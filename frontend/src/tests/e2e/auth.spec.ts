import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const ADMIN_EMAIL = 'owner@airecruit.io';
const ADMIN_PASS = 'owner12345';

test.describe('Authentication Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto(BASE + '/login');
    await expect(page.locator('h1, [data-testid="login-title"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });
    await expect(page).not.toHaveURL(/login/);
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"], .error, [data-error]')).toBeVisible({ timeout: 5000 });
  });

  test('register page loads', async ({ page }) => {
    await page.goto(BASE + '/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
