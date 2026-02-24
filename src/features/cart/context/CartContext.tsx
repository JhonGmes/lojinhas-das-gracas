import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../../../types'
import { toast } from 'react-hot-toast'
import { api } from '../../../services/api'
import { useStore } from '../../store/context/StoreContext'

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product, quantity: number, options?: any) => void
    removeFromCart: (productId: string, optionsJson?: string) => void
    updateQuantity: (productId: string, delta: number, optionsJson?: string) => void
    clearCart: () => void
    total: number
    couponDiscount: number
    appliedCoupon: string | null
    applyCoupon: (code: string) => Promise<boolean>
    removeCoupon: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const LS_CART = 'ljg_cart'

export function CartProvider({ children }: { children: ReactNode }) {
    const { currentStoreId } = useStore()
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem(LS_CART)
        return saved ? JSON.parse(saved) : []
    })

    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
    const [couponDiscount, setCouponDiscount] = useState(0)

    useEffect(() => {
        localStorage.setItem(LS_CART, JSON.stringify(items))
    }, [items])

    const addToCart = (product: Product, quantity: number, options?: any) => {
        const optionsJson = options ? JSON.stringify(options) : undefined

        setItems(prev => {
            const existing = prev.find(item =>
                item.id === product.id &&
                JSON.stringify(item.options) === optionsJson
            )

            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && JSON.stringify(item.options) === optionsJson)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            return [...prev, {
                ...product,
                quantity,
                options: options ? options : undefined
            }]
        })

        toast.success(`Adicionado: ${product.name}`, {
            style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #c5a059'
            },
            icon: '🛒'
        })
    }

    const removeFromCart = (productId: string, optionsJson?: string) => {
        setItems(prev => prev.filter(item =>
            !(item.id === productId && JSON.stringify(item.options) === optionsJson)
        ))
    }

    const updateQuantity = (productId: string, delta: number, optionsJson?: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === productId && JSON.stringify(item.options) === optionsJson) {
                const newQuantity = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQuantity }
            }
            return item
        }))
    }

    const clearCart = () => {
        setItems([])
        setAppliedCoupon(null)
        setCouponDiscount(0)
        localStorage.removeItem(LS_CART)
    }

    const applyCoupon = async (code: string) => {
        try {
            const coupon = await (api as any).coupons.validate(code, currentStoreId)
            if (coupon) {
                setAppliedCoupon(coupon.code)
                setCouponDiscount(coupon.discount_value)
                return true
            }
            return false
        } catch (error) {
            console.error('Error applying coupon:', error)
            return false
        }
    }

    const removeCoupon = () => {
        setAppliedCoupon(null)
        setCouponDiscount(0)
    }

    const totalBeforeDiscount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = Math.max(0, totalBeforeDiscount - couponDiscount)

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            couponDiscount,
            appliedCoupon,
            applyCoupon,
            removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart error')
    return context
}
