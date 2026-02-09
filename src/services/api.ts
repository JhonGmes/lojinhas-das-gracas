import { supabase } from '../lib/supabase'
import { INITIAL_PRODUCTS } from './constants'
import type { Product, Order, BlogPost } from '../types'

const LS_PRODUCTS = 'ljg_products'
const LS_ORDERS = 'ljg_orders'

const getLocalProducts = (): Product[] => {
    const stored = localStorage.getItem(LS_PRODUCTS)
    if (!stored) {
        localStorage.setItem(LS_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
        return INITIAL_PRODUCTS
    }
    return JSON.parse(stored)
}

const getLocalOrders = (): Order[] => {
    const stored = localStorage.getItem(LS_ORDERS)
    return stored ? JSON.parse(stored) : []
}

export const api = {
    products: {
        list: async (): Promise<Product[]> => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('name')

                if (error) throw error
                if (data) {
                    return data.map(p => ({
                        ...p,
                        promotionalPrice: p.promotional_price,
                        isFeatured: p.is_featured,
                        createdAt: p.created_at,
                        code: p.code
                    }))
                }
            } catch (err) {
                console.warn('⚠️ Supabase offline → usando localStorage')
            }

            return getLocalProducts()
        },

        getById: async (id: string): Promise<Product | undefined> => {
            const products = await api.products.list()
            return products.find(p => p.id === id)
        },

        update: async (product: Product): Promise<void> => {
            try {
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
                    code: product.code
                }
                const { error } = await supabase
                    .from('products')
                    .update(productToUpdate)
                    .eq('id', product.id)

                if (error) throw error
                return
            } catch (err: any) {
                console.error('Erro ao atualizar produto no banco:', err.message);
                const products = getLocalProducts()
                const index = products.findIndex(p => p.id === product.id)
                if (index !== -1) {
                    products[index] = product
                    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products))
                }
            }
        },

        updateStock: async (id: string, newStock: number): Promise<void> => {
            try {
                const { error } = await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', id)

                if (error) throw error
                return
            } catch {
                const products = getLocalProducts()
                const p = products.find(p => p.id === id)
                if (p) {
                    p.stock = newStock
                    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products))
                }
            }
        },

        create: async (product: Omit<Product, 'id'>): Promise<void> => {
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
                    code: product.code
                }

                if (product.promotionalPrice) {
                    payload.promotional_price = product.promotionalPrice;
                }

                const { error } = await supabase.from('products').insert([payload]);

                if (error) {
                    console.error('Erro na criação:', error);
                    throw error;
                }
                return
            } catch (err: any) {
                console.warn('⚠️ Fallback LocalStorage ativado:', err.message)
                const products = getLocalProducts()
                const newProduct = { ...product, id: crypto.randomUUID() }
                products.push(newProduct as Product)
                localStorage.setItem(LS_PRODUCTS, JSON.stringify(products))
            }
        },

        delete: async (id: string): Promise<void> => {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                return
            } catch {
                const products = getLocalProducts()
                const filtered = products.filter(p => p.id !== id)
                localStorage.setItem(LS_PRODUCTS, JSON.stringify(filtered))
            }
        }
    },

    categories: {
        list: async (): Promise<string[]> => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('name')
                    .order('name');
                if (error) throw error;
                return data.map(c => c.name);
            } catch {
                return ['Terços', 'Imagens', 'Bíblias', 'Outros'];
            }
        },
        create: async (name: string): Promise<void> => {
            await supabase.from('categories').insert([{ name }]);
        },
        delete: async (name: string): Promise<void> => {
            await supabase.from('categories').delete().eq('name', name);
        }
    },

    orders: {
        create: async (order: Order): Promise<Order | any> => {
            try {
                // Tentativa direta no Supabase com nomes de colunas exatos
                const { data, error } = await supabase
                    .from('orders')
                    .insert({
                        customer_name: order.customerName,
                        total: order.total,
                        status: order.status,
                        items: order.items,
                        notes: order.notes
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('❌ ERRO NO SUPABASE:', error.message);
                    throw error;
                }

                if (data) {
                    return {
                        ...data,
                        customerName: data.customer_name,
                        orderNumber: data.order_number,
                        createdAt: data.created_at
                    };
                }
            } catch (err: any) {
                console.error('⚠️ Pedido salvo localmente devido a erro no banco:', err.message);
                const orders = getLocalOrders();
                const newOrder = { ...order, orderNumber: 0 }; // 0 indica erro/local
                orders.push(newOrder);
                localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                return newOrder;
            }
        },

        updateStatus: async (orderId: string, status: Order['status']): Promise<void> => {
            try {
                const { error } = await supabase
                    .from('orders')
                    .update({ status })
                    .eq('id', orderId);

                if (error) throw error;
            } catch (err: any) {
                console.error('❌ Erro ao atualizar status:', err.message);
                // Fallback local se o banco falhar
                const orders = getLocalOrders();
                const idx = orders.findIndex(o => o.id === orderId);
                if (idx !== -1) {
                    orders[idx].status = status;
                    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                }
            }
        },

        list: async (): Promise<Order[]> => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                return data?.map(o => ({
                    ...o,
                    customerName: o.customer_name || o.customerName,
                    orderNumber: o.order_number,
                    createdAt: o.created_at || o.createdAt
                })) || [];
            } catch (err: any) {
                console.warn('Recuperando pedidos do navegador:', err.message);
                return getLocalOrders().sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }
        }
    },
    settings: {
        get: async (): Promise<any> => {
            try {
                const { data, error } = await supabase
                    .from('store_settings')
                    .select('*')
                    .limit(1);

                if (error) throw error;
                if (data && data.length > 0) return data[0];

                return {
                    store_name: 'Lojinha das Graças',
                    whatsapp_number: '5598984095956',
                    primary_color: '#D4AF37'
                };
            } catch (err) {
                console.warn('⚠️ Erro ao buscar settings, usando padrões');
                return {
                    store_name: 'Lojinha das Graças',
                    whatsapp_number: '5598984095956',
                    primary_color: '#D4AF37'
                };
            }
        },
        update: async (settings: any): Promise<void> => {
            try {
                const payload = { ...settings };
                delete payload.updated_at;

                // Se o ID for inválido ou a string "undefined", removemos para o Supabase gerar um novo
                if (!payload.id || payload.id === 'undefined' || payload.id === '') {
                    delete payload.id;
                }

                const { error } = await supabase
                    .from('store_settings')
                    .upsert(payload);

                if (error) throw error;
            } catch (err: any) {
                console.error('❌ Erro crítico ao salvar configurações:', err.message);
                throw err;
            }
        }
    },
    blog: {
        list: async (): Promise<BlogPost[]> => {
            try {
                const { data, error } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .order('date', { ascending: false });

                if (error) throw error;
                return data || [];
            } catch (err) {
                console.warn('⚠️ Supabase blog offline → usando localStorage');
                const stored = localStorage.getItem('ljg_blog');
                return stored ? JSON.parse(stored) : [];
            }
        },
        create: async (post: Omit<BlogPost, 'id'>): Promise<void> => {
            try {
                const { error } = await supabase.from('blog_posts').insert([{ ...post }]);
                if (error) throw error;
            } catch (err) {
                const posts = JSON.parse(localStorage.getItem('ljg_blog') || '[]');
                posts.push({ ...post, id: crypto.randomUUID() });
                localStorage.setItem('ljg_blog', JSON.stringify(posts));
            }
        },
        update: async (post: BlogPost): Promise<void> => {
            try {
                const { error } = await supabase.from('blog_posts').update(post).eq('id', post.id);
                if (error) throw error;
            } catch (err) {
                const posts = JSON.parse(localStorage.getItem('ljg_blog') || '[]');
                const idx = posts.findIndex((p: any) => p.id === post.id);
                if (idx !== -1) {
                    posts[idx] = post;
                    localStorage.setItem('ljg_blog', JSON.stringify(posts));
                }
            }
        },
        delete: async (id: string): Promise<void> => {
            try {
                const { error } = await supabase.from('blog_posts').delete().eq('id', id);
                if (error) throw error;
            } catch (err) {
                const posts = JSON.parse(localStorage.getItem('ljg_blog') || '[]');
                const filtered = posts.filter((p: any) => p.id !== id);
                localStorage.setItem('ljg_blog', JSON.stringify(filtered));
            }
        }
    }
};
