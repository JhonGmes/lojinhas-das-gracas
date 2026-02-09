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
    isFeatured?: boolean;
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
}

export interface User {
    id: string;
    email: string;
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
