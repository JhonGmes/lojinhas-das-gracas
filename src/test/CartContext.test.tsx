import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { StoreProvider } from '../context/StoreContext';
import type { Product } from '../types';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <StoreProvider>
        <CartProvider>
            {children}
        </CartProvider>
    </StoreProvider>
);

// Mock product for testing
const mockProduct: Product = {
    id: '1',
    name: 'Terço de Madeira',
    description: 'Terço artesanal',
    price: 50,
    image: '/test.jpg',
    category: 'Terço',
    stock: 10,
};

describe('CartContext', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    it('should add product to cart', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: AllProviders,
        });

        act(() => {
            result.current.addToCart(mockProduct, 2);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].id).toBe('1');
        expect(result.current.items[0].quantity).toBe(2);
    });

    it('should calculate total correctly', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: AllProviders,
        });

        act(() => {
            result.current.addToCart(mockProduct, 2);
        });

        expect(result.current.total).toBe(100); // 50 * 2
    });

    it('should apply 5% Pix discount correctly', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: AllProviders,
        });

        act(() => {
            result.current.addToCart(mockProduct, 2);
        });

        const discount = result.current.total * 0.05;
        expect(discount).toBe(5); // 5% of 100 = 5
    });

    it('should remove product from cart', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: AllProviders,
        });

        act(() => {
            result.current.addToCart(mockProduct, 1);
        });

        expect(result.current.items).toHaveLength(1);

        act(() => {
            result.current.removeFromCart('1');
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('should update product quantity', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: AllProviders,
        });

        act(() => {
            result.current.addToCart(mockProduct, 1);
        });

        act(() => {
            result.current.updateQuantity('1', 5);
        });

        expect(result.current.items[0].quantity).toBe(5);
        expect(result.current.total).toBe(250); // 50 * 5
    });

    it('should clear cart', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: AllProviders,
        });

        act(() => {
            result.current.addToCart(mockProduct, 1);
        });

        expect(result.current.items).toHaveLength(1);

        act(() => {
            result.current.clearCart();
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('should persist cart to localStorage', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: AllProviders,
        });

        act(() => {
            result.current.addToCart(mockProduct, 2);
        });

        const stored = JSON.parse(localStorage.getItem('cart') || '[]');
        expect(stored).toHaveLength(1);
        expect(stored[0].id).toBe('1');
    });
});
