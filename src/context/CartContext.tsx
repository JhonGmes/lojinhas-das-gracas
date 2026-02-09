import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, Product, Order } from '../types';
import { api } from '../services/api';
import { useStore } from './StoreContext';

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    updateQuantity: (productId: string, quantity: number) => void;
    total: number;
    checkout: (customerName: string, notes?: string) => Promise<{ success: boolean; message?: string; whatsappUrl?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { settings } = useStore();
    const [items, setItems] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem('cart');
        return stored ? JSON.parse(stored) : [];
    });

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

    const checkout = async (customerName: string, notes?: string, paymentMethod: 'pix' | 'card' = 'card') => {
        // 1. Validate Stock
        const freshProducts = await api.products.list();

        for (const item of items) {
            const productInStock = freshProducts.find(p => p.id === item.id);
            if (!productInStock) {
                return { success: false, message: `Produto ${item.name} não encontrado.` };
            }
            if (productInStock.stock < item.quantity) {
                return { success: false, message: `Estoque insuficiente para ${item.name}. Disponível: ${productInStock.stock}` };
            }
        }

        const discount = paymentMethod === 'pix' ? total * 0.05 : 0;
        const finalTotal = total - discount;

        // 2. Deduct Stock
        for (const item of items) {
            const productInStock = freshProducts.find(p => p.id === item.id)!;
            await api.products.updateStock(item.id, productInStock.stock - item.quantity);
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

        const createdOrder = await api.orders.create(order);
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
        if (discount > 0) {
            message += `Subtotal: R$ ${total.toFixed(2)}\n`;
            message += `Desconto Pix (5%): -R$ ${discount.toFixed(2)}\n`;
        }
        message += `*Total Final: R$ ${finalTotal.toFixed(2)}*\n`;
        message += `Forma de Pagamento: ${paymentMethod === 'pix' ? 'PIX' : 'Cartão'}\n`;
        message += `Cliente: ${customerName}\n`;
        if (notes) message += `Obs: ${notes}`;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        clearCart();
        return { success: true, whatsappUrl: url };
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, checkout }}>
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
