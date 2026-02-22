# 📧 CONFIGURAÇÃO DE E-MAIL AUTOMÁTICO (RESEND) - VERSÃO CORRIGIDA

Jhon, o erro aconteceu porque o editor do Supabase confundiu o HTML com código real. Troquei a forma de escrever o código para uma que é "**à prova de erros**".

Siga estes passos novamente, usando este novo código:

---

## 🏗️ PASSO 1: Atualizar o Código no Dashboard

1.  Abra sua função **`order-confirmed`** no Supabase.
2.  Apague **TUDO** o que estiver no editor e cole este novo código exatamente como está abaixo:

```typescript
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
    // Configuração de CORS - Mantém o site funcionando
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    try {
        const { orderId, customerEmail } = await req.json() as EmailPayload;

        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY não configurada nos Secrets.");
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Busca os dados do pedido no banco
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            throw new Error("Pedido não encontrado.");
        }

        const storeName = "Lojinha das Graças";
        const valorFormatado = order.total.toFixed(2).replace('.', ',');

        // Montagem do e-mail usando textos simples para evitar erros de leitura do editor
        let corpoEmail = '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 8px;">';
        corpoEmail += '<h1 style="color: #d4af37; font-size: 24px; text-transform: uppercase;">Pedido Confirmado!</h1>';
        corpoEmail += '<p style="color: #666;">Olá, <strong>' + order.customer_name + '</strong>. Recebemos seu pagamento!</p>';
        corpoEmail += '<div style="background: #fafafa; padding: 20px; border-radius: 4px; margin: 20px 0;">';
        corpoEmail += '<p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Pedido #' + orderId + '</p>';
        corpoEmail += '<p style="font-size: 20px; font-weight: bold; color: #333; margin: 10px 0;">Total: R$ ' + valorFormatado + '</p>';
        corpoEmail += '</div>';
        corpoEmail += '<p style="font-size: 14px; color: #888;">Nossa equipe já está preparando seus produtos.</p>';
        corpoEmail += '<div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">';
        corpoEmail += '<p style="font-size: 12px; color: #aaa;">Obrigado por comprar na ' + storeName + '</p>';
        corpoEmail += '</div></div>';

        // Envio real via Resend API
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
                html: corpoEmail,
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
```

---

## � PASSO 2: Salvar e Deploy

1.  Clique no botão **"Deploy"** (ou "Save" e depois "Deploy") no canto superior direito.
2.  Desta vez ele deve passar sem erros, pois removemos os caracteres que estavam confundindo o editor.

---

## 🔑 PASSO 3: Conferir o Secret (Se necessário)

Se você já fez o PASSO 3 do guia anterior (cadastrar a `RESEND_API_KEY`), não precisa fazer de novo. A função vai ler automaticamente.

Se ainda não fez:
1. Vá em **Settings** -> **Edge Functions**.
2. Adicione o Secret `RESEND_API_KEY` com o valor `re_72jd583Q_4wuD5Mr8huzXqtJs3yVjw7aJ`.
