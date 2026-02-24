import {
    doc,
    getDoc,
    getDocs,
    query,
    where,
    setDoc,
    serverTimestamp,
    limit,
    collection,
    addDoc,
    orderBy,
    updateDoc,
    deleteDoc
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'

export const storeService = {
    settings: {
        getByStoreId: async (storeId: string): Promise<any> => {
            try {
                const docRef = doc(db, 'store_settings', storeId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };

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
    newsletter: {
        subscribe: async (email: string, storeId: string): Promise<void> => {
            await addDoc(collection(db, 'newsletters'), {
                email,
                active: true,
                store_id: storeId,
                created_at: serverTimestamp()
            });
        }
    },
    waitingList: {
        create: async (data: any, storeId: string): Promise<void> => {
            try {
                await addDoc(collection(db, 'waiting_list'), {
                    ...data,
                    store_id: storeId,
                    created_at: serverTimestamp()
                });
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
            } catch (err: any) {
                if (err.message?.includes('index')) {
                    console.error('❌ ERRO DE ÍNDICE NO FIREBASE (Waitlist): Você precisa criar um índice composto para "waiting_list" no Console do Firebase (store_id ASC, created_at DESC).');
                }
                console.warn('⚠️ Buscando lista de espera localmente:', err.message);
                return JSON.parse(localStorage.getItem('ljg_waitlist') || '[]');
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
    }
}
