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
    orderBy,
    serverTimestamp,
    limit
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { Order, Coupon } from '../../../types'

const LS_ORDERS = 'ljg_orders'

const getLocalOrders = (): Order[] => {
    const stored = localStorage.getItem(LS_ORDERS)
    return stored ? JSON.parse(stored) : []
}

export const orderService = {
    orders: {
        create: async (order: Order, storeId: string): Promise<Order | any> => {
            try {
                const payload = {
                    ...order,
                    store_id: storeId,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp()
                };
                const docRef = await addDoc(collection(db, 'orders'), payload);
                return { ...order, id: docRef.id };
            } catch (err: any) {
                console.warn('⚠️ Fallback LocalStorage (Orders):', err.message);
                const orders = getLocalOrders();
                const newOrder = { ...order, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
                orders.push(newOrder);
                localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                return newOrder;
            }
        },

        list: async (storeId: string): Promise<Order[]> => {
            try {
                const q = query(
                    collection(db, 'orders'),
                    where('store_id', '==', storeId),
                    orderBy('created_at', 'desc')
                );
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at
                } as Order));
            } catch (err: any) {
                if (err.message?.includes('index')) {
                    console.error('❌ ERRO DE ÍNDICE NO FIREBASE: Você precisa criar um índice composto para "orders" no Console do Firebase (store_id ASC, created_at DESC).');
                }
                console.error('Erro ao listar pedidos no Firebase:', err.message);
                return getLocalOrders();
            }
        },

        updateStatus: async (id: string, status: Order['status'], storeId: string): Promise<void> => {
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    // Try LocalStorage if not in Firestore
                    const orders = getLocalOrders();
                    const index = orders.findIndex(o => o.id === id);
                    if (index !== -1) {
                        orders[index].status = status;
                        orders[index].updatedAt = new Date().toISOString();
                        localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                        console.log('✅ Status atualizado localmente (Pedido não encontrado no Firestore)');
                        return;
                    }
                    throw new Error('Pedido não encontrado.');
                }

                if (docSnap.data()?.store_id !== storeId) {
                    throw new Error('Permissão negada ou pedido de outra loja.');
                }

                await updateDoc(docRef, {
                    status,
                    updated_at: serverTimestamp()
                });
            } catch (err: any) {
                console.error('❌ Erro ao atualizar status do pedido:', err.message);

                // Fallback final para LocalStorage em caso de qualquer erro (ex: falta de índice ou timeout)
                const orders = getLocalOrders();
                const index = orders.findIndex(o => o.id === id);
                if (index !== -1) {
                    orders[index].status = status;
                    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                    console.warn('⚠️ Status atualizado apenas localmente devido a erro no servidor.');
                    return;
                }
                throw err;
            }
        },

        getMetrics: async (storeId: string) => {
            try {
                const q = query(collection(db, 'orders'), where('store_id', '==', storeId));
                const snap = await getDocs(q);
                const orders = snap.docs.map(d => d.data());

                const totalRevenue = orders
                    .filter(o => o.status === 'completed' || o.status === 'paid')
                    .reduce((sum, o) => sum + (o.total || 0), 0);

                return {
                    totalOrders: orders.length,
                    totalRevenue,
                    pendingOrders: orders.filter(o => o.status === 'pending').length
                };
            } catch {
                return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };
            }
        },

        getById: async (id: string): Promise<Order | null> => {
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return { id: docSnap.id, ...docSnap.data() } as Order;
                }
            } catch (err) {
                console.warn('⚠️ Buscando pedido localmente');
            }
            const localOrder = getLocalOrders().find(o => o.id === id);
            return localOrder || null;
        },

        updateOrderWithCustomerData: async (id: string, data: any): Promise<void> => {
            try {
                const docRef = doc(db, 'orders', id);
                await updateDoc(docRef, {
                    customer_data: data,
                    updated_at: new Date().toISOString()
                });
            } catch (err) {
                const orders = getLocalOrders();
                const index = orders.findIndex(o => o.id === id);
                if (index !== -1) {
                    orders[index].customerData = data;
                    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                }
            }
        },

        confirmPayment: async (orderIdOrOrder: string | Order, storeId?: string): Promise<void> => {
            const id = typeof orderIdOrOrder === 'string' ? orderIdOrOrder : orderIdOrOrder.id;
            try {
                const docRef = doc(db, 'orders', id);

                if (storeId) {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data()?.store_id !== storeId) {
                        throw new Error('Permissão negada.');
                    }
                }

                await updateDoc(docRef, {
                    status: 'paid',
                    updated_at: serverTimestamp()
                });
            } catch (err: any) {
                console.error('❌ Erro ao confirmar pagamento:', err.message);
                const orders = getLocalOrders();
                const index = orders.findIndex(o => o.id === id);
                if (index !== -1) {
                    orders[index].status = 'paid';
                    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
                    console.warn('⚠️ Pagamento confirmado apenas localmente.');
                    return;
                }
                throw err;
            }
        },

        delete: async (id: string, storeId: string): Promise<void> => {
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    if (docSnap.data()?.store_id !== storeId) {
                        throw new Error('Permissão negada.');
                    }
                    await deleteDoc(docRef);
                }

                // Always clean local
                const orders = getLocalOrders();
                const filtered = orders.filter(o => o.id !== id);
                if (filtered.length !== orders.length) {
                    localStorage.setItem(LS_ORDERS, JSON.stringify(filtered));
                }
            } catch (err: any) {
                console.error('❌ Erro ao deletar pedido:', err.message);
                const orders = getLocalOrders();
                const filtered = orders.filter(o => o.id !== id);
                localStorage.setItem(LS_ORDERS, JSON.stringify(filtered));
            }
        }
    },

    coupons: {
        list: async (storeId: string): Promise<Coupon[]> => {
            try {
                const q = query(collection(db, 'coupons'), where('store_id', '==', storeId));
                const snap = await getDocs(q);
                return snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
            } catch {
                return [];
            }
        },
        create: async (coupon: Omit<Coupon, 'id'>, storeId: string): Promise<void> => {
            await addDoc(collection(db, 'coupons'), { ...coupon, store_id: storeId, created_at: serverTimestamp() });
        },
        update: async (id: string, data: Partial<Coupon>, storeId: string): Promise<void> => {
            const docRef = doc(db, 'coupons', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists() || docSnap.data()?.store_id !== storeId) {
                throw new Error('Permissão negada.');
            }
            await updateDoc(docRef, data);
        },
        delete: async (id: string, storeId: string): Promise<void> => {
            const docRef = doc(db, 'coupons', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists() || docSnap.data()?.store_id !== storeId) {
                throw new Error('Permissão negada.');
            }
            await deleteDoc(docRef);
        },
        validate: async (code: string, storeId: string): Promise<Coupon | null> => {
            const q = query(
                collection(db, 'coupons'),
                where('code', '==', code.toUpperCase()),
                where('store_id', '==', storeId),
                where('active', '==', true),
                limit(1)
            );
            const snap = await getDocs(q);
            if (snap.empty) return null;
            return { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
        }
    }
}
