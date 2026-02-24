import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useStore } from '../../store/context/StoreContext';
import type { WishlistItem } from '../../../types';
import { toast } from 'react-hot-toast';

interface WishlistContextType {
    items: WishlistItem[];
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    updatePreferences: (productId: string, prefs: { notify_on_sale?: boolean; notify_on_stock?: boolean }) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LS_SESSION_ID = 'ljg_wishlist_session';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentStoreId } = useStore();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        let id = localStorage.getItem(LS_SESSION_ID);
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(LS_SESSION_ID, id);
        }
        setSessionId(id);
        loadWishlist(id, currentStoreId);
    }, [currentStoreId]);

    const loadWishlist = async (id: string, storeId: string) => {
        try {
            const data = await wishlistService.list(id, storeId);
            setItems(data);
        } catch (error) {
            console.error('Erro ao carregar wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId: string) => {
        try {
            if (items.find(i => i.product_id === productId)) return;

            await wishlistService.add({
                session_id: sessionId,
                product_id: productId,
                notify_on_sale: false,
                notify_on_stock: false
            }, currentStoreId);

            await loadWishlist(sessionId, currentStoreId);
            toast.success('Adicionado à lista de desejos! ❤️');
        } catch (error) {
            console.error('Erro ao adicionar à wishlist:', error);
            toast.error('Erro ao adicionar à lista de desejos.');
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            await wishlistService.remove(sessionId, productId, currentStoreId);
            setItems(prev => prev.filter(i => i.product_id !== productId));
            toast.success('Removido da lista de desejos.');
        } catch (error) {
            console.error('Erro ao remover da wishlist:', error);
            toast.error('Erro ao remover da lista de desejos.');
        }
    };

    const updatePreferences = async (productId: string, prefs: { notify_on_sale?: boolean; notify_on_stock?: boolean }) => {
        try {
            await wishlistService.updatePreferences(sessionId, productId, currentStoreId, prefs);
            setItems(prev => prev.map(item =>
                item.product_id === productId ? { ...item, ...prefs } : item
            ));
            toast.success('Preferências de notificação atualizadas! 🔔');
        } catch (error) {
            console.error('Erro ao atualizar preferências:', error);
            toast.error('Erro ao salvar preferências.');
        }
    };

    const isInWishlist = (productId: string) => {
        return items.some(i => i.product_id === productId);
    };

    return (
        <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, updatePreferences, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
};
