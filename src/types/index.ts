export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number;
    image: string; // Imagem principal
    images?: string[]; // Galeria de fotos extras
    category: string;
    stock: number;
    code?: string;
    isFeatured?: boolean;
    active: boolean;
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
}

export interface User {
    id: string;
    email: string;
    name?: string;
    role: 'admin' | 'customer';
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
