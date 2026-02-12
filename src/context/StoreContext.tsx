import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../services/api';

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
    infinitepay_handle?: string;
}

interface StoreContextType {
    settings: StoreSettings;
    loading: boolean;
    updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<StoreSettings>({
        id: '',
        store_name: 'Lojinha das Graças',
        whatsapp_number: '5598984095956',
        primary_color: '#D4AF37',
        hero_title: 'Encontre Paz e Devoção',
        hero_subtitle: 'Artigos religiosos selecionados com amor para fortalecer sua fé.',
        hero_button_text: 'Ver Ofertas',
        hero_image_url: 'https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000',
        hero_banners: [],
        pix_key: 'suachave@pix.com'
    });
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            const data = await api.settings.get();
            if (data) setSettings(data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

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
        const updated = { ...settings, ...newSettings };
        await api.settings.update(updated);
        await loadSettings();
    };

    return (
        <StoreContext.Provider value={{ settings, loading, updateSettings }}>
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
