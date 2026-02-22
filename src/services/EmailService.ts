import { supabase } from '../lib/supabase';

export const EmailService = {
    /**
     * Dispara um e-mail de confirmação de pedido via Edge Function do Supabase.
     * @param orderId ID do pedido
     * @param customerEmail Email do cliente
     */
    sendOrderConfirmation: async (orderId: string, customerEmail: string): Promise<boolean> => {
        try {
            console.log(`[EmailService] Disparando e-mail para ${customerEmail} (Pedido #${orderId})`);

            const { data, error } = await supabase.functions.invoke('order-confirmed', {
                body: { orderId, customerEmail }
            });

            if (error) {
                console.warn('[EmailService] Edge Function falhou ou não existe. O e-mail não será enviado até que o deploy seja feito.', error);
                return false;
            }

            return !!data;
        } catch (err) {
            console.error('[EmailService] Erro ao invocar Edge Function:', err);
            return false;
        }
    }
};
