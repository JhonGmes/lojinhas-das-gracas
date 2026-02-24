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
    setDoc,
    orderBy,
    limit,
    serverTimestamp,
    increment
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { compressImage } from '../utils/imageCompression'
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

        getById: async (id: string): Promise<Product | undefined> => {
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
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
                    active: product.active,
                    updated_at: serverTimestamp()
                };
                await updateDoc(doc(db, 'products', product.id), productToUpdate);
            } catch (err: any) {
                console.error('Erro ao atualizar produto no Firebase:', err.message);
                const products = getLocalProducts();
                const index = products.findIndex(p => p.id === product.id);
                if (index !== -1) {
                    products[index] = product;
                    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
                }
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

        delete: async (id: string): Promise<void> => {
            try {
                await deleteDoc(doc(db, 'products', id));
            } catch {
                const products = getLocalProducts();
                const filtered = products.filter(p => p.id !== id);
                localStorage.setItem(LS_PRODUCTS, JSON.stringify(filtered));
            }
        }
    },

    categories: {
        list: async (storeId: string): Promise<string[]> => {
            try {
                const q = query(collection(db, 'categories'), where('store_id', '==', storeId));
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => doc.data().name as string).sort((a, b) => a.localeCompare(b));
            } catch (err: any) {
                console.error('Erro ao carregar categorias:', err.message);
                return [];
            }
        },
        create: async (name: string, storeId: string): Promise<void> => {
            await addDoc(collection(db, 'categories'), { name, store_id: storeId });
        },
        delete: async (name: string): Promise<void> => {
            // No Firestore, deletar por campo exige query primeiro
            const q = query(collection(db, 'categories'), where('name', '==', name));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (d) => {
                await deleteDoc(doc(db, 'categories', d.id));
            });
        }
    },

    orders: {
        create: async (order: Order, storeId: string): Promise<Order | any> => {
            try {
                // Tenta buscar o último número de pedido para sequencial
                let nextOrderNumber = 1;
                try {
                    // Tenta buscar o último número de pedido
                    const qLast = query(
                        collection(db, 'orders'),
                        where('store_id', '==', storeId),
                        orderBy('order_number', 'desc'),
                        limit(1)
                    );
                    const lastSnap = await getDocs(qLast);
                    if (!lastSnap.empty) {
                        const lastOrder = lastSnap.docs[0].data();
                        if (typeof lastOrder.order_number === 'number') {
                            nextOrderNumber = lastOrder.order_number + 1;
                        }
                    }
                } catch (idxErr: any) {
                    // Erro de índice comum no Firestore. Vamos tentar listar os últimos e ordenar em memória
                    console.warn('⚠️ Erro de índice ao buscar order_number. Tentando fallback em memória...');
                    try {
                        const qFallback = query(
                            collection(db, 'orders'),
                            where('store_id', '==', storeId),
                            limit(50) // Pega os últimos 50 e ordena manual
                        );
                        const snap = await getDocs(qFallback);
                        const nums = snap.docs
                            .map(d => d.data().order_number)
                            .filter(n => typeof n === 'number') as number[];

                        if (nums.length > 0) {
                            nextOrderNumber = Math.max(...nums) + 1;
                        }
                    } catch (e) {
                        nextOrderNumber = Date.now();
                    }
                }

                const payload = {
                    customer_name: order.customerName || 'Cliente',
                    total: order.total || 0,
                    status: order.status || 'pending',
                    items: order.items || [],
                    notes: order.notes || '',
                    store_id: storeId || 'lojinhadas-gracas',
                    customer_email: order.customerEmail || '',
                    customer_phone: order.customerPhone || '',
                    customer_address_street: order.customerAddress?.street || '',
                    customer_address_number: order.customerAddress?.number || '',
                    customer_address_complement: order.customerAddress?.complement || '',
                    customer_address_neighborhood: order.customerAddress?.neighborhood || '',
                    customer_address_city: order.customerAddress?.city || '',
                    customer_address_state: order.customerAddress?.state || '',
                    customer_address_zipcode: order.customerAddress?.zipcode || '',
                    payment_method: order.paymentMethod || 'pix',
                    created_at: serverTimestamp(),
                    order_number: nextOrderNumber
                };

                const docRef = doc(db, 'orders', order.id);
                await setDoc(docRef, payload);

                return {
                    ...order,
                    id: order.id,
                    orderNumber: payload.order_number,
                    createdAt: new Date().toISOString()
                };
            } catch (err: any) {
                console.error('⚠️ Erro ao criar pedido no Firestore:', err.message);
                const fallbackOrderNumber = Date.now();

                // Fallback de emergência (salva no Firestore de qualquer jeito sem order_number customizado que exigiria indexação)
                try {
                    const fallbackPayload = {
                        customer_name: order.customerName || 'Cliente',
                        total: order.total || 0,
                        status: order.status || 'pending',
                        items: order.items || [],
                        notes: order.notes || '',
                        store_id: storeId || 'lojinhadas-gracas',
                        customer_email: order.customerEmail || '',
                        customer_phone: order.customerPhone || '',
                        customer_address_street: order.customerAddress?.street || '',
                        customer_address_number: order.customerAddress?.number || '',
                        customer_address_complement: order.customerAddress?.complement || '',
                        customer_address_neighborhood: order.customerAddress?.neighborhood || '',
                        customer_address_city: order.customerAddress?.city || '',
                        customer_address_state: order.customerAddress?.state || '',
                        customer_address_zipcode: order.customerAddress?.zipcode || '',
                        payment_method: order.paymentMethod || 'pix',
                        created_at: serverTimestamp(),
                        order_number: fallbackOrderNumber
                    };
                    await setDoc(doc(db, 'orders', order.id), fallbackPayload);
                    return {
                        ...order,
                        id: order.id,
                        orderNumber: fallbackOrderNumber,
                        createdAt: new Date().toISOString()
                    };
                } catch (fatalErr: any) {
                    console.error('⚠️ FATAL: Pedido salvo localmente.', fatalErr.message);
                    const orders = getLocalOrders();
                    const newOrder = { ...order, orderNumber: fallbackOrderNumber };
                    orders.push(newOrder);
                    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                    return newOrder;
                }
            }
        },

        updateStatus: async (orderId: string, status: Order['status']): Promise<void> => {
            try {
                await updateDoc(doc(db, 'orders', orderId), { status });
            } catch (err: any) {
                console.error('❌ Erro ao atualizar status:', err.message);
                const orders = getLocalOrders();
                const idx = orders.findIndex(o => o.id === orderId);
                if (idx !== -1) {
                    orders[idx].status = status;
                    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                }
            }
        },

        confirmPayment: async (order: Order): Promise<void> => {
            try {
                // 1. Atualiza status do pedido para 'paid'
                await updateDoc(doc(db, 'orders', order.id), { status: 'paid' });

                // 2. Baixa o estoque de cada item
                for (const item of order.items) {
                    try {
                        const productRef = doc(db, 'products', item.id);
                        await updateDoc(productRef, {
                            stock: increment(-item.quantity)
                        });
                    } catch (stockErr) {
                        console.error(`❌ Erro ao baixar estoque do item ${item.id}:`, stockErr);
                    }
                }

                // Fallback LocalStorage
                const orders = getLocalOrders();
                const idx = orders.findIndex(o => o.id === order.id);
                if (idx !== -1) {
                    orders[idx].status = 'paid';
                    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                }
            } catch (err: any) {
                console.error('❌ Erro ao confirmar pagamento:', err.message);
            }
        },

        updateOrderWithCustomerData: async (orderId: string, customerData: any): Promise<void> => {
            try {
                const updateData: any = {};
                if (customerData.email) updateData.customer_email = customerData.email;
                if (customerData.phone) updateData.customer_phone = customerData.phone;
                if (customerData.transactionNsu) updateData.transaction_nsu = customerData.transactionNsu;
                if (customerData.infinitepayData) updateData.infinitepay_data = customerData.infinitepayData;

                if (customerData.address) {
                    const addr = customerData.address;
                    if (addr.street) updateData.customer_address_street = addr.street;
                    if (addr.number) updateData.customer_address_number = addr.number;
                    if (addr.complement) updateData.customer_address_complement = addr.complement;
                    if (addr.neighborhood) updateData.customer_address_neighborhood = addr.neighborhood;
                    if (addr.city) updateData.customer_address_city = addr.city;
                    if (addr.state) updateData.customer_address_state = addr.state;
                    if (addr.zipcode) updateData.customer_address_zipcode = addr.zipcode;
                }

                await updateDoc(doc(db, 'orders', orderId), updateData);
            } catch (err: any) {
                console.error('❌ Erro ao salvar dados do cliente no Firebase:', err.message);
            }
        },

        getById: async (orderId: string): Promise<Order | null> => {
            try {
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    return {
                        id: docSnap.id,
                        customerName: data.customer_name,
                        total: data.total,
                        status: data.status,
                        items: data.items,
                        paymentMethod: data.payment_method,
                        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
                        orderNumber: data.order_number,
                        customerEmail: data.customer_email,
                        customerPhone: data.customer_phone,
                        customerAddress: {
                            street: data.customer_address_street,
                            number: data.customer_address_number,
                            complement: data.customer_address_complement,
                            neighborhood: data.customer_address_neighborhood,
                            city: data.customer_address_city,
                            state: data.customer_address_state,
                            zipcode: data.customer_address_zipcode
                        },
                        transactionNsu: data.transaction_nsu,
                        infinitepayData: data.infinitepay_data
                    } as Order;
                }
                return null;
            } catch (err: any) {
                console.error('❌ Erro ao buscar pedido por ID:', err.message);
                return null;
            }
        },

        list: async (storeId: string): Promise<Order[]> => {
            try {
                const q = query(
                    collection(db, 'orders'),
                    where('store_id', '==', storeId)
                );
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        customerName: data.customer_name,
                        total: data.total,
                        status: data.status,
                        items: data.items,
                        paymentMethod: data.payment_method,
                        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
                        orderNumber: data.order_number,
                        customerEmail: data.customer_email,
                        customerPhone: data.customer_phone,
                        customerAddress: {
                            street: data.customer_address_street,
                            number: data.customer_address_number,
                            complement: data.customer_address_complement,
                            neighborhood: data.customer_address_neighborhood,
                            city: data.customer_address_city,
                            state: data.customer_address_state,
                            zipcode: data.customer_address_zipcode
                        },
                        transactionNsu: data.transaction_nsu,
                        infinitepayData: data.infinitepay_data
                    } as Order;
                }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            } catch (err: any) {
                console.warn('Recuperando pedidos do navegador:', err.message);
                return getLocalOrders().sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }
        },

        delete: async (orderId: string): Promise<void> => {
            try {
                await deleteDoc(doc(db, 'orders', orderId));
            } catch (err: any) {
                console.error('❌ Erro ao deletar pedido:', err.message);
                const orders = getLocalOrders();
                const filtered = orders.filter(o => o.id !== orderId);
                localStorage.setItem(LS_ORDERS, JSON.stringify(filtered));
            }
        }
    },
    settings: {
        getByStoreId: async (storeId: string): Promise<any> => {
            try {
                const docRef = doc(db, 'store_settings', storeId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };

                // Fallback via query caso o ID do documento não seja o slug
                const q = query(collection(db, 'store_settings'), where('store_id', '==', storeId), limit(1));
                const snap = await getDocs(q);
                if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

                return null;
            } catch (err) {
                console.error('Erro ao buscar settings no Firebase:', err);
                return null;
            }
        },
        update: async (settings: any): Promise<void> => {
            try {
                const payload = { ...settings, updated_at: serverTimestamp() };
                const id = settings.id || settings.store_id || 'lojinhadas-gracas';
                await setDoc(doc(db, 'store_settings', id), payload, { merge: true });
            } catch (err: any) {
                console.error('❌ Erro crítico ao salvar configurações no Firebase:', err.message);
                throw err;
            }
        }
    },
    blog: {
        list: async (storeId: string): Promise<BlogPost[]> => {
            try {
                const q = query(
                    collection(db, 'blog_posts'),
                    where('store_id', '==', storeId)
                );
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        isFeatured: data.is_featured,
                        isPublished: data.is_published
                    } as BlogPost;
                }).sort((a, b) => {
                    // Ordenação manual por data decrescente
                    const dateA = a.created_at?.toDate?.() || new Date(a.date || 0);
                    const dateB = b.created_at?.toDate?.() || new Date(b.date || 0);
                    return dateB.getTime() - dateA.getTime();
                });
            } catch (err: any) {
                console.warn('⚠️ Firebase blog offline ou erro de índice:', err.message);
                const stored = localStorage.getItem('ljg_blog');
                return stored ? JSON.parse(stored) : [];
            }
        },
        create: async (post: Omit<BlogPost, 'id'>, storeId: string): Promise<void> => {
            try {
                const payload = {
                    ...post,
                    is_featured: post.isFeatured,
                    is_published: post.isPublished,
                    store_id: storeId,
                    created_at: serverTimestamp()
                };
                delete (payload as any).isFeatured;
                delete (payload as any).isPublished;
                await addDoc(collection(db, 'blog_posts'), payload);
            } catch (err) {
                const posts = JSON.parse(localStorage.getItem('ljg_blog') || '[]');
                posts.push({ ...post, id: crypto.randomUUID() });
                localStorage.setItem('ljg_blog', JSON.stringify(posts));
            }
        },
        update: async (post: BlogPost): Promise<void> => {
            try {
                const payload = {
                    ...post,
                    is_featured: post.isFeatured,
                    is_published: post.isPublished,
                    updated_at: serverTimestamp()
                };
                delete (payload as any).isFeatured;
                delete (payload as any).isPublished;
                await updateDoc(doc(db, 'blog_posts', post.id), payload);
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
                await deleteDoc(doc(db, 'blog_posts', id));
            } catch (err) {
                const posts = JSON.parse(localStorage.getItem('ljg_blog') || '[]');
                const filtered = posts.filter((p: any) => p.id !== id);
                localStorage.setItem('ljg_blog', JSON.stringify(filtered));
            }
        }
    },
    waitingList: {
        create: async (data: any): Promise<void> => {
            try {
                await addDoc(collection(db, 'waiting_list'), { ...data, created_at: serverTimestamp() });
            } catch (err: any) {
                console.warn('⚠️ Fallback LocalStorage (Waitlist):', err.message);
                const waitlist = JSON.parse(localStorage.getItem('ljg_waitlist') || '[]');
                waitlist.push({ ...data, id: crypto.randomUUID(), created_at: new Date().toISOString(), notified: false });
                localStorage.setItem('ljg_waitlist', JSON.stringify(waitlist));
            }
        },
        list: async (storeId: string): Promise<any[]> => {
            try {
                const q = query(collection(db, 'waiting_list'), where('store_id', '==', storeId), orderBy('created_at', 'desc'));
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch {
                return [];
            }
        },
        update: async (id: string, data: any): Promise<void> => {
            try {
                await updateDoc(doc(db, 'waiting_list', id), data);
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
                await deleteDoc(doc(db, 'waiting_list', id));
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
                const querySnapshot = await getDocs(collection(db, 'users'));
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.error('❌ [API] Erro ao listar usuários:', err);
                return [];
            }
        }
    },
    reviews: {
        list: async (productId: string): Promise<Review[]> => {
            try {
                const q = query(collection(db, 'reviews'), where('product_id', '==', productId));
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a: any, b: any) => {
                        const dateA = a.created_at?.toDate?.() || new Date(a.created_at || 0);
                        const dateB = b.created_at?.toDate?.() || new Date(b.created_at || 0);
                        return dateB.getTime() - dateA.getTime();
                    }) as any;
            } catch (err: any) {
                console.warn('⚠️ Erro ao listar reviews (índice?), retornando vazio:', err.message);
                return [];
            }
        },
        listAll: async (storeId: string): Promise<any[]> => {
            try {
                const q = query(collection(db, 'reviews'), where('store_id', '==', storeId));
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a: any, b: any) => {
                        const dateA = a.created_at?.toDate?.() || new Date(a.created_at || 0);
                        const dateB = b.created_at?.toDate?.() || new Date(b.created_at || 0);
                        return dateB.getTime() - dateA.getTime();
                    });
            } catch (err: any) {
                console.error('Erro ao carregar todas as avaliações:', err.message);
                throw err;
            }
        },
        create: async (review: Omit<Review, 'id' | 'created_at' | 'helpful_count'>): Promise<void> => {
            await addDoc(collection(db, 'reviews'), {
                ...review,
                created_at: serverTimestamp(),
                helpful_count: 0
            });
        },
        respond: async (reviewId: string, response: string): Promise<void> => {
            await updateDoc(doc(db, 'reviews', reviewId), {
                admin_response: response,
                admin_response_date: new Date().toISOString()
            });
        },
        delete: async (reviewId: string): Promise<void> => {
            await deleteDoc(doc(db, 'reviews', reviewId));
        },
        markHelpful: async (reviewId: string): Promise<void> => {
            // Sem RPC em Firestore nativo, usamos increment
            const { increment } = await import('firebase/firestore');
            await updateDoc(doc(db, 'reviews', reviewId), { helpful_count: increment(1) });
        }
    },
    wishlist: {
        list: async (sessionId: string, storeId: string = 'lojinhadas-gracas', userEmail?: string): Promise<WishlistItem[]> => {
            // Em Firestore queries OR são limitadas, faremos fetch e filtro simples se necessário
            const q = query(collection(db, 'wishlists'), where('store_id', '==', storeId));
            const querySnapshot = await getDocs(q);
            let items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));

            if (userEmail) {
                return items.filter(i => i.session_id === sessionId || i.user_email === userEmail);
            }
            return items.filter(i => i.session_id === sessionId);
        },
        add: async (item: Omit<WishlistItem, 'id' | 'added_at'>, storeId: string = 'lojinhadas-gracas'): Promise<void> => {
            await addDoc(collection(db, 'wishlists'), { ...item, store_id: storeId, added_at: serverTimestamp() });
        },
        remove: async (sessionId: string, productId: string): Promise<void> => {
            const q = query(collection(db, 'wishlists'), where('session_id', '==', sessionId), where('product_id', '==', productId));
            const snap = await getDocs(q);
            snap.forEach(async d => await deleteDoc(doc(db, 'wishlists', d.id)));
        },
        updatePreferences: async (sessionId: string, productId: string, prefs: any): Promise<void> => {
            const q = query(collection(db, 'wishlists'), where('session_id', '==', sessionId), where('product_id', '==', productId));
            const snap = await getDocs(q);
            snap.forEach(async d => await updateDoc(doc(db, 'wishlists', d.id), prefs));
        },
        updateNotifications: async (id: string, options: any): Promise<void> => {
            await updateDoc(doc(db, 'wishlists', id), options);
        }
    },
    coupons: {
        list: async (storeId: string): Promise<Coupon[]> => {
            try {
                const q = query(collection(db, 'coupons'), where('store_id', '==', storeId));
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        code: data.code,
                        type: data.type,
                        value: data.value,
                        minSpend: data.min_spend,
                        usageLimit: data.usage_limit,
                        usageCount: data.usage_count,
                        expiryDate: data.expiry_date,
                        isActive: data.is_active
                    } as Coupon;
                });
            } catch (err) {
                console.warn('Erro ao carregar cupons:', err);
                return [];
            }
        },
        create: async (coupon: any): Promise<void> => {
            const payload = {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                min_spend: coupon.minSpend,
                usage_limit: coupon.usageLimit,
                usage_count: coupon.usageCount,
                expiry_date: coupon.expiryDate,
                is_active: coupon.isActive,
                store_id: coupon.store_id,
                created_at: serverTimestamp()
            };
            await addDoc(collection(db, 'coupons'), payload);
        },
        update: async (coupon: any): Promise<void> => {
            await updateDoc(doc(db, 'coupons', coupon.id), {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                min_spend: coupon.minSpend,
                usage_limit: coupon.usageLimit,
                usage_count: coupon.usageCount,
                expiry_date: coupon.expiryDate,
                is_active: coupon.isActive
            });
        },
        delete: async (id: string): Promise<void> => {
            await deleteDoc(doc(db, 'coupons', id));
        }
    },
    newsletter: {
        subscribe: async (email: string, storeId: string = 'lojinhadas-gracas'): Promise<void> => {
            try {
                await addDoc(collection(db, 'newsletters'), {
                    email,
                    active: true,
                    store_id: storeId,
                    created_at: serverTimestamp()
                });
            } catch (err) {
                console.warn('Erro ao salvar email na newsletter:', err);
            }
        }
    },

    storage: {
        upload: async (file: File, _path: string): Promise<string> => {
            // Em vez de usar Firebase Storage (que exige plano pago em algumas regiões),
            // usamos compressão local e retornamos o Base64.
            // Como as páginas já esperam uma URL, o Base64 funciona perfeitamente.
            try {
                return await compressImage(file);
            } catch (error) {
                console.error("Erro na compressão:", error);
                throw error;
            }
        }
    }
};
