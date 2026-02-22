export const EmailService = {
    /**
     * Dispara um e-mail de confirmação de pedido via Vercel Serverless Function.
     * @param orderId ID do pedido
     * @param customerEmail Email do cliente
     */
    sendOrderConfirmation: async (orderId: string, customerEmail: string): Promise<boolean> => {
        try {
            console.log(`[EmailService] Disparando e-mail para ${customerEmail} (Pedido #${orderId})`);

            const response = await fetch('/api/send-order-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, customerEmail })
            });

            if (!response.ok) {
                const error = await response.json();
                console.warn('[EmailService] Falha ao enviar e-mail:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('[EmailService] Erro ao disparar e-mail:', err);
            return false;
        }
    }
};
