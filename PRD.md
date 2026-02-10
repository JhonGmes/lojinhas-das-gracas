# Product Requirements Document (PRD)
## Lojinha das Graças - E-commerce de Artigos Religiosos

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Status:** Em Desenvolvimento  
**Autor:** Jhon Gomes

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivos do Produto](#objetivos-do-produto)
3. [Stakeholders](#stakeholders)
4. [Personas de Usuário](#personas-de-usuário)
5. [Funcionalidades](#funcionalidades)
6. [Especificações Técnicas](#especificações-técnicas)
7. [Design System](#design-system)
8. [Fluxos de Usuário](#fluxos-de-usuário)
9. [Métricas de Sucesso](#métricas-de-sucesso)
10. [Roadmap](#roadmap)

---

## 🎯 Visão Geral

### Descrição
**Lojinha das Graças** é uma plataforma de e-commerce especializada em artigos religiosos católicos, oferecendo uma experiência de compra reverente, acolhedora e moderna. O projeto busca unir a tradição espiritual com a conveniência do comércio eletrônico.

### Missão
Levar fé, esperança e devoção para o lar dos clientes através de artigos religiosos selecionados com amor e respeito à tradição.

### Proposta de Valor
- **Curadoria Espiritual:** Produtos selecionados com critério religioso
- **Experiência Reverente:** Design que inspira paz e devoção
- **Confiança:** Transparência em preços, pagamentos e entregas
- **Conveniência:** Checkout simplificado via WhatsApp

---

## 🎯 Objetivos do Produto

### Objetivos de Negócio
1. **Penetração de Mercado:** Estabelecer presença online em 3 meses
2. **Conversão:** Taxa de conversão de 2% no primeiro trimestre
3. **Ticket Médio:** R$ 85,00 por pedido
4. **Retenção:** 30% de clientes recorrentes

### Objetivos de Experiência
1. **Mobile-First:** 70%+ dos acessos são mobile
2. **Performance:** Carregamento < 3s
3. **Acessibilidade:** WCAG 2.1 Level AA
4. **Confiança:** Design que transmite reverência e profissionalismo

---

## 👥 Stakeholders

| Papel | Nome | Responsabilidade |
|-------|------|------------------|
| **Product Owner** | Jhon Gomes | Visão do produto, roadmap |
| **Desenvolvedor** | Jhon Gomes | Implementação frontend/backend |
| **Designer (Assistido)** | AI Agent (Frontend Specialist) | Design System, UI/UX |
| **Administrador** | Lojista | Gestão de produtos, pedidos |
| **Usuário Final** | Cliente | Compra de produtos |

---

## 👤 Personas de Usuário

### Persona 1: Maria da Graça
- **Idade:** 52 anos
- **Ocupação:** Professora aposentada
- **Tecnologia:** Baixa/Média (usa WhatsApp e Facebook)
- **Necessidades:**
  - Comprar terços, imagens e quadros religiosos
  - Processo simples e direto
  - Confiança no vendedor
- **Frustrações:**
  - Sites complicados
  - Medo de fraudes online
  - Dificuldade com cartões de crédito

### Persona 2: João Paulo
- **Idade:** 28 anos
- **Ocupação:** Desenvolvedor
- **Tecnologia:** Alta
- **Necessidades:**
  - Presente para avó/mãe
  - Compra rápida via mobile
  - Pagamento via Pix
- **Frustrações:**
  - Cadastros longos
  - Sites lentos

---

## ⚙️ Funcionalidades

### ✅ MVP (Implementado)

#### 1. Catálogo de Produtos
- **Listagem:** Grid responsivo de produtos
- **Filtros:** Por categoria (Terço, Imagem, Quadro, etc.)
- **Busca:** Pesquisa por nome
- **Detalhes:** Página individual com:
  - Galeria de imagens (desktop: hover, mobile: swipe)
  - Preço (com promoção se aplicável)
  - Código SKU
  - Estoque
  - Descrição
  - Botão "Comprar Agora"

#### 2. Carrinho de Compras
- **Adicionar/Remover:** Produtos no carrinho
- **Quantidade:** Ajuste de quantidades
- **Cálculo:** Total automático
- **Persistência:** LocalStorage
- **Checkout:** Redirecionamento para WhatsApp

#### 3. Pagamento
- **Seleção:** Pix ou Cartão
- **Desconto Pix:** 5% automático
- **Mensagem WhatsApp:** Inclui:
  - Itens do pedido
  - Total
  - Forma de pagamento
  - Nome do cliente
  - Observações

#### 4. Painel Administrativo
- **Login:** Autenticação Supabase
- **Dashboard:** Visão geral de vendas
- **Produtos:**
  - Criar, editar, excluir
  - Upload de múltiplas imagens
  - Gestão de estoque
  - Preços promocionais
  - Código SKU
- **Pedidos:** Lista de pedidos (status, valor, cliente)
- **Configurações:**
  - Nome da loja
  - Logo
  - WhatsApp
  - Banner/Hero customizável

#### 5. Design & UX
- **Mobile-First:** Otimizado para smartphones
- **Dark Mode:** Tema claro/escuro
- **Animações:** Fade-in, hover effects
- **Acessibilidade:** Semântica HTML, ARIA labels

---

### 🚧 Roadmap (Em Desenvolvimento)

#### Fase 2: Design Refinements (Em Progresso)
- [ ] **Sacred Minimalism Design System**
  - Paleta: Dourado (#D4AF37), Creme (#FAF3E0), Algodão (#F8F4EE)
  - Tipografia: Cinzel (títulos), Cookie (script), Inter (corpo)
  - Geometria: Bordas sharp (`rounded-sm`)
  - Transições: Sutis e contemplativas (400ms)
  - Sombras: Soft e reverentes

#### Fase 3: Funcionalidades Adicionais
- [ ] **Blog de Fé:**
  - Posts com orações e reflexões
  - Gestão no admin
  - SEO otimizado
- [ ] **Newsletter:**
  - Captura de emails no footer
  - Integração com provedor de email
- [ ] **Wishlist:**
  - Salvar produtos favoritos
- [ ] **Avaliações:**
  - Reviews de produtos
  - Rating por estrelas

#### Fase 4: Integração de Pagamentos Real
- [ ] **Mercado Pago:**
  - Pix QR Code automático
  - Cartão de crédito parcelado
  - Checkout transparente
- [ ] **Cálculo de Frete:**
  - Integração com Correios API
  - Melhor Envio

#### Fase 5: Marketing & Analytics
- [ ] **Google Analytics 4**
- [ ] **Meta Pixel**
- [ ] **SEO:**
  - Sitemap XML
  - Meta tags dinâmicas
  - Structured data (Schema.org)
- [ ] **Remarketing:**
  - Carrinho abandonado (email/WhatsApp)

---

## 🛠️ Especificações Técnicas

### Stack Tecnológica

#### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **State Management:** Context API (Cart, Theme, Store)

#### Backend (BaaS)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (imagens)
- **RLS:** Row Level Security habilitado

#### Infraestrutura
- **Hosting:** Vercel
- **Repositório:** GitHub
- **CI/CD:** GitHub Actions → Vercel Deploy
- **Domain:** lojinhas-das-gracas.vercel.app

### Arquitetura de Dados

#### Tabelas Supabase

**`products`**
```sql
- id (uuid, PK)
- name (text)
- code (text) -- SKU
- description (text)
- price (numeric)
- promotional_price (numeric, nullable)
- stock (integer)
- category (text)
- image (text) -- URL principal
- images (text[]) -- URLs adicionais
- is_featured (boolean)
- created_at (timestamp)
```

**`orders`**
```sql
- id (uuid, PK)
- order_number (serial, unique)
- customer_name (text)
- items (jsonb)
- total (numeric)
- status (text: pending/completed/cancelled)
- notes (text)
- created_at (timestamp)
```

**`settings`**
```sql
- id (uuid, PK)
- store_name (text)
- logo_url (text)
- whatsapp_number (text)
- hero_image_url (text)
- hero_title (text)
- hero_subtitle (text)
- hero_button_text (text)
```

---

## 🎨 Design System

### Design Philosophy: **Sacred Minimalism**
Combina reverência espiritual com minimalismo moderno.

### Princípios
1. **Reverência:** Design que inspira respeito e paz
2. **Clareza:** Sem distrações, foco no essencial
3. **Tradição Moderna:** Clássico com toques contemporâneos
4. **Acessibilidade:** Inclusivo para todas as idades

### Paleta de Cores

#### Primary (Dourado Espiritual)
```css
--brand-gold: #D4AF37       /* Rich Gold */
--brand-gold-light: #E8C872 /* Soft Gold */
```

#### Neutrals (Algodão & Creme)
```css
--brand-cream: #FAF3E0       /* Warm Cream */
--brand-cotton: #F8F4EE      /* Egyptian Cotton (BG) */
--brand-cotton-dark: #EDE8E0 /* Subtle Contrast */
```

#### Dark Accents
```css
--brand-brown: #78350f  /* Deep Brown */
--brand-wood: #3E2723   /* Dark Wood */
```

### Tipografia

- **Display (Títulos):** Cinzel (serif solene)
- **Script (Logo):** Cookie (elegante cursiva)
- **Body:** Inter Tight (moderna, legível)

**Escala Tipográfica:**
```
- H1: 3xl (desktop), xl (mobile)
- H2: 2xl (desktop), lg (mobile)
- H3: xl
- Body: base (16px)
- Small: sm (14px)
- Tiny: xs (12px)
```

### Geometria

- **Bordas:** Sharp (`rounded-sm` 2px) - seriedade reverente
- **Cards:** `rounded-sm` com sombra soft
- **Botões:** `rounded-sm` ou `rounded-minimal` (2px)
- **Inputs:** `rounded-sm`

### Sombras

```css
shadow-soft: 0 2px 8px rgba(120, 53, 15, 0.08)
shadow-soft-lg: 0 4px 16px rgba(120, 53, 15, 0.12)
shadow-inner-soft: inset 0 2px 4px rgba(120, 53, 15, 0.06)
```

### Animações & Transições

- **Duração:** 400ms (contemplativa)
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)`
- **Movimento:** Fade-in sutil (16px translateY)
- **Hover:** Suave, sem scale agressivo

### Componentes

#### Button (Primary)
```tsx
bg-brand-gold 
hover:bg-brand-gold-light 
text-brand-wood 
font-bold 
py-3 px-6 
rounded-sm 
transition-all duration-400 
shadow-soft
```

#### Card
```tsx
bg-white 
border border-brand-cotton-dark 
rounded-sm 
shadow-soft 
hover:shadow-soft-lg 
transition-all duration-400
```

---

## 🔄 Fluxos de Usuário

### Fluxo de Compra (Happy Path)

```
1. Usuário acessa homepage
   ↓
2. Navega por categorias ou busca produto
   ↓
3. Clica no produto
   ↓
4. Visualiza detalhes (imagens, preço, estoque)
   ↓
5. Clica "Comprar Agora"
   ↓
6. Redirecionado para Carrinho (produto já adicionado)
   ↓
7. Seleciona forma de pagamento (Pix ou Cartão)
   ↓
8. Preenche nome e observações
   ↓
9. Clica "Finalizar Pedido"
   ↓
10. Redirecionado para WhatsApp com mensagem pré-formatada
    ↓
11. Envia mensagem ao lojista
    ↓
12. Lojista confirma pedido e envia dados de pagamento
    ↓
13. Cliente paga (Pix ou combinado)
    ↓
14. Lojista marca pedido como "Concluído" no admin
```

### Fluxo Admin (Gestão de Produto)

```
1. Admin faz login
   ↓
2. Acessa "Produtos" no menu
   ↓
3. Clica "Adicionar Produto"
   ↓
4. Preenche formulário:
   - Nome, Código SKU
   - Categoria
   - Preço, Preço Promocional
   - Estoque
   - Descrição
   - Upload de imagens
   - Marcar como Destaque
   ↓
5. Clica "Salvar"
   ↓
6. Produto aparece no catálogo público
```

---

## 📊 Métricas de Sucesso

### KPIs Primários

1. **Taxa de Conversão:**
   - **Meta:** 2% (Mês 1), 3% (Mês 3)
   - **Cálculo:** (Pedidos / Visitantes únicos) × 100

2. **Ticket Médio:**
   - **Meta:** R$ 85,00
   - **Cálculo:** Valor total vendas / Número de pedidos

3. **Taxa de Abandono de Carrinho:**
   - **Meta:** < 70%
   - **Cálculo:** (Carrinhos abandonados / Carrinhos criados) × 100

4. **Net Promoter Score (NPS):**
   - **Meta:** > 50 (Excelente)
   - **Coleta:** Pesquisa pós-compra via WhatsApp

### KPIs Secundários

- **Page Load Time:** < 3s (mobile 4G)
- **Bounce Rate:** < 50%
- **Average Session Duration:** > 2min
- **Returning Customers:** > 30% em 3 meses

### Métricas de Produto

- **Produtos com melhor conversão:** Top 10 mais vendidos
- **Categorias populares:** % vendas por categoria
- **Horário de pico:** Gráfico de acessos/vendas por hora

---

## 🗺️ Roadmap

### ✅ Q1 2026 (Concluído)
- [x] MVP do E-commerce
- [x] Painel Administrativo
- [x] Integração Supabase
- [x] Deploy Vercel
- [x] Mobile Responsive
- [x] Dark Mode
- [x] Checkout via WhatsApp

### 🚧 Q2 2026 (Em Progresso)
- [ ] Design System "Sacred Minimalism"
- [ ] Blog de Fé
- [ ] Newsletter
- [ ] SEO Fundamentals
- [ ] Google Analytics

### 📅 Q3 2026 (Planejado)
- [ ] Integração Mercado Pago (Pix/Cartão)
- [ ] Cálculo de Frete (Correios/Melhor Envio)
- [ ] Wishlist
- [ ] Avaliações de Produtos
- [ ] Programa de Fidelidade

### 📅 Q4 2026 (Visão Futuro)
- [ ] App Mobile (React Native)
- [ ] Chat ao Vivo
- [ ] Marketplace (Múltiplos vendedores)
- [ ] Assinatura (Box mensal de devocionais)

---

## 📝 Notas Técnicas

### Pendências SQL
```sql
-- Executar em Supabase SQL Editor
ALTER TABLE products ADD COLUMN IF NOT EXISTS code text;
```

### Variáveis de Ambiente (`.env`)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_GEMINI_API_KEY=xxx (futuro: IA para recomendações)
```

### Scripts Disponíveis
```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run preview    # Preview do build
```

---

## 🔐 Segurança & Compliance

### Implementado
- ✅ HTTPS (Vercel SSL)
- ✅ RLS (Row Level Security) no Supabase
- ✅ Autenticação JWT (Supabase Auth)
- ✅ Validação de inputs (frontend)

### Pendente
- [ ] LGPD: Política de Privacidade
- [ ] LGPD: Termo de Uso
- [ ] LGPD: Consentimento de Cookies
- [ ] PCI-DSS: Ao integrar pagamentos

---

## 📞 Contato & Suporte

**Desenvolvedor:** Jhon Gomes  
**Projeto:** Lojinha das Graças  
**Repositório:** [GitHub Link]  
**Deploy:** https://lojinhas-das-gracas.vercel.app

---

**Documento vivo - Atualizado em:** 09/02/2026
