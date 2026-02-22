import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

interface EmailPayload {
    orderId: string;
    customerEmail: string;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    try {
        const { orderId, customerEmail } = await req.json() as EmailPayload;

        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY not configured.");
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            throw new Error("Order not found.");
        }

        const storeName = "Lojinha das Graças";
        const totalFormatted = order.total.toFixed(2).replace('.', ',');

        // HTML concatenado para evitar problemas de parsing com backticks multi-linha em alguns editores
        let htmlBody = '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 8px;">';
        htmlBody += '<h1 style="color: #d4af37; font-size: 24px; text-transform: uppercase;">Pedido Confirmado!</h1>';
        htmlBody += '<p style="color: #666;">Olá, <strong>' + order.customer_name + '</strong>. Recebemos seu pagamento!</p>';
        htmlBody += '<div style="background: #fafafa; padding: 20px; border-radius: 4px; margin: 20px 0;">';
        htmlBody += '<p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Pedido #' + orderId + '</p>';
        htmlBody += '<p style="font-size: 20px; font-weight: bold; color: #333; margin: 10px 0;">Total: R$ ' + totalFormatted + '</p>';
        htmlBody += '</div>';
        htmlBody += '<p style="font-size: 14px; color: #888;">Nossa equipe já está preparando seus produtos. Você receberá atualizações em breve.</p>';
        htmlBody += '<div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">';
        htmlBody += '<p style="font-size: 12px; color: #aaa;">Obrigado por comprar na ' + storeName + '</p>';
        htmlBody += '</div></div>';

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + RESEND_API_KEY,
            },
            body: JSON.stringify({
                from: storeName + " <onboarding@resend.dev>",
                to: [customerEmail],
                subject: "✅ Pagamento Confirmado! Pedido #" + orderId,
                html: htmlBody,
            }),
        });

        const resData = await res.json();
        return new Response(JSON.stringify(resData), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
});
