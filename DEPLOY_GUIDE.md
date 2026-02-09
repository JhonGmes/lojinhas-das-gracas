# Guia de Deploy (Colocar no Ar)

Para colocar sua loja online usando a Vercel, siga estes passos simples:

## 1. Atualizar seu Repositório (Terminal)

Você precisa enviar as últimas alterações para o GitHub. Abra o terminal e rode:

```bash
git push origin main
```

*(Se der algum erro de permissão, você precisará fazer o login no GitHub primeiro)*

## 2. Configurar na Vercel

1.  Acesse [vercel.com](https://vercel.com) e faça login.
2.  Clique em **"Add New..."** -> **"Project"**.
3.  Selecione seu repositório `lojinhas-das-gracas` (ou o nome que você usou no GitHub) e clique em **Import**.
4.  Nas configurações do projeto (Project Name, Framework Preset):
    -   **Framework Preset:** Vite (deve detectar automaticamente).
    -   **Root Directory:** `./` (padrão).
    -   **Build Command:** `npm run build` (padrão).
    -   **Output Directory:** `dist` (padrão).
5.  **Environment Variables (Variáveis de Ambiente):**
    -   Adicione as seguintes variáveis (copie do seu arquivo `.env` e `src/lib/supabase.ts`):
        -   `VITE_GEMINI_API_KEY`: (Sua chave da IA do Google)
    -   *Nota: As chaves do Supabase já estão no código, então não é obrigatório adicionar aqui, mas é boa prática adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` se você decidir removê-las do código no futuro.*
6.  Clique em **Deploy**.

## 3. Verificar Funcionalidade

Após o deploy (leva cerca de 1 a 2 minutos), a Vercel vai te dar um link (ex: `lojinhas-das-gracas.vercel.app`).
Acesse e teste:
-   Navegação na home.
-   Login/Cadastro.
-   Adicionar produtos ao carrinho.
-   O Admin estará em `/admin` (lembre-se de proteger essa rota futuramente ou usar login).

## Suporte
Se o deploy falhar, verifique os logs na Vercel. Geralmente é alguma dependência faltando ou erro de build.
