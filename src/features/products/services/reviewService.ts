import {
    collection,
    doc,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    increment,
    orderBy
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { Review } from '../../../types'

export const reviewService = {
    list: async (productId: string): Promise<Review[]> => {
        try {
            const q = query(
                collection(db, 'reviews'),
                where('product_id', '==', productId),
                orderBy('created_at', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any;
        } catch (err: any) {
            if (err.message?.includes('index')) {
                console.error('❌ ERRO DE ÍNDICE NO FIREBASE (Reviews): Você precisa criar um índice composto. Clique no link no erro abaixo.');
            }
            console.warn('⚠️ Erro ao listar reviews (índice?), retornando local:', err.message);
            const local = JSON.parse(localStorage.getItem('ljg_reviews') || '[]');
            return local.filter((r: any) => r.product_id === productId);
        }
    },
    listAll: async (storeId: string): Promise<any[]> => {
        try {
            const q = query(
                collection(db, 'reviews'),
                where('store_id', '==', storeId),
                orderBy('created_at', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err: any) {
            if (err.message?.includes('index')) {
                console.error('❌ ERRO DE ÍNDICE NO FIREBASE (Reviews): Você precisa criar um índice composto. Clique no link no erro abaixo.');
            }
            console.error('Erro ao carregar todas as avaliações:', err.message);
            return JSON.parse(localStorage.getItem('ljg_reviews') || '[]');
        }
    },
    create: async (review: Omit<Review, 'id' | 'created_at' | 'helpful_count'>, storeId: string): Promise<void> => {
        try {
            await addDoc(collection(db, 'reviews'), {
                ...review,
                store_id: storeId,
                created_at: serverTimestamp(),
                helpful_count: 0
            });
        } catch (err: any) {
            console.warn('⚠️ Salvando review apenas localmente:', err.message);
            const reviews = JSON.parse(localStorage.getItem('ljg_reviews') || '[]');
            reviews.push({ ...review, id: crypto.randomUUID(), created_at: new Date().toISOString(), helpful_count: 0 });
            localStorage.setItem('ljg_reviews', JSON.stringify(reviews));
        }
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
        await updateDoc(doc(db, 'reviews', reviewId), { helpful_count: increment(1) });
    }
}
