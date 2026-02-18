import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, Product, Order, Coupon } from '../types';
import { api } from '../services/api';
import { useStore } from './StoreContext';
import { toast } from 'react-hot-toast';

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    updateQuantity: (productId: string, quantity: number) => void;
    total: number;
    couponDiscount: number;
    appliedCoupon: Coupon | null;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => void;
    checkout: (customerName: string, notes?: string, paymentMethod?: 'pix' | 'card') => Promise<{ success: boolean; message?: string; whatsappUrl?: string; orderId?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { settings, currentStoreId } = useStore();
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem('cart');
            if (stored) {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.error('Erro ao ler carrinho do localStorage:', error);
        }
        return [];
    });
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);



    const addToCart = (product: Product, quantity: number) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
        toast.success(`${product.name} adicionado ao carrinho!`, {
            style: {
                fontSize: '10px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                borderRadius: '2px',
                background: '#2d2a28',
                color: '#fff',
                border: '1px solid #d4af37'
            },
            iconTheme: {
                primary: '#d4af37',
                secondary: '#fff',
            },
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((acc, item) => {
        const price = item.promotionalPrice || item.price;
        return acc + (price * item.quantity);
    }, 0);

    const couponDiscount = appliedCoupon ? (
        appliedCoupon.type === 'percentage'
            ? total * (appliedCoupon.value / 100)
            : appliedCoupon.value
    ) : 0;

    const applyCoupon = async (code: string) => {
        const coupons = await api.coupons.list(currentStoreId);
        const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);

        if (!coupon) return { success: false, message: 'Cupom inválido ou expirado.' };

        if (coupon.minSpend && total < coupon.minSpend) {
            return { success: false, message: `O valor mínimo para este cupom é R$ ${coupon.minSpend}` };
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { success: false, message: 'Este cupom já atingiu o limite de uso.' };
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return { success: false, message: 'Este cupom expirou.' };
        }

        setAppliedCoupon(coupon);
        return { success: true, message: 'Cupom aplicado!' };
    };

    const removeCoupon = () => setAppliedCoupon(null);

    const checkout = async (customerName: string, notes?: string, paymentMethod: 'pix' | 'card' = 'card') => {
        // 1. Validate Stock
        const freshProducts = await api.products.list(currentStoreId);

        for (const item of items) {
            const productInStock = freshProducts.find(p => p.id === item.id);
            if (!productInStock) {
                return { success: false, message: `Produto ${item.name} não encontrado.` };
            }
            if (productInStock.stock < item.quantity) {
                return { success: false, message: `Estoque insuficiente para ${item.name}. Disponível: ${productInStock.stock}` };
            }
        }

        const pixDiscount = paymentMethod === 'pix' ? (total - couponDiscount) * 0.05 : 0;
        const finalTotal = total - couponDiscount - pixDiscount;

        // 2. Deduct Stock & Increment Coupon
        for (const item of items) {
            const productInStock = freshProducts.find(p => p.id === item.id)!;
            await api.products.updateStock(item.id, productInStock.stock - item.quantity);
        }

        if (appliedCoupon) {
            await api.coupons.update({ ...appliedCoupon, usageCount: appliedCoupon.usageCount + 1 });
        }

        // 3. Create Order
        const order: Order = {
            id: crypto.randomUUID().slice(0, 8),
            customerName,
            items: [...items],
            total: finalTotal,
            status: 'pending',
            createdAt: new Date().toISOString(),
            notes: `${notes || ''} | Pagamento: ${paymentMethod}`
        };

        const createdOrder = await api.orders.create(order, currentStoreId);
        const displayId = createdOrder && 'orderNumber' in createdOrder
            ? String(createdOrder.orderNumber).padStart(4, '0')
            : order.id;

        // 4. Generate WhatsApp Message
        const phone = settings.whatsapp_number;
        let message = `*Pedido #${displayId}*\n`;
        message += `----------------\n`;
        items.forEach(item => {
            const price = item.promotionalPrice || item.price;
            message += `${item.quantity}x ${item.name} - R$ ${(price * item.quantity).toFixed(2)}\n`;
        });
        message += `----------------\n`;
        if (couponDiscount > 0) {
            message += `Cupom (${appliedCoupon?.code}): -R$ ${couponDiscount.toFixed(2)}\n`;
        }
        if (pixDiscount > 0) {
            message += `Desconto Pix (5%): -R$ ${pixDiscount.toFixed(2)}\n`;
        }
        message += `*Total Final: R$ ${finalTotal.toFixed(2)}*\n`;
        message += `Forma de Pagamento: ${paymentMethod === 'pix' ? 'PIX' : 'Cartão'}\n`;
        message += `Cliente: ${customerName}\n`;
        if (notes) message += `Obs: ${notes}`;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        return {
            success: true,
            whatsappUrl: url,
            orderId: displayId
        };
    };

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity,
            clearCart, total, couponDiscount, appliedCoupon,
            applyCoupon, removeCoupon, checkout
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
