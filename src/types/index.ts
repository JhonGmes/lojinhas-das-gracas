export interface Product {
    id: string
    name: string
    description: string
    price: number
    promotionalPrice?: number
    image: string
    images?: string[]
    category: string
    stock: number
    isFeatured?: boolean
    createdAt?: string
    code?: string
    active?: boolean
    // Novos campos para filtros e reviews
    material?: string
    color?: string
    tags?: string[]
    total_reviews?: number
    average_rating?: number
    store_id?: string
}

export interface Review {
    id: string
    product_id: string
    order_id?: string
    customer_email: string
    customer_name: string
    rating: number
    comment?: string
    admin_response?: string
    admin_response_date?: string
    is_verified_purchase: boolean
    helpful_count: number
    created_at: string
}

export interface WishlistItem {
    id: string
    session_id: string
    user_email?: string
    product_id: string
    notify_on_sale: boolean
    notify_on_stock: boolean
    added_at: string
    product?: Product // Join com dados do produto
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    orderNumber?: number;
    customerName: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'paid' | 'delivered' | 'cancelled';
    paymentMethod: 'credit' | 'debit' | 'pix';
    createdAt: string;
    notes?: string;
    // Campos de CRM (capturados da InfinitePay)
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zipcode?: string;
    };
    transactionNsu?: string;
    infinitepayData?: any;
    store_id?: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    whatsapp?: string;
    address?: string;
    role: 'admin' | 'customer';
    store_id?: string;
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    author: string;
    image: string;
    category: string;
    isFeatured?: boolean;
    isPublished: boolean;
    store_id?: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minSpend?: number;
    usageLimit?: number;
    usageCount: number;
    expiryDate?: string;
    isActive: boolean;
}
