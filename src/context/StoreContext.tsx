import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

interface StoreSettings {
    id: string;
    store_name: string;
    whatsapp_number: string;
    store_email?: string;
    primary_color: string;
    logo_url?: string;
    hero_title?: string;
    hero_subtitle?: string;
    hero_button_text?: string;
    hero_image_url?: string;
    hero_banners?: string[];
    pix_key?: string;
    instagram_url?: string;
    infinitepay_handle?: string;
    monthly_revenue_goal?: number;
    notification_sound_url?: string;
}

interface StoreContextType {
    settings: StoreSettings;
    loading: boolean;
    currentStoreId: string;
    setStore: (id: string) => void;
    updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001';

export function StoreProvider({ children }: { children: ReactNode }) {
    const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
        return localStorage.getItem('managed_store_id') || DEFAULT_STORE_ID;
    });
    const [settings, setSettings] = useState<StoreSettings>({
        id: '',
        store_name: 'Carregando Loja...',
        whatsapp_number: '',
        primary_color: '#D4AF37',
        hero_title: 'Encontre Paz e Devoção',
        hero_subtitle: 'Artigos religiosos selecionados com amor para fortalecer sua fé.',
        hero_button_text: 'Ver Ofertas',
        hero_image_url: 'https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000',
        hero_banners: [],
        pix_key: 'suachave@pix.com',
        instagram_url: 'https://instagram.com/lojinhadasgracas',
        monthly_revenue_goal: 5000,
        notification_sound_url: 'https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3'
    });
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await api.settings.getByStoreId(currentStoreId);
            if (data) {
                setSettings(data);
            } else {
                // Reset states for new store to avoid data leakage from previous store (e.g. Lojinha das Graças)
                setSettings({
                    id: '',
                    store_name: 'Nova Loja',
                    whatsapp_number: '',
                    primary_color: '#D4AF37',
                    hero_title: 'Bem-vindo',
                    hero_subtitle: 'Configure sua nova loja no painel administrativo.',
                    hero_button_text: 'Ver Produtos',
                    hero_image_url: 'https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000',
                    hero_banners: [],
                    pix_key: '',
                    instagram_url: '',
                    infinitepay_handle: ''
                } as any);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const detectStore = async () => {
            // 1. Prioridade para parâmetro na URL (ótimo para testes: ?shop=slug)
            const params = new URLSearchParams(window.location.search);
            const storeSlug = params.get('shop');

            if (storeSlug) {
                const { data } = await supabase.from('stores').select('id').eq('slug', storeSlug).single();
                if (data?.id) {
                    setCurrentStoreId(data.id);
                    return;
                }
            }

            // 2. Detecção por Subdomínio (Ex: shop1.lojinhasdasgracas.com)
            const host = window.location.hostname;
            // Se não for localhost e tiver 3 partes (sub.domino.com)
            const parts = host.split('.');
            if (parts.length >= 3 && parts[0] !== 'www' && !host.includes('localhost') && !host.includes('127.0.0.1')) {
                const slug = parts[0];
                const { data } = await supabase.from('stores').select('id').eq('slug', slug).single();
                if (data?.id) {
                    setCurrentStoreId(data.id);
                }
            }
        };
        detectStore();
    }, []);

    const setStore = (id: string) => {
        setCurrentStoreId(id);
        localStorage.setItem('managed_store_id', id);
    };

    useEffect(() => {
        loadSettings();
    }, [currentStoreId]);

    // Apply primary color to CSS variables
    useEffect(() => {
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--color-primary', settings.primary_color);
            // Simple darkening effect for the "dark" version
            const darkColor = settings.primary_color + 'CC'; // Adding transparency as a quick dark version
            document.documentElement.style.setProperty('--color-primary-dark', darkColor);
        }
    }, [settings.primary_color]);

    const updateSettings = async (newSettings: Partial<StoreSettings>) => {
        const updated = {
            ...settings,
            ...newSettings,
            store_id: currentStoreId
        };
        await api.settings.update(updated);
        await loadSettings();
    };

    return (
        <StoreContext.Provider value={{ settings, loading, currentStoreId, setStore, updateSettings }}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
