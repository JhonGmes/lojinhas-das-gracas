import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Supabase Auth Session
        await page.route('**/auth/v1/session**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    session: {
                        user: { id: 'test-admin-id', email: 'admin@lojinha.com' },
                        access_token: 'fake-token'
                    }
                })
            });
        });

        // Mock Supabase Database call for users/nivel
        await page.route('**/rest/v1/usuarios**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: '1',
                    auth_id: 'test-admin-id',
                    email: 'admin@lojinha.com',
                    nivel: 'admin'
                })
            });
        });

        // Mock Products list for Inventory
        await page.route('**/rest/v1/products**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: '1',
                        name: 'Tesouro Mock',
                        price: 100,
                        stock: 10,
                        category: 'Test',
                        image: 'test.jpg'
                    }
                ])
            });
        });

        // Mock Store Settings
        await page.route('**/rest/v1/store_settings**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ store_name: 'Lojinha Mock' }])
            });
        });
    });

    test('should allow an admin to see the inventory', async ({ page }) => {
        // 1. Go to Admin Login (it should auto-login or we simulate input)
        await page.goto('/admin-login');

        // Fill login form
        await page.locator('input[type="email"]').fill('admin@lojinha.com');
        await page.locator('input[type="password"]').fill('admin');

        // Mock the actual sign-in call
        await page.route('**/auth/v1/token?grant_type=password', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: { id: 'test-admin-id', email: 'admin@lojinha.com' },
                    session: { access_token: 'fake' }
                })
            });
        });

        await page.getByRole('button', { name: /Entrar/i }).click();

        // 2. Should redirect to Admin Dashboard or Inventory
        await expect(page).toHaveURL(/\/admin/i, { timeout: 15000 });

        // 3. Navigate to Inventory
        await page.goto('/admin/inventory');
        await expect(page.getByRole('heading', { name: /Gerenciar Produtos/i })).toBeVisible();
    });
});
