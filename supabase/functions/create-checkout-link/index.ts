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
        console.log("[Edge Function] Received Payload:", JSON.stringify(payload, null, 2));

        // Call InfinitePay Public API (Server-side to avoid CORS)
        const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        console.log("[Edge Function] InfinitePay Status:", response.status);

        let data;
        if (response.status === 404) {
            console.log("[Edge Function] Attempting fallback to v2...");
            // Fallback to older API version if needed
            const fallbackResponse = await fetch("https://api.infinitepay.io/v2/payment-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            data = await fallbackResponse.json();
        } else if (!response.ok) {
            const errorText = await response.text();
            console.error("[Edge Function] InfinitePay Full Error:", errorText);
            return new Response(JSON.stringify({
                error: "GATEWAY_ERROR",
                details: errorText,
                status: response.status
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: response.status,
            });
        } else {
            data = await response.json();
        }

        console.log("[Edge Function] InfinitePay Response:", JSON.stringify(data));
        const checkoutUrl = data.url || data.payment_url || data?.data?.url;

        if (!checkoutUrl) {
            throw new Error("EMPTY_URL_RESPONSE");
        }

        return new Response(JSON.stringify({ url: checkoutUrl }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[Edge Function Error]", errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
