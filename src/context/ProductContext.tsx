import { createContext, useContext, type ReactNode } from 'react';
import type { Product } from '../types';
import { useStore } from './StoreContext';
import { useProducts as useProductsHook } from '../hooks/useProducts';

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
    const {
        products,
        categories,
        isLoading,
        refresh,
        updateProduct: mutateUpdate,
        createProduct: mutateCreate,
        deleteProduct: mutateDelete,
        addCategory: mutateAddCat,
        deleteCategory: mutateDelCat
    } = useProductsHook(currentStoreId);

    const refreshProducts = async () => { refresh(); };
    const refreshCategories = async () => { refresh(); };

    const updateProduct = async (product: Product) => {
        await mutateUpdate(product);
    };

    const updateStock = async (id: string, newStock: number) => {
        // Encontrar o produto atual e atualizar apenas o estoque
        const product = products.find(p => p.id === id);
        if (product) {
            await mutateUpdate({ ...product, stock: newStock });
        }
    }

    const createProduct = async (product: Omit<Product, 'id'>) => {
        await mutateCreate(product);
    }

    const deleteProduct = async (id: string) => {
        await mutateDelete(id);
    }

    const addCategory = async (name: string) => {
        await mutateAddCat(name);
    }

    const deleteCategory = async (name: string) => {
        await mutateDelCat(name);
    }

    return (
        <ProductContext.Provider value={{
            products,
            categories,
            loading: isLoading,
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
