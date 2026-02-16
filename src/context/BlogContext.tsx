import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { BlogPost } from '../types';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import { useStore } from './StoreContext';

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

const INITIAL_BLOG: Omit<BlogPost, 'id'>[] = [
    {
        title: 'A Importância da Oração do Rosário em Família',
        content: 'Conteúdo completo sobre o Rosário...',
        excerpt: 'Descubra como o hábito de rezar o terço em família pode fortalecer os laços de amor e fé no seu lar.',
        date: '05 Out, 2023',
        author: 'Pe. João',
        image: 'https://images.unsplash.com/photo-1544764200-d834fd210a23?auto=format&fit=crop&q=80&w=800',
        category: 'Espiritualidade',
        isFeatured: true,
        isPublished: true
    },
    {
        title: 'Significado das Medalhas Milagrosas',
        content: 'Conteúdo sobre medalhas...',
        excerpt: 'Conheça a história e os milagres atribuídos à medalha de Nossa Senhora das Graças ao longo dos séculos.',
        date: '02 Out, 2023',
        author: 'Irmã Maria',
        image: 'https://images.unsplash.com/photo-1590070183884-3c6628889815?auto=format&fit=crop&q=80&w=800',
        category: 'História',
        isFeatured: true,
        isPublished: true
    },
    {
        title: 'Oração para um Dia de Paz e Proteção',
        content: 'Conteúdo da oração...',
        excerpt: 'Comece sua manhã com esta oração especial pedindo a intercessão divina para guiar seus passos.',
        date: '28 Set, 2023',
        author: 'Equipe das Graças',
        image: 'https://images.unsplash.com/photo-1507434912635-59b3ee373487?auto=format&fit=crop&q=80&w=800',
        category: 'Oração',
        isFeatured: true,
        isPublished: true
    }
];


export function BlogProvider({ children }: { children: ReactNode }) {
    const { currentStoreId } = useStore();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshPosts = async () => {
        try {
            const data = await api.blog.list(currentStoreId);
            if (data.length === 0) {
                // Initialize if empty (for demo)
                for (const p of INITIAL_BLOG) {
                    await api.blog.create(p, currentStoreId);
                }
                const firstData = await api.blog.list(currentStoreId);
                setPosts(firstData);
            } else {
                setPosts(data);
            }
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
        await api.blog.create(post, currentStoreId);
        await refreshPosts();
    };

    const updatePost = async (post: BlogPost) => {
        await api.blog.update(post);
        await refreshPosts();
    };

    const deletePost = async (id: string) => {
        await api.blog.delete(id);
        await refreshPosts();
    };

    const generateAIContent = async (reference: string): Promise<Partial<BlogPost>> => {
        try {
            console.log('Chamando Supabase Edge Function...');

            // Call Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('generate-blog-ai', {
                body: { reference }
            });

            if (error) {
                console.error('Edge Function error:', error);
                throw error;
            }

            console.log('Resposta da Edge Function:', data);

            // Data is already parsed JSON from the Edge Function
            return data as Partial<BlogPost>;

        } catch (error: any) {
            console.error('Erro ao gerar conteúdo:', error);
            // Re-throwing the error as per the instruction's new catch block logic
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
