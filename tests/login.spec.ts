import { test, expect } from '@playwright/test';

test('connexion administrateur', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('E-mail').fill('admin.dev@elyzen.fr');
  await page.getByLabel('Mot de passe').fill('Admin123!');

  await page.getByRole('button', { name: /se connecter/i }).click();

  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
});

test('connexion refusée avec un mauvais mot de passe', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('E-mail').fill('admin.dev@elyzen.fr');
  await page.getByLabel('Mot de passe').fill('MotDePasseFaux');

  await page.getByRole('button', { name: /se connecter/i }).click();

  await expect(page).toHaveURL(/\/?$/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: /connexion pour admin/i })).toBeVisible();
});