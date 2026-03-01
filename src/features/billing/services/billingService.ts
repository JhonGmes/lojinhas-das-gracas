import { db } from '../../../lib/firebase';
import { collection, doc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface Subscription {
    id: string;
    storeId: string;
    plan: 'basic' | 'pro';
    status: 'active' | 'past_due' | 'canceled' | 'incomplete';
    currentPeriodEnd: any;
    cancelAtPeriodEnd: boolean;
    mercadoPagoSubscriptionId?: string;
    customerEmail: string;
}

export const billingService = {
    async getSubscription(storeId: string): Promise<Subscription | null> {
        const q = query(collection(db, 'subscriptions'), where('storeId', '==', storeId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Subscription;
    },

    async createCheckoutSession(storeId: string, plan: 'basic' | 'pro') {
        // In a real scenario, this would call a backend function to create a Mercado Pago preference
        // For this implementation, we'll simulate the redirect or process
        console.log(`Creating checkout session for store ${storeId} and plan ${plan}`);

        // Simulation of a successful checkout for now
        return {
            url: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=SIMULATED_ID_${Date.now()}`
        };
    },

    async updateSubscription(subscriptionId: string, data: Partial<Subscription>) {
        const subRef = doc(db, 'subscriptions', subscriptionId);
        await updateDoc(subRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    }
};
