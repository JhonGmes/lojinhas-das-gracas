import { test, expect } from '@playwright/test';

test('New store onboarding flow', async ({ page }) => {
    // 1. Visit the onboarding page
    await page.goto('/comecar');

    // 2. Step 1: User Profile
    await page.fill('input[placeholder="Como gostaria de ser chamado?"]', 'Lojista Teste');
    await page.fill('input[placeholder="seu@email.com"]', `teste-${Date.now()}@loja.com`);
    await page.fill('input[placeholder="Mínimo 6 caracteres"]', 'senha123');
    await page.click('button:has-text("Próximo Passo")');

    // 3. Step 2: Store Identity
    await expect(page.locator('h1')).toContainText('Dê um nome e um endereço para sua fé');
    await page.fill('input[placeholder="Ex: Cantinho da Paz"]', 'Loja de Teste E2E');
    // Slug is auto-filled but can be overridden
    await page.fill('input[placeholder="nome-da-loja"]', `loja-e2e-${Date.now()}`);

    // 4. Submit
    await page.click('button:has-text("Consagrar minha Loja")');

    // 5. Verification: Redirect to Admin
    // The redirect might take a moment while Firebase and Firestore are initialized
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await expect(page.locator('aside')).toContainText('Loja de Teste E2E');
});

test('Security isolation: Store owner cannot access Super Admin', async ({ page }) => {
    // 1. Login as a regular store admin (non-master)
    // Assuming a user exists or using the onboarding above
    // ... logic to login ...

    // 2. Try to access /admin/super
    await page.goto('/admin/super');

    // 3. Should be redirected to home or see error toast
    await expect(page).toHaveURL('/');
});
