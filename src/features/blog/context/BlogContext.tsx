import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { BlogPost } from '../../../types';
import { blogService } from '../services/blogService';
import { useStore } from '../../store/context/StoreContext';

interface BlogContextType {
    posts: BlogPost[];
    loading: boolean;
    refreshPosts: () => Promise<void>;
    createPost: (post: Omit<BlogPost, 'id'>) => Promise<void>;
    updatePost: (post: BlogPost) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
    generateAIContent: (reference: string) => Promise<Partial<BlogPost>>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
    const { currentStoreId } = useStore();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshPosts = async () => {
        try {
            const data = await blogService.list(currentStoreId);
            setPosts(data || []);
        } catch (error) {
            console.error("Failed to fetch blog posts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshPosts();
    }, [currentStoreId]);

    const createPost = async (post: Omit<BlogPost, 'id'>) => {
        await blogService.create(post, currentStoreId);
        await refreshPosts();
    };

    const updatePost = async (post: BlogPost) => {
        await blogService.update(post, currentStoreId);
        await refreshPosts();
    };

    const deletePost = async (id: string) => {
        await blogService.delete(id, currentStoreId);
        await refreshPosts();
    };

    const generateAIContent = async (reference: string): Promise<Partial<BlogPost>> => {
        try {
            console.warn('AI Content Generation (Supabase) desativado. Migre para Firebase Cloud Functions.');
            return {
                title: 'Post Gerado por IA (Exemplo)',
                content: `Baseado em: ${reference}. Esta funcionalidade está sendo migrada para o Firebase.`
            };
        } catch (error: any) {
            console.error('Erro ao gerar conteúdo:', error);
            throw new Error(error.message || 'Falha ao gerar conteúdo com IA');
        }
    };

    return (
        <BlogContext.Provider value={{
            posts,
            loading,
            refreshPosts,
            createPost,
            updatePost,
            deletePost,
            generateAIContent
        }}>
            {children}
        </BlogContext.Provider>
    );
}

export const useBlog = () => {
    const context = useContext(BlogContext);
    if (context === undefined) {
        throw new Error('useBlog must be used within a BlogProvider');
    }
    return context;
};
