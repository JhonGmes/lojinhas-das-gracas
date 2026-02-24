import {
    collection,
    doc,
    getDocs,
    updateDoc
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'

export const authService = {
    usuarios: {
        list: async (): Promise<any[]> => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.error('❌ [AuthService] Erro ao listar usuários:', err);
                return [];
            }
        },
        update: async (userId: string, data: any): Promise<void> => {
            try {
                await updateDoc(doc(db, 'users', userId), data);
            } catch (err) {
                console.error('❌ [AuthService] Erro ao atualizar usuário:', err);
                throw err;
            }
        }
    }
}
