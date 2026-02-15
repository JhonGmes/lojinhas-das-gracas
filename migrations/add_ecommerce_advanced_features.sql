-- =====================================================
-- MIGRATION: E-commerce Advanced Features
-- Data: 2026-02-15
-- Descrição: Adiciona suporte para Filtros, Reviews e Wishlist
-- =====================================================

-- =====================================================
-- PARTE 1: ATUALIZAR TABELA PRODUCTS
-- =====================================================

-- Adicionar novos campos para filtros
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0.0;

-- Comentários descritivos
COMMENT ON COLUMN products.material IS 'Material do produto: Madeira, Prata, Ouro, Resina, Bronze, Aço Inox, Plástico, Vidro, Cristal, Cerâmica, Tecido';
COMMENT ON COLUMN products.color IS 'Cor principal: Dourado, Marrom, Branco, Prata, Preto, Azul, Vermelho, Rosa, Verde, Bege, Multicolor';
COMMENT ON COLUMN products.tags IS 'Tags para busca e filtros adicionais';
COMMENT ON COLUMN products.total_reviews IS 'Total de avaliações recebidas';
COMMENT ON COLUMN products.average_rating IS 'Média de estrelas (1.0 a 5.0)';

-- =====================================================
-- PARTE 2: CRIAR TABELA DE REVIEWS (AVALIAÇÕES)
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified_purchase) WHERE is_verified_purchase = true;

-- Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Qualquer pessoa pode VER reviews
DROP POLICY IF EXISTS "Reviews são públicos" ON reviews;
CREATE POLICY "Reviews são públicos" 
ON reviews 
FOR SELECT 
TO public 
USING (true);

-- Policy: Qualquer pessoa pode CRIAR reviews (cliente verificado)
DROP POLICY IF EXISTS "Clientes podem criar reviews" ON reviews;
CREATE POLICY "Clientes podem criar reviews" 
ON reviews 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Policy: Qualquer pessoa pode ATUALIZAR reviews (para admin responder)
DROP POLICY IF EXISTS "Admin pode responder reviews" ON reviews;
CREATE POLICY "Admin pode responder reviews" 
ON reviews 
FOR UPDATE 
TO public 
USING (true);

-- Comentários
COMMENT ON TABLE reviews IS 'Avaliações de produtos com estrelas e comentários';
COMMENT ON COLUMN reviews.rating IS 'Nota de 1 a 5 estrelas';
COMMENT ON COLUMN reviews.is_verified_purchase IS 'TRUE se cliente realmente comprou este produto';
COMMENT ON COLUMN reviews.helpful_count IS 'Número de pessoas que marcaram como útil';

-- =====================================================
-- PARTE 3: CRIAR TABELA DE WISHLIST (LISTA DE DESEJOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_email TEXT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  notify_on_sale BOOLEAN DEFAULT false,
  notify_on_stock BOOLEAN DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id, product_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlists(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_notify_sale ON wishlists(notify_on_sale) WHERE notify_on_sale = true;
CREATE INDEX IF NOT EXISTS idx_wishlist_notify_stock ON wishlists(notify_on_stock) WHERE notify_on_stock = true;
CREATE INDEX IF NOT EXISTS idx_wishlist_email ON wishlists(user_email) WHERE user_email IS NOT NULL;

-- Row Level Security
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Policy: Acesso total público (funciona sem login)
DROP POLICY IF EXISTS "Wishlist pública" ON wishlists;
CREATE POLICY "Wishlist pública" 
ON wishlists 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Comentários
COMMENT ON TABLE wishlists IS 'Lista de desejos de produtos favoritos dos clientes';
COMMENT ON COLUMN wishlists.session_id IS 'UUID gerado no localStorage do navegador';
COMMENT ON COLUMN wishlists.user_email IS 'Email do usuário logado (opcional, para sincronização)';
COMMENT ON COLUMN wishlists.notify_on_sale IS 'Notificar quando produto entrar em promoção';
COMMENT ON COLUMN wishlists.notify_on_stock IS 'Notificar quando produto voltar ao estoque';

-- =====================================================
-- PARTE 4: TRIGGER PARA ATUALIZAR RATING AUTOMÁTICO
-- =====================================================

-- Função para recalcular média de reviews
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    total_reviews = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE product_id = NEW.product_id
    ),
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1) 
      FROM reviews 
      WHERE product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Atualiza stats quando review é criado
DROP TRIGGER IF EXISTS trigger_update_review_stats ON reviews;
CREATE TRIGGER trigger_update_review_stats
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_review_stats();

-- =====================================================
-- PARTE 5: FUNÇÃO PARA VERIFICAR SE CLIENTE COMPROU
-- =====================================================

-- Função para verificar se um email comprou um produto
CREATE OR REPLACE FUNCTION customer_purchased_product(
  p_email TEXT,
  p_product_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  has_purchase BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_email = p_email
      AND o.status IN ('paid', 'delivered')
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(o.items) AS item
        WHERE (item->>'id')::uuid = p_product_id
      )
  ) INTO has_purchase;
  
  RETURN has_purchase;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION customer_purchased_product IS 'Verifica se um cliente (email) comprou determinado produto';

-- =====================================================
-- PARTE 6: VIEWS ÚTEIS
-- =====================================================

-- View: Produtos com estatísticas de reviews
CREATE OR REPLACE VIEW products_with_reviews AS
SELECT 
  p.*,
  COALESCE(p.total_reviews, 0) as review_count,
  COALESCE(p.average_rating, 0.0) as avg_rating,
  COUNT(DISTINCT r.id) FILTER (WHERE r.rating = 5) as five_star_count,
  COUNT(DISTINCT r.id) FILTER (WHERE r.rating = 4) as four_star_count,
  COUNT(DISTINCT r.id) FILTER (WHERE r.rating = 3) as three_star_count,
  COUNT(DISTINCT r.id) FILTER (WHERE r.rating = 2) as two_star_count,
  COUNT(DISTINCT r.id) FILTER (WHERE r.rating = 1) as one_star_count
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
GROUP BY p.id;

COMMENT ON VIEW products_with_reviews IS 'Produtos com estatísticas detalhadas de reviews';

-- =====================================================
-- PARTE 7: DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Atualizar produtos existentes com materiais e cores (exemplo)
-- Você pode ajustar conforme seu catálogo real

-- UPDATE products SET material = 'Madeira', color = 'Marrom' WHERE category = 'Terços';
-- UPDATE products SET material = 'Resina', color = 'Branco' WHERE category = 'Imagens';

-- =====================================================
-- PARTE 8: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar estrutura da tabela products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('material', 'color', 'tags', 'total_reviews', 'average_rating')
ORDER BY ordinal_position;

-- Verificar se tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('reviews', 'wishlists')
ORDER BY table_name;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
