import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { Product } from '../../../types'

// Fallback data and helpers (modularized from api.ts)
const LS_PRODUCTS = 'ljg_products'
const INITIAL_PRODUCTS: Product[] = [] // This should be imported from a constant file if needed

const getLocalProducts = (): Product[] => {
    const stored = localStorage.getItem(LS_PRODUCTS)
    return stored ? JSON.parse(stored) : INITIAL_PRODUCTS
}

export const productService = {
    products: {
        list: async (storeId: string): Promise<Product[]> => {
            try {
                const q = query(
                    collection(db, 'products'),
                    where('store_id', '==', storeId)
                );
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        promotionalPrice: data.promotional_price,
                        isFeatured: data.is_featured,
                        createdAt: data.created_at,
                        code: data.code
                    } as Product;
                }).sort((a, b) => a.name.localeCompare(b.name));
            } catch (err: any) {
                console.warn('⚠️ Firebase offline ou erro de índice → usando localStorage:', err.message);
                return getLocalProducts();
            }
        },

        getById: async (id: string, storeId?: string): Promise<Product | undefined> => {
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Validação de storeId para segurança extra
                    if (storeId && data.store_id !== storeId) {
                        console.error('❌ Tentativa de acesso a produto de outra loja bloqueada');
                        return undefined;
                    }

                    return {
                        id: docSnap.id,
                        ...data,
                        promotionalPrice: data.promotional_price,
                        isFeatured: data.is_featured,
                        createdAt: data.created_at,
                        code: data.code
                    } as Product;
                }
            } catch (err) {
                console.warn('⚠️ Produto não encontrado no banco, buscando local');
            }
            const products = getLocalProducts();
            const product = products.find(p => p.id === id);

            if (storeId && product && product.store_id !== storeId) return undefined;
            return product;
        },

        getByIds: async (ids: string[], storeId?: string): Promise<Product[]> => {
            if (ids.length === 0) return [];
            try {
                const results: Product[] = [];
                // Firestore 'in' queries are limited to 10-30 elements depending on version, 
                // but let's assume small lists for wishlists.
                // For safety, we can fetch one by one or chunk it.
                // Chunking is better.
                const chunks = [];
                for (let i = 0; i < ids.length; i += 10) {
                    chunks.push(ids.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    const q = query(collection(db, 'products'), where('__name__', 'in', chunk));
                    const snap = await getDocs(q);
                    snap.docs.forEach(doc => {
                        const data = doc.data();
                        if (!storeId || data.store_id === storeId) {
                            results.push({
                                id: doc.id,
                                ...data,
                                promotionalPrice: data.promotional_price,
                                isFeatured: data.is_featured,
                                createdAt: data.created_at,
                                code: data.code
                            } as Product);
                        }
                    });
                }
                return results;
            } catch (err) {
                console.warn('⚠️ Erro ao buscar produtos em lote, tentando unitário ou local');
                const products = await Promise.all(ids.map(id => productService.products.getById(id, storeId)));
                return products.filter((p): p is Product => p !== undefined);
            }
        },

        update: async (product: Product, storeId: string): Promise<void> => {
            try {
                // Verificação de segurança: O produto pertence a esta loja?
                const docRef = doc(db, 'products', product.id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists() || docSnap.data()?.store_id !== storeId) {
                    throw new Error('Permissão negada ou produto não encontrado nesta loja.');
                }

                const productToUpdate = {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    category: product.category,
                    image: product.image,
                    images: product.images || [],
                    promotional_price: product.promotionalPrice ?? null,
                    is_featured: product.isFeatured ?? false,
                    code: product.code,
                    active: product.active,
                    updated_at: serverTimestamp()
                };
                await updateDoc(docRef, productToUpdate);
            } catch (err: any) {
                console.error('Erro ao atualizar produto no Firebase:', err.message);
                throw err;
            }
        },

        updateStock: async (id: string, newStock: number): Promise<void> => {
            try {
                await updateDoc(doc(db, 'products', id), { stock: newStock });
            } catch {
                const products = getLocalProducts();
                const p = products.find(p => p.id === id);
                if (p) {
                    p.stock = newStock;
                    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
                }
            }
        },

        create: async (product: Omit<Product, 'id'>, storeId: string): Promise<void> => {
            try {
                const payload: any = {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    category: product.category,
                    image: product.image,
                    images: product.images || [],
                    is_featured: product.isFeatured ?? false,
                    code: product.code,
                    active: product.active,
                    store_id: storeId,
                    created_at: serverTimestamp()
                };

                if (product.promotionalPrice) {
                    payload.promotional_price = product.promotionalPrice;
                }

                await addDoc(collection(db, 'products'), payload);
            } catch (err: any) {
                console.warn('⚠️ Fallback LocalStorage ativado:', err.message);
                const products = getLocalProducts();
                const newProduct = { ...product, id: crypto.randomUUID() };
                products.push(newProduct as Product);
                localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
            }
        },

        delete: async (id: string, storeId: string): Promise<void> => {
            try {
                // Verificação de segurança
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists() || docSnap.data()?.store_id !== storeId) {
                    throw new Error('Permissão negada ou produto não encontrado nesta loja.');
                }

                await deleteDoc(docRef);
            } catch (err: any) {
                console.error('Erro ao deletar produto:', err.message);
                throw err;
            }
        }
    },

    categories: {
        list: async (storeId: string): Promise<string[]> => {
            try {
                const q = query(collection(db, 'categories'), where('store_id', '==', storeId));
                const querySnapshot = await getDocs(q);
                const categoryNames = querySnapshot.docs.map(doc => doc.data().name as string);
                return Array.from(new Set(categoryNames)).sort((a, b) => a.localeCompare(b));
            } catch (err: any) {
                console.error('Erro ao carregar categorias:', err.message);
                return [];
            }
        },
        create: async (name: string, storeId: string): Promise<void> => {
            await addDoc(collection(db, 'categories'), { name, store_id: storeId });
        },
        delete: async (name: string): Promise<void> => {
            const q = query(collection(db, 'categories'), where('name', '==', name));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (d) => {
                await deleteDoc(doc(db, 'categories', d.id));
            });
        }
    }
}
