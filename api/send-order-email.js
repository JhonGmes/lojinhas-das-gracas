/* eslint-disable no-undef */
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { orderId, customerEmail } = req.body;

    if (!orderId || !customerEmail) {
        return res.status(400).json({ error: 'Missing orderId or customerEmail' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Fetch order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            console.error("[Email API] Order not found:", orderError);
            return res.status(404).json({ error: 'Order not found' });
        }

        const storeName = "Lojinha das Graças";
        const valorFormatado = order.total.toFixed(2).replace('.', ',');

        // Email Body
        let corpoEmail = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h1 style="color: #d4af37; font-size: 24px; text-transform: uppercase;">Pedido Confirmado!</h1>
        <p style="color: #666;">Olá, <strong>${order.customer_name}</strong>. Recebemos seu pagamento!</p>
        <div style="background: #fafafa; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Pedido #${orderId}</p>
          <p style="font-size: 20px; font-weight: bold; color: #333; margin: 10px 0;">Total: R$ ${valorFormatado}</p>
        </div>
        <p style="font-size: 14px; color: #888;">Nossa equipe já está preparando seus produtos.</p>
        <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #aaa;">Obrigado por comprar na ${storeName}</p>
        </div>
      </div>
    `;

        // Send via Resend
        const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: `${storeName} <onboarding@resend.dev>`,
                to: [customerEmail],
                subject: `✅ Pagamento Confirmado! Pedido #${orderId}`,
                html: corpoEmail,
            }),
        });

        const resData = await emailRes.json();
        return res.status(200).json(resData);

    } catch (error) {
        console.error("[Email API] Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
