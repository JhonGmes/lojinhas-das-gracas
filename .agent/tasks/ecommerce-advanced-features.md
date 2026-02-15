# 🛍️ E-commerce Advanced Features - Lojinha das Graças

**Status**: 🟡 EM PLANEJAMENTO  
**Responsável**: .agent (Mentor do Projeto)  
**Data Início**: 2026-02-15  
**Prioridade**: ALTA

---

## 🎯 OBJETIVO GERAL

Transformar a Lojinha das Graças em uma experiência de compra premium e completa, adicionando:
1. **Filtros Avançados e Busca Inteligente**
2. **Sistema de Avaliações (Reviews com Estrelas)**
3. **Lista de Desejos (Wishlist) com Compartilhamento**

---

## 📊 FASE 1: DATABASE DESIGN & MIGRATIONS

### 1.1. Novos Campos em `products`

**Campos a adicionar:**
```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[], -- para futuras expansões
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0.0;
```

**Valores possíveis:**
- **material**: 'Madeira', 'Prata', 'Ouro', 'Resina', 'Bronze', 'Aço Inox', 'Plástico', 'Vidro', 'Cristal', 'Cerâmica', 'Tecido'
- **color**: 'Dourado', 'Marrom', 'Branco', 'Prata', 'Preto', 'Azul', 'Vermelho', 'Rosa', 'Verde', 'Bege', 'Multicolor'

---

### 1.2. Nova Tabela: `reviews`

```sql
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  admin_response TEXT,
  admin_response_date TIMESTAMP WITH TIME ZONE,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews públicos" ON reviews;
CREATE POLICY "Reviews públicos" ON reviews FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Clientes podem criar reviews" ON reviews;
CREATE POLICY "Clientes podem criar reviews" ON reviews FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Admin pode responder" ON reviews;
CREATE POLICY "Admin pode responder" ON reviews FOR UPDATE TO public USING (true);
```

**Regras de Negócio:**
- ✅ Somente quem comprou pode avaliar (`is_verified_purchase = true`)
- ✅ Reviews vão direto ao ar (sem moderação prévia)
- ✅ Admin pode responder a qualquer review
- ✅ Clientes podem marcar reviews como "útil" (`helpful_count`)

---

### 1.3. Nova Tabela: `wishlists`

```sql
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL, -- UUID gerado no localStorage
  user_email TEXT, -- opcional, se usuário estiver logado
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  notify_on_sale BOOLEAN DEFAULT false,
  notify_on_stock BOOLEAN DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id, product_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlists(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_notify_sale ON wishlists(notify_on_sale) WHERE notify_on_sale = true;
CREATE INDEX IF NOT EXISTS idx_wishlist_notify_stock ON wishlists(notify_on_stock) WHERE notify_on_stock = true;

-- Policies
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Wishlist pública" ON wishlists;
CREATE POLICY "Wishlist pública" ON wishlists FOR ALL TO public USING (true) WITH CHECK (true);
```

**Funcionalidades:**
- ✅ Funciona sem login (via `session_id` do localStorage)
- ✅ Se logado, sincroniza com email
- ✅ Notificação quando produto entra em promoção
- ✅ Notificação quando produto volta ao estoque
- ✅ Compartilhamento via link público

---

## 🎨 FASE 2: FRONTEND COMPONENTS

### 2.1. Filtros Sidebar Component

**Arquivo**: `src/components/ProductFilters.tsx`

**Recursos:**
- ✅ Filtro por Categoria (checkboxes)
- ✅ Filtro por Faixa de Preço (slider)
- ✅ Filtro por Cores (círculos coloridos)
- ✅ Filtro por Materiais (checkboxes)
- ✅ Ordenação (dropdown)
- ✅ Botão "Limpar Filtros"
- ✅ Contador de produtos filtrados
- ✅ Animações suaves
- ✅ Responsivo (collapse em mobile)

**Design Specs:**
- Sidebar fixa à esquerda (desktop)
- Drawer lateral (mobile)
- Ícone de filtro com badge de contagem
- Transições suaves

---

### 2.2. Sistema de Reviews

**Componentes:**

#### `ReviewStars.tsx`
- Exibição de estrelas (read-only)
- Estrelas interativas (para avaliação)
- Animação ao hover

#### `ReviewCard.tsx`
- Avatar do cliente
- Nome e data
- Estrelas
- Comentário
- Badge "Compra Verificada"
- Resposta do admin (se houver)
- Botão "Útil" com contador

#### `ReviewForm.tsx`
- Seleção de estrelas
- Textarea para comentário
- Validação: só exibe se cliente comprou
- Toast de sucesso

#### `ReviewSummary.tsx`
- Média de estrelas (grande)
- Total de avaliações
- Barra de progresso para cada estrela (5, 4, 3, 2, 1)
- Filtro por estrelas

**Página Admin**:
- Lista de reviews pendentes de resposta
- Editor inline para responder
- Filtro por produto
- Filtro por rating

---

### 2.3. Wishlist System

**Componentes:**

#### `WishlistButton.tsx`
- Ícone de coração
- Animação de "pulo" ao adicionar
- Tooltip "Adicionar à Lista de Desejos"
- Estado preenchido/vazio

#### `WishlistPage.tsx`
- Grid de produtos favoritados
- Botão "Remover"
- Botão "Adicionar ao Carrinho"
- Botão "Compartilhar Lista"
- Toggle "Notificar em Promoção"
- Toggle "Notificar quando Voltar"
- Contador de itens

#### `WishlistShareModal.tsx`
- Link para compartilhar
- Botão "Copiar Link"
- QR Code (opcional)
- Compartilhar via WhatsApp

**Context**:
```typescript
// src/context/WishlistContext.tsx
interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleNotifySale: (productId: string) => void;
  toggleNotifyStock: (productId: string) => void;
  shareUrl: string;
  clearWishlist: () => void;
}
```

---

## 🔧 FASE 3: BACKEND & API

### 3.1. API Endpoints

**Reviews**:
```typescript
api.reviews.list(productId: string) // Listar reviews de um produto
api.reviews.create(review: Review) // Criar review
api.reviews.respond(reviewId: string, response: string) // Admin responde
api.reviews.markHelpful(reviewId: string) // Marcar como útil
api.reviews.getStats(productId: string) // Stats de reviews
```

**Wishlist**:
```typescript
api.wishlist.list(sessionId: string) // Listar wishlist
api.wishlist.add(sessionId: string, productId: string) // Adicionar
api.wishlist.remove(sessionId: string, productId: string) // Remover
api.wishlist.share(sessionId: string) // Gerar link
api.wishlist.updateNotifications(wishlistId: string, options: NotifyOptions)
```

---

## 📐 FASE 4: UX/UI DESIGN PREMIUM

### Design System Update

**Cores para Filtros**:
```css
--color-dourado: #D4AF37;
--color-marrom: #8B4513;
--color-branco: #FFFFFF;
--color-prata: #C0C0C0;
--color-preto: #1a1a1a;
--color-azul: #4A90E2;
--color-vermelho: #E24A4A;
--color-rosa: #E291A8;
--color-verde: #4AE290;
--color-bege: #F5F5DC;
```

**Animações**:
- Wishlist: Heart beat animation
- Filtros: Slide in/out
- Reviews: Fade in com stagger

---

## 🚀 FASE 5: IMPLEMENTAÇÃO POR PRIORIDADE

### Sprint 1: Database & Filters (Semana 1)
- [ ] Migration: Adicionar campos material/color em products
- [ ] Criar tabela reviews
- [ ] Criar tabela wishlists
- [ ] Componente ProductFilters.tsx
- [ ] Lógica de filtragem no ProductList
- [ ] Testar filtros

### Sprint 2: Reviews System (Semana 2)
- [ ] API de reviews
- [ ] ReviewStars component
- [ ] ReviewCard component
- [ ] ReviewForm component
- [ ] ReviewSummary component
- [ ] Admin: Lista de reviews
- [ ] Admin: Responder reviews
- [ ] Testar reviews

### Sprint 3: Wishlist (Semana 3)
- [ ] WishlistContext
- [ ] API de wishlist
- [ ] WishlistButton component
- [ ] WishlistPage
- [ ] ShareModal
- [ ] Sistema de notificações
- [ ] Testar wishlist

### Sprint 4: Polish & Deploy (Semana 4)
- [ ] Testes E2E
- [ ] Performance Optimization
- [ ] SEO para reviews
- [ ] Deploy em produção
- [ ] Documentação

---

## 📊 MÉTRICAS DE SUCESSO

**Filtros**:
- [ ] 80% dos usuários usam pelo menos 1 filtro
- [ ] Tempo médio de busca < 30 segundos

**Reviews**:
- [ ] 20% dos compradores deixam review
- [ ] Rating médio > 4.0 estrelas

**Wishlist**:
- [ ] 40% dos visitantes adicionam pelo menos 1 item
- [ ] 15% de conversão de wishlist → compra
- [ ] 5% de compartilhamentos

---

## 🔒 SEGURANÇA & VALIDAÇÕES

**Reviews**:
- ✅ Validar que cliente realmente comprou o produto
- ✅ Rate limiting: 1 review por produto por cliente
- ✅ Sanitização de HTML em comentários
- ✅ Moderação de palavrões (opcional)

**Wishlist**:
- ✅ Limitar a 100 itens por sessão
- ✅ Expiração de links compartilhados (30 dias)

---

## 📝 NOTAS DO MENTOR (.agent)

### Decisões Arquiteturais:

1. **Wishlist sem login**: Usamos `session_id` do localStorage + sincronização opcional via email
2. **Reviews sem moderação**: Confiamos nos clientes + admin pode responder/editar
3. **Notificações**: Sistema de jobs assíncronos para enviar emails/WhatsApp quando produto entrar em promoção

### Best Practices Aplicadas:

- ✅ Clean Code (funções pequenas, nomes descritivos)
- ✅ Component Composition (componentes reutilizáveis)
- ✅ Performance (lazy loading, memoization)
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ SEO (structured data para reviews)

---

**Responsável**: .agent  
**Aprovado por**: Jhon (Product Owner)
