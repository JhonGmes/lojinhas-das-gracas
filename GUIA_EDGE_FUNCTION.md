# 🚀 GUIA COMPLETO - SUPABASE EDGE FUNCTION

## ✅ STATUS: Código do site já atualizado!

---

## 📋 CHECKLIST - Execute nesta ordem:

### ☐ PASSO 1: Criar a Edge Function no Supabase (5 min)

1. **Abra o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard
   - Faça login
   - Selecione seu projeto: `izcxnbajwjujzlctolkx`

2. **Ir para Edge Functions:**
   - Menu lateral esquerdo → clique em **"Edge Functions"**
   - Clique no botão **"Create a new function"**

3. **Configurar:**
   - **Function name:** `generate-blog-ai`
   - Clique em **"Create function"**

4. **Cole o código:**
   - Abra o arquivo: `supabase-edge-function.ts` (está na raiz do projeto)
   - Copie TUDO
   - Cole no editor do Supabase (substitua o código de exemplo)
   - Clique em **"Deploy"** (vai demorar ~30 segundos)
   - Aguarde aparecer "✓ Deployed successfully"

---

### ☐ PASSO 2: Configurar a API Key (2 min)

1. **Ir em Settings:**
   - No Supabase, menu lateral → **Settings** (ícone de engrenagem)
   - Clique em **"Edge Functions"**

2. **Adicionar Secret:**
   - Role até encontrar "Function Secrets"
   - Clique em **"Add new secret"**
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyDwnaFkqUDbg0xLVzSKpe0EQP_U0vtKDVw`
   - Clique em **"Save"**

---

### ☐ PASSO 3: Testar! (1 min)

1. **Volte ao seu site:**
   - Dê um **F5** (refresh completo)
   - Vá em: `http://localhost:5173/admin/blog`

2. **Teste a geração:**
   - Clique em **"Nova Mensagem"**
   - No campo "Referência para IA", digite:
     ```
     A história do milagre das rosas de Santa Isabel de Portugal
     ```
   - Clique em **"Gerar com IA"**

3. **Verificar:**
   - Abra o Console (F12)
   - Deve aparecer: "Chamando Supabase Edge Function..."
   - Após ~3 segundos, os campos devem preencher automaticamente

---

## 🐛 TROUBLESHOOTING

**Se der erro "Function not found":**
- Certifique-se que o nome foi `generate-blog-ai` (com hífen, sem underscore)
- Aguarde 1 minuto e tente novamente (pode demorar pra propagar)

**Se der erro "GEMINI_API_KEY not configured":**
- Volte no PASSO 2 e confira se salvou o secret
- Após salvar, clique em "Restart" na função

**Se der erro 500:**
- Vá em Edge Functions → `generate-blog-ai` → clique na aba "Logs"
- Me envie o que apareceu lá

---

## 🎉 PRONTO!

Quando funcionar, você terá:
- ✅ IA funcionando 100%
- ✅ API Key segura (não exposta no frontend)
- ✅ Grátis (500mil chamadas/mês)
- ✅ Escalável automaticamente

**Depois você pode desligar o n8n que estava instalando! Não precisa mais.**
