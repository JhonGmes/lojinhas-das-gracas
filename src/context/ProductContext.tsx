import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { useStore } from './StoreContext';

interface ProductContextType {
    products: Product[];
    categories: string[];
    loading: boolean;
    refreshProducts: () => Promise<void>;
    refreshCategories: () => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateStock: (id: string, newStock: number) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    deleteCategory: (name: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const { currentStoreId } = useStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshProducts = async () => {
        try {
            const data = await api.products.list(currentStoreId);
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshCategories = async () => {
        try {
            const data = await api.categories.list();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        refreshProducts();
        refreshCategories();
    }, [currentStoreId]);

    const updateProduct = async (product: Product) => {
        await api.products.update(product);
        await refreshProducts();
    };

    const updateStock = async (id: string, newStock: number) => {
        await api.products.updateStock(id, newStock);
        await refreshProducts();
    }

    const createProduct = async (product: Omit<Product, 'id'>) => {
        await api.products.create(product, currentStoreId);
        await refreshProducts();
    }

    const deleteProduct = async (id: string) => {
        await api.products.delete(id);
        await refreshProducts();
    }

    const addCategory = async (name: string) => {
        await api.categories.create(name);
        await refreshCategories();
    }

    const deleteCategory = async (name: string) => {
        await api.categories.delete(name);
        await refreshCategories();
    }

    return (
        <ProductContext.Provider value={{
            products,
            categories,
            loading,
            refreshProducts,
            refreshCategories,
            updateProduct,
            updateStock,
            createProduct,
            deleteProduct,
            addCategory,
            deleteCategory
        }}>
            {children}
        </ProductContext.Provider>
    );
}

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
