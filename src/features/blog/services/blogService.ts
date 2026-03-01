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
import type { BlogPost } from '../../../types'

export const blogService = {
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
                    ...data,
                    id: doc.id,
                    isFeatured: data.is_featured,
                    isPublished: data.is_published,
                    date: data.date?.toDate?.()?.toISOString() || data.date || data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date(0).toISOString(),
                    created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date(0).toISOString()
                } as any as BlogPost;
            }).sort((a, b) => {
                const dateA = new Date(a.date || a.created_at).getTime();
                const dateB = new Date(b.date || b.created_at).getTime();
                return dateB - dateA;
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
    update: async (post: BlogPost, storeId: string): Promise<void> => {
        try {
            // Verificação de segurança
            const docRef = doc(db, 'blog_posts', post.id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists() || docSnap.data()?.store_id !== storeId) {
                throw new Error('Permissão negada ou post não encontrado nesta loja.');
            }

            const payload = {
                ...post,
                is_featured: post.isFeatured,
                is_published: post.isPublished,
                updated_at: serverTimestamp()
            };
            delete (payload as any).isFeatured;
            delete (payload as any).isPublished;
            await updateDoc(docRef, payload);
        } catch (err: any) {
            console.error('Erro ao atualizar post:', err.message);
            throw err;
        }
    },
    delete: async (id: string, storeId: string): Promise<void> => {
        try {
            // Verificação de segurança
            const docRef = doc(db, 'blog_posts', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists() || docSnap.data()?.store_id !== storeId) {
                throw new Error('Permissão negada ou post não encontrado nesta loja.');
            }

            await deleteDoc(docRef);
        } catch (err: any) {
            console.error('Erro ao deletar post:', err.message);
            throw err;
        }
    }
}
