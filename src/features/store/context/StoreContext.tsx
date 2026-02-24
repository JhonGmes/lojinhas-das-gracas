import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { storeService } from '../services/storeService';
import { collection, query, where, getDocs, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';

export interface StoreSettings {
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
    about_text?: string;
    privacy_policy?: string;
    manager_name?: string;
    plan?: 'basic' | 'pro';
    status?: 'active' | 'inactive';
}

interface StoreContextType {
    settings: StoreSettings;
    loading: boolean;
    currentStoreId: string;
    setStore: (id: string) => void;
    updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
    hasFeature: (feature: 'blog' | 'coupons' | 'wishlist' | 'metrics_pro') => boolean;
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
        notification_sound_url: 'https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3',
        about_text: 'Somos uma loja dedicada a trazer paz e devoção para sua vida através de produtos cuidadosamente selecionados...',
        privacy_policy: 'Sua privacidade é importante para nós. Coletamos apenas as informações necessárias para procressar seu pedido...',
        manager_name: 'Gerente'
    });
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const DEFAULT_SETTINGS = {
        id: DEFAULT_STORE_ID,
        store_id: DEFAULT_STORE_ID,
        store_name: 'Lojinha das Graças',
        whatsapp_number: '5598984095956',
        primary_color: '#D4AF37',
        hero_title: 'PAZ E DEVOÇÃO',
        hero_subtitle: 'Artigos religiosos selecionados com amor para fortalecer sua fé.',
        hero_button_text: 'VER OFERTAS',
        hero_image_url: 'https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000',
        hero_banners: [],
        pix_key: '5598984095956',
        instagram_url: 'https://instagram.com/lojinhadasgracas',
        infinitepay_handle: 'lojinhadasgracas',
        about_text: 'Levando a paz de Cristo até você.',
        privacy_policy: 'Seus dados estão protegidos conosco.',
        manager_name: 'Jhon Gomes',
        monthly_revenue_goal: 5000,
        plan: 'pro' as const,
        status: 'active' as const
    };

    const initializeStoreIfNeeded = async () => {
        if (currentStoreId !== DEFAULT_STORE_ID) return;
        try {
            const storeRef = doc(db, 'stores', DEFAULT_STORE_ID);
            const storeSnap = await getDoc(storeRef);
            if (!storeSnap.exists()) {
                await setDoc(storeRef, {
                    name: 'Lojinha das Graças',
                    slug: 'lojinhas-das-gracas',
                    status: 'active',
                    created_at: new Date().toISOString()
                });
                console.log('✅ Store document auto-created in Firestore');
            }

            const settingsRef = doc(db, 'store_settings', DEFAULT_STORE_ID);
            const settingsSnap = await getDoc(settingsRef);
            if (!settingsSnap.exists()) {
                await setDoc(settingsRef, { ...DEFAULT_SETTINGS, created_at: new Date().toISOString() });
                console.log('✅ Store settings auto-created in Firestore');
            }
        } catch (e) {
            console.warn('⚠️ Could not auto-initialize store (not authenticated yet):', e);
        }
    };

    const loadSettings = async () => {
        setLoading(true);
        try {
            await initializeStoreIfNeeded();
            const data = await storeService.settings.getByStoreId(currentStoreId);
            if (data) {
                setSettings(data as StoreSettings);
            } else {
                if (currentStoreId === DEFAULT_STORE_ID) {
                    setSettings(DEFAULT_SETTINGS);
                    return;
                }
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
                    infinitepay_handle: '',
                    about_text: '',
                    privacy_policy: '',
                    plan: 'basic' as const,
                    status: 'active' as const
                } as StoreSettings);
            }
        } catch (error) {
            console.warn('Using fallback settings:', error);
            if (currentStoreId === DEFAULT_STORE_ID) {
                setSettings(DEFAULT_SETTINGS);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const detectStore = async () => {
            const host = window.location.hostname;
            const params = new URLSearchParams(window.location.search);
            const storeSlug = params.get('shop');

            // 1. Prioridade: Parâmetro de URL (facilitador de teste local)
            if (storeSlug) {
                if (storeSlug === 'lojinhadas-gracas' || storeSlug === 'lojinhas-das-gracas') {
                    setCurrentStoreId(DEFAULT_STORE_ID);
                    return;
                }
                try {
                    const q = query(collection(db, 'stores'), where('slug', '==', storeSlug), limit(1));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        setCurrentStoreId(snap.docs[0].id);
                        return;
                    }
                } catch (e) {
                    console.warn("Store slug detection failed:", e);
                }
            }

            // 2. Detecção via Hostname (Subdomínio)
            if (
                host.includes('lojinhadas-gracas') ||
                host.includes('lojinhas-das-gracas') ||
                host === 'lojinhas-das-gracas.vercel.app'
            ) {
                setCurrentStoreId(DEFAULT_STORE_ID);
                return;
            }

            const parts = host.split('.');
            // Padrão: subdominio.seusite.com
            if (parts.length >= 3 && parts[0] !== 'www' && !host.includes('localhost') && !host.includes('127.0.0.1')) {
                const slug = parts[0];
                try {
                    const q = query(collection(db, 'stores'), where('slug', '==', slug), limit(1));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        setCurrentStoreId(snap.docs[0].id);
                        return;
                    }
                } catch (e) {
                    console.error("Store detection crash:", e);
                }
            }

            // 3. Fallback: Se nenhuma loja for encontrada, redirecionar ou usar padrão (conforme escolha do usuário: "Redirecionar")
            if (host !== 'localhost' && !host.includes('127.0.0.1')) {
                console.warn('Loja não encontrada para o host:', host);
                // Aqui poderíamos redirecionar para a landing page global vendedora do SaaS
                // window.location.href = 'https://lojinhas-das-gracas.vercel.app';
            }
        };
        detectStore();
    }, []);

    const hasFeature = (feature: 'blog' | 'coupons' | 'wishlist' | 'metrics_pro'): boolean => {
        // Master account bypass
        if (user?.email === 'jhongprojetos@gmail.com') return true;

        const plan = settings.plan || 'basic';
        if (plan === 'pro') return true;

        const allowedBasic: string[] = ['wishlist']; // Wishlist liberado para todos para engajamento
        return allowedBasic.includes(feature);
    };

    const setStore = (id: string) => {
        setCurrentStoreId(id);
        localStorage.setItem('managed_store_id', id);
    };

    useEffect(() => {
        loadSettings();
    }, [currentStoreId]);

    useEffect(() => {
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--color-primary', settings.primary_color);
            const darkColor = settings.primary_color + 'CC';
            document.documentElement.style.setProperty('--color-primary-dark', darkColor);
        }
    }, [settings.primary_color]);

    const updateSettings = async (newSettings: Partial<StoreSettings>) => {
        const updated = {
            ...settings,
            ...newSettings,
            store_id: currentStoreId
        };
        await storeService.settings.update(updated);
        await loadSettings();
    };

    return (
        <StoreContext.Provider value={{ settings, loading, currentStoreId, setStore, updateSettings, hasFeature }}>
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
