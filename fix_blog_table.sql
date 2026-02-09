-- =====================================
-- DIAGNÓSTICO E CORREÇÃO - BLOG_POSTS
-- =====================================
-- Execute este script completo no SQL Editor do Supabase

-- 1. VERIFICAR SE A TABELA JÁ EXISTE
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_posts'
    ) THEN
        RAISE NOTICE 'A tabela blog_posts já existe. Vou recriá-la...';
        DROP TABLE IF EXISTS public.blog_posts CASCADE;
    ELSE
        RAISE NOTICE 'Tabela blog_posts não existe. Criando...';
    END IF;
END $$;

-- 2. CRIAR A TABELA (FRESH START)
CREATE TABLE public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'Assistente das Graças',
  image TEXT,
  category TEXT DEFAULT 'Espiritualidade',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. HABILITAR RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 4. REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
DROP POLICY IF EXISTS "Acesso Total Blog" ON public.blog_posts;

-- 5. CRIAR POLÍTICA PERMISSIVA (DESENVOLVIMENTO)
CREATE POLICY "Acesso Total Blog"
ON public.blog_posts
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 6. INSERIR POST DE TESTE
INSERT INTO public.blog_posts (title, excerpt, content, category, is_featured, is_published, date, author, image)
VALUES (
  'Bem-vindo ao Blog de Fé',
  'Este é o primeiro post do blog. Use o painel administrativo para criar suas mensagens de fé.',
  'Este é o conteúdo completo do primeiro post de demonstração.\n\nVocê pode editar ou excluir este post a qualquer momento através do painel administrativo.\n\nQue a paz de Cristo esteja sempre com você!',
  'Espiritualidade',
  true,
  true,
  '08 Fev, 2026',
  'Equipe das Graças',
  'https://images.unsplash.com/photo-1544764200-d834fd210a23?q=80&w=800'
);

-- 7. VERIFICAÇÃO FINAL
SELECT 
    'Tabela criada com sucesso!' AS status,
    COUNT(*) AS total_posts,
    COUNT(*) FILTER (WHERE is_featured = true) AS posts_em_destaque
FROM public.blog_posts;

-- 8. LISTAR POSTS CRIADOS
SELECT id, title, category, is_featured, is_published, date
FROM public.blog_posts
ORDER BY created_at DESC;
