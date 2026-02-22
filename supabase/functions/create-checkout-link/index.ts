import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();

        // Call InfinitePay Public API (Server-side to avoid CORS)
        const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        let data;
        if (response.status === 404) {
            // Fallback to older API version if needed
            const fallbackResponse = await fetch("https://api.infinitepay.io/v2/payment-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            data = await fallbackResponse.json();
        } else if (!response.ok) {
            const errorText = await response.text();
            console.error("[InfinitePay Error]", errorText);
            throw new Error("GATEWAY_ERROR");
        } else {
            data = await response.json();
        }

        const checkoutUrl = data.url || data.payment_url || data?.data?.url;

        if (!checkoutUrl) {
            throw new Error("EMPTY_URL_RESPONSE");
        }

        return new Response(JSON.stringify({ url: checkoutUrl }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("[Edge Function Error]", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
