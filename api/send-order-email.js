/* eslint-disable no-undef */

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
    const PROJECT_ID = "lojinha-dasgracas";

    try {
        // Fetch order details from Firestore via REST API
        // This avoids adding firebase-admin dependency to the serverless function
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders/${orderId}`;

        const orderRes = await fetch(firestoreUrl);

        if (!orderRes.ok) {
            console.error("[Email API] Order not found in Firestore:", await orderRes.text());
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderData = await orderRes.json();
        const fields = orderData.fields;

        // Map Firestore REST format to simple object
        const order = {
            total: fields.total?.doubleValue || fields.total?.integerValue || 0,
            customer_name: fields.customer_name?.stringValue || "Cliente",
        };

        const storeName = "Lojinha das Graças";
        const valorFormatado = Number(order.total).toFixed(2).replace('.', ',');

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

