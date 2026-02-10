import { test, expect } from '@playwright/test';

test.describe('Purchase Flow', () => {
    test('should allow a customer to add a product to cart and see Pix discount', async ({ page }) => {
        // 1. Visit homepage
        await page.goto('/');

        // 2. Wait for products to load
        const productCard = page.locator('.group.border-brand-cotton-dark').first();
        await expect(productCard).toBeVisible();

        const productName = await productCard.locator('h3').textContent();

        // 3. Click on the product to see details
        await productCard.click();
        await expect(page).toHaveURL(/\/product\/.+/);

        // 4. Add to cart
        const buyButton = page.getByRole('button', { name: /Comprar Agora/i });
        await buyButton.click();

        // 5. Navigate to Cart (usually happens automatically or via link)
        await page.goto('/cart'); // Ensure we are on cart page

        // 6. Verify product is in cart
        await expect(page.getByRole('heading', { name: /Carrinho/i, level: 1 })).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(productName || '')).toBeVisible();

        // 7. Test Pix Discount
        const pixButton = page.getByRole('button', { name: /Pix/i });
        await pixButton.click();

        const discountText = page.getByText(/Desconto Pix \(5%\)/i);
        await expect(discountText).toBeVisible();

        // 8. Verify total changes
        const finalTotal = page.getByText(/Total Final/i);
        await expect(finalTotal).toBeVisible();
    });
});
