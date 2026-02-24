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
    increment
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { Review } from '../../../types'

export const reviewService = {
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
    create: async (review: Omit<Review, 'id' | 'created_at' | 'helpful_count'>, storeId: string): Promise<void> => {
        await addDoc(collection(db, 'reviews'), {
            ...review,
            store_id: storeId,
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
        await updateDoc(doc(db, 'reviews', reviewId), { helpful_count: increment(1) });
    }
}
