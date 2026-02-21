import { supabase } from '../lib/supabase'
import { INITIAL_PRODUCTS } from './constants'
import type { Product, Order, BlogPost, Review, WishlistItem, Coupon } from '../types'

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
        list: async (storeId: string): Promise<Product[]> => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('store_id', storeId)
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
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) {
                    return {
                        ...data,
                        promotionalPrice: data.promotional_price,
                        isFeatured: data.is_featured,
                        createdAt: data.created_at,
                        code: data.code
                    };
                }
            } catch (err) {
                console.warn('⚠️ Produto não encontrado no banco, buscando local');
            }
            const products = getLocalProducts();
            return products.find(p => p.id === id);
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
                    code: product.code,
                    active: product.active
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
                    store_id: storeId
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
        list: async (storeId: string): Promise<string[]> => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('store_id', storeId)
                    .order('name');
                if (error) throw error;
                return data.map(c => c.name);
            } catch {
                return []; // Nova loja começa sem categorias
            }
        },
        create: async (name: string, storeId: string): Promise<void> => {
            await supabase.from('categories').insert([{ name, store_id: storeId }]);
        },
        delete: async (name: string): Promise<void> => {
            await supabase.from('categories').delete().eq('name', name);
        }
    },

    orders: {
        create: async (order: Order, storeId: string): Promise<Order | any> => {
            try {
                // Tentativa direta no Supabase com nomes de colunas exatos
                const { data, error } = await supabase
                    .from('orders')
                    .insert({
                        customer_name: order.customerName,
                        total: order.total,
                        status: order.status,
                        items: order.items,
                        notes: order.notes,
                        store_id: storeId,
                        // Customer Data
                        customer_email: order.customerEmail,
                        customer_phone: order.customerPhone,
                        customer_address_street: order.customerAddress?.street,
                        customer_address_number: order.customerAddress?.number,
                        customer_address_complement: order.customerAddress?.complement,
                        customer_address_neighborhood: order.customerAddress?.neighborhood,
                        customer_address_city: order.customerAddress?.city,
                        customer_address_state: order.customerAddress?.state,
                        customer_address_zipcode: order.customerAddress?.zipcode,
                        // Payment Method
                        payment_method: order.paymentMethod
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

        updateOrderWithCustomerData: async (orderId: string, customerData: {
            email?: string;
            phone?: string;
            address?: {
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
        }): Promise<void> => {
            try {
                const updateData: any = {};

                if (customerData.email) updateData.customer_email = customerData.email;
                if (customerData.phone) updateData.customer_phone = customerData.phone;
                if (customerData.transactionNsu) updateData.transaction_nsu = customerData.transactionNsu;
                if (customerData.infinitepayData) updateData.infinitepay_data = customerData.infinitepayData;

                if (customerData.address) {
                    if (customerData.address.street) updateData.customer_address_street = customerData.address.street;
                    if (customerData.address.number) updateData.customer_address_number = customerData.address.number;
                    if (customerData.address.complement) updateData.customer_address_complement = customerData.address.complement;
                    if (customerData.address.neighborhood) updateData.customer_address_neighborhood = customerData.address.neighborhood;
                    if (customerData.address.city) updateData.customer_address_city = customerData.address.city;
                    if (customerData.address.state) updateData.customer_address_state = customerData.address.state;
                    if (customerData.address.zipcode) updateData.customer_address_zipcode = customerData.address.zipcode;
                }

                const { error } = await supabase
                    .from('orders')
                    .update(updateData)
                    .eq('id', orderId);

                if (error) throw error;
                console.log('✅ Dados do cliente salvos com sucesso!');
            } catch (err: any) {
                console.error('❌ Erro ao salvar dados do cliente:', err.message);
            }
        },

        list: async (storeId: string): Promise<Order[]> => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('store_id', storeId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                return data?.map(o => ({
                    ...o,
                    customerName: o.customer_name || o.customerName,
                    orderNumber: o.order_number,
                    createdAt: o.created_at || o.createdAt,
                    paymentMethod: o.payment_method as any,
                    // Adicionar novos campos de cliente
                    customerEmail: o.customer_email,
                    customerPhone: o.customer_phone,
                    customerAddress: {
                        street: o.customer_address_street,
                        number: o.customer_address_number,
                        complement: o.customer_address_complement,
                        neighborhood: o.customer_address_neighborhood,
                        city: o.customer_address_city,
                        state: o.customer_address_state,
                        zipcode: o.customer_address_zipcode
                    },
                    transactionNsu: o.transaction_nsu,
                    infinitepayData: o.infinitepay_data
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
        get: async (storeId: string): Promise<any> => {
            try {
                const { data, error } = await supabase
                    .from('store_settings')
                    .select('*')
                    .eq('store_id', storeId)
                    .single();

                if (error) throw error;
                return data;
            } catch (err) {
                console.warn('⚠️ Erro ao buscar settings da loja, usando padrões');
                return {
                    store_name: 'Lojinha das Graças',
                    whatsapp_number: '5598984095956',
                    primary_color: '#D4AF37'
                };
            }
        },
        getByStoreId: async (storeId: string): Promise<any> => {
            try {
                const { data, error } = await supabase
                    .from('store_settings')
                    .select('*')
                    .eq('store_id', storeId)
                    .maybeSingle();

                if (error) throw error;
                return data;
            } catch (err) {
                console.error('Erro ao buscar settings por ID:', err);
                return null;
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
        list: async (storeId: string): Promise<BlogPost[]> => {
            try {
                const { data, error } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .eq('store_id', storeId)
                    .order('date', { ascending: false });

                if (error) throw error;
                if (data) {
                    return data.map(p => ({
                        ...p,
                        isFeatured: p.is_featured,
                        isPublished: p.is_published
                    }));
                }
                return [];
            } catch (err) {
                console.warn('⚠️ Supabase blog offline → usando localStorage');
                const stored = localStorage.getItem('ljg_blog');
                return stored ? JSON.parse(stored) : [];
            }
        },
        create: async (post: Omit<BlogPost, 'id'>, storeId: string): Promise<void> => {
            try {
                const mapped = {
                    ...post,
                    is_featured: post.isFeatured,
                    is_published: post.isPublished,
                    store_id: storeId
                };
                delete (mapped as any).isFeatured;
                delete (mapped as any).isPublished;

                const { error } = await supabase.from('blog_posts').insert([mapped]);
                if (error) throw error;
            } catch (err) {
                console.error('Erro ao Criar Blog:', err);
                const posts = JSON.parse(localStorage.getItem('ljg_blog') || '[]');
                posts.push({ ...post, id: crypto.randomUUID() });
                localStorage.setItem('ljg_blog', JSON.stringify(posts));
            }
        },
        update: async (post: BlogPost): Promise<void> => {
            try {
                const mapped = {
                    ...post,
                    is_featured: post.isFeatured,
                    is_published: post.isPublished
                };
                delete (mapped as any).isFeatured;
                delete (mapped as any).isPublished;

                const { error } = await supabase.from('blog_posts').update(mapped).eq('id', post.id);
                if (error) throw error;
            } catch (err) {
                console.error('Erro ao Atualizar Blog:', err);
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
    },
    waitingList: {
        create: async (data: {
            product_id: string;
            customer_name: string;
            customer_email?: string;
            customer_whatsapp?: string;
        }): Promise<void> => {
            try {
                const { error } = await supabase.from('waiting_list').insert([data]);
                if (error) throw error;
            } catch (err: any) {
                console.warn('⚠️ Fallback LocalStorage (Waitlist):', err.message);
                const waitlist = JSON.parse(localStorage.getItem('ljg_waitlist') || '[]');
                waitlist.push({ ...data, id: crypto.randomUUID(), created_at: new Date().toISOString(), notified: false });
                localStorage.setItem('ljg_waitlist', JSON.stringify(waitlist));
            }
        },
        list: async (storeId: string): Promise<any[]> => {
            try {
                const { data, error } = await supabase
                    .from('waiting_list')
                    .select('*')
                    .eq('store_id', storeId)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                return data || [];
            } catch {
                return [];
            }
        },
        update: async (id: string, data: any): Promise<void> => {
            try {
                const { error } = await supabase
                    .from('waiting_list')
                    .update(data)
                    .eq('id', id);
                if (error) throw error;
            } catch {
                const waitlist = JSON.parse(localStorage.getItem('ljg_waitlist') || '[]');
                const idx = waitlist.findIndex((w: any) => w.id === id);
                if (idx !== -1) {
                    waitlist[idx] = { ...waitlist[idx], ...data };
                    localStorage.setItem('ljg_waitlist', JSON.stringify(waitlist));
                }
            }
        },
        delete: async (id: string): Promise<void> => {
            try {
                const { error } = await supabase
                    .from('waiting_list')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            } catch {
                const waitlist = JSON.parse(localStorage.getItem('ljg_waitlist') || '[]');
                const filtered = waitlist.filter((w: any) => w.id !== id);
                localStorage.setItem('ljg_waitlist', JSON.stringify(filtered));
            }
        }
    },
    usuarios: {
        list: async (): Promise<any[]> => {
            try {
                console.log('📋 [API] Listando usuários da tabela usuarios...');
                const { data, error } = await supabase
                    .from('usuarios')
                    .select('*');

                if (error) {
                    console.error('❌ [API] Erro ao listar usuários:', error);
                    throw error;
                }

                console.log(`✅ [API] ${data?.length || 0} usuários encontrados`);
                return data || [];
            } catch (err) {
                console.error('❌ [API] Erro ao listar usuários:', err);
                return [];
            }
        }
    },
    reviews: {
        list: async (productId: string): Promise<Review[]> => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        listAll: async (storeId: string): Promise<(Review & { products: { name: string } | null })[]> => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*, products!inner(name, store_id)')
                .eq('products.store_id', storeId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        create: async (review: Omit<Review, 'id' | 'created_at' | 'helpful_count'>): Promise<void> => {
            const { error } = await supabase.from('reviews').insert([review]);
            if (error) throw error;
        },
        respond: async (reviewId: string, response: string): Promise<void> => {
            const { error } = await supabase
                .from('reviews')
                .update({
                    admin_response: response,
                    admin_response_date: new Date().toISOString()
                })
                .eq('id', reviewId);
            if (error) throw error;
        },
        delete: async (reviewId: string): Promise<void> => {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', reviewId);
            if (error) throw error;
        },
        markHelpful: async (reviewId: string): Promise<void> => {
            // Lógica para incrementar helpful_count (de preferência via RPC no Supabase para evitar concorrência)
            const { error } = await supabase.rpc('increment_review_helpful', { review_id: reviewId });
            if (error) {
                // Fallback simples se RPC não existir
                const { data: current } = await supabase.from('reviews').select('helpful_count').eq('id', reviewId).single();
                await supabase.from('reviews').update({ helpful_count: (current?.helpful_count || 0) + 1 }).eq('id', reviewId);
            }
        }
    },
    wishlist: {
        list: async (sessionId: string, storeId: string = '00000000-0000-0000-0000-000000000001', userEmail?: string): Promise<WishlistItem[]> => {
            let query = supabase
                .from('wishlists')
                .select('*, product:products(*)')
                .eq('store_id', storeId)

            if (userEmail) {
                query = query.or(`session_id.eq.${sessionId},user_email.eq.${userEmail}`);
            } else {
                query = query.eq('session_id', sessionId);
            }

            const { data, error } = await query.order('added_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        add: async (item: Omit<WishlistItem, 'id' | 'added_at'>, storeId: string = '00000000-0000-0000-0000-000000000001'): Promise<void> => {
            const { error } = await supabase.from('wishlists').insert([{ ...item, store_id: storeId }]);
            if (error) throw error;
        },
        remove: async (sessionId: string, productId: string): Promise<void> => {
            const { error } = await supabase
                .from('wishlists')
                .delete()
                .eq('session_id', sessionId)
                .eq('product_id', productId);
            if (error) throw error;
        },
        updatePreferences: async (sessionId: string, productId: string, prefs: { notify_on_sale?: boolean; notify_on_stock?: boolean }): Promise<void> => {
            const { error } = await supabase
                .from('wishlists')
                .update(prefs)
                .eq('session_id', sessionId)
                .eq('product_id', productId);
            if (error) throw error;
        },
        updateNotifications: async (id: string, options: { notify_on_sale?: boolean; notify_on_stock?: boolean }): Promise<void> => {
            const { error } = await supabase.from('wishlists').update(options).eq('id', id);
            if (error) throw error;
        }
    },
    coupons: {
        list: async (storeId: string): Promise<Coupon[]> => {
            try {
                const { data, error } = await supabase
                    .from('coupons')
                    .select('*')
                    .eq('store_id', storeId)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                return data?.map(c => ({
                    id: c.id,
                    code: c.code,
                    type: c.type,
                    value: c.value,
                    minSpend: c.min_spend,
                    usageLimit: c.usage_limit,
                    usageCount: c.usage_count,
                    expiryDate: c.expiry_date,
                    isActive: c.is_active
                })) || [];
            } catch (err) {
                console.warn('Erro ao carregar cupons:', err);
                return [];
            }
        },
        create: async (coupon: Omit<Coupon, 'id'> & { store_id: string }): Promise<void> => {
            const { error } = await supabase.from('coupons').insert([{
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                min_spend: coupon.minSpend,
                usage_limit: coupon.usageLimit,
                usage_count: coupon.usageCount,
                expiry_date: coupon.expiryDate,
                is_active: coupon.isActive,
                store_id: coupon.store_id
            }]);
            if (error) throw error;
        },
        update: async (coupon: Coupon): Promise<void> => {
            const { error } = await supabase.from('coupons').update({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                min_spend: coupon.minSpend,
                usage_limit: coupon.usageLimit,
                usage_count: coupon.usageCount,
                expiry_date: coupon.expiryDate,
                is_active: coupon.isActive
            }).eq('id', coupon.id);
            if (error) throw error;
        },
        delete: async (id: string): Promise<void> => {
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) throw error;
        }
    },
    newsletter: {
        subscribe: async (email: string, storeId: string = '00000000-0000-0000-0000-000000000001'): Promise<void> => {
            try {
                const { error } = await supabase
                    .from('newsletters')
                    .insert([{ email, active: true, store_id: storeId }]);
                if (error) throw error;
            } catch (err) {
                console.warn('Erro ao salvar email na newsletter:', err);
            }
        }
    }
};
