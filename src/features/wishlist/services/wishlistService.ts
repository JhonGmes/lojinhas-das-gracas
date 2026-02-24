import {
    collection,
    doc,
    getDocs,
    query,
    where,
    addDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { WishlistItem } from '../../../types'

export const wishlistService = {
    list: async (sessionId: string, storeId: string, userEmail?: string): Promise<WishlistItem[]> => {
        try {
            const q = query(
                collection(db, 'wishlists'),
                where('store_id', '==', storeId)
            );
            const querySnapshot = await getDocs(q);
            let items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));

            if (userEmail) {
                return items.filter(i => i.session_id === sessionId || i.user_email === userEmail);
            }
            return items.filter(i => i.session_id === sessionId);
        } catch (err) {
            console.error('Erro ao listar favoritos:', err);
            return [];
        }
    },
    add: async (item: Omit<WishlistItem, 'id' | 'added_at'>, storeId: string): Promise<void> => {
        await addDoc(collection(db, 'wishlists'), { ...item, store_id: storeId, added_at: serverTimestamp() });
    },
    remove: async (sessionId: string, productId: string, storeId: string): Promise<void> => {
        const q = query(
            collection(db, 'wishlists'),
            where('session_id', '==', sessionId),
            where('product_id', '==', productId),
            where('store_id', '==', storeId)
        );
        const snap = await getDocs(q);
        snap.forEach(async d => await deleteDoc(doc(db, 'wishlists', d.id)));
    },
    updatePreferences: async (sessionId: string, productId: string, storeId: string, prefs: any): Promise<void> => {
        const q = query(
            collection(db, 'wishlists'),
            where('session_id', '==', sessionId),
            where('product_id', '==', productId),
            where('store_id', '==', storeId)
        );
        const snap = await getDocs(q);
        snap.forEach(async d => await updateDoc(doc(db, 'wishlists', d.id), prefs));
    },
    updateNotifications: async (id: string, options: any): Promise<void> => {
        await updateDoc(doc(db, 'wishlists', id), options);
    }
}
