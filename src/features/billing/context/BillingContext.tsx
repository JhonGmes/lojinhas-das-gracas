import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useStore } from '../../store/context/StoreContext';
import { type Subscription, billingService } from '../services/billingService';
import { mercadoPagoService } from '../services/mercadoPagoService';

interface BillingContextType {
    subscription: Subscription | null;
    loading: boolean;
    refreshSubscription: () => Promise<void>;
    upgrade: (planId: string) => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
    const { currentStoreId } = useStore();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSubscription = useCallback(async () => {
        if (!currentStoreId) return;
        setLoading(true);
        try {
            const data = await billingService.getSubscription(currentStoreId);
            setSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    }, [currentStoreId]);

    useEffect(() => {
        refreshSubscription();
    }, [refreshSubscription]);

    const upgrade = async (planId: string) => {
        if (!currentStoreId) return;

        try {
            console.log(`Iniciando upgrade para ${planId}...`);
            const preference = await mercadoPagoService.createSubscriptionPreference(planId, currentStoreId);

            // Redirect to Mercado Pago checkout
            window.location.href = preference.initPoint;
        } catch (error) {
            console.error('Upgrade failed:', error);
            alert('Não foi possível iniciar o checkout. Tente novamente.');
        }
    };

    return (
        <BillingContext.Provider value={{ subscription, loading, refreshSubscription, upgrade }}>
            {children}
        </BillingContext.Provider>
    );
}

export const useBilling = () => {
    const context = useContext(BillingContext);
    if (context === undefined) {
        throw new Error('useBilling must be used within a BillingProvider');
    }
    return context;
};
