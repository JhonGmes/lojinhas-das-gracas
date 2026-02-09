-- =====================================
-- SCRIPT PARA CRIAR TABELA BLOG_POSTS
-- =====================================
-- Execute este script no SQL Editor do Supabase
-- para resolver os erros 400 (Bad Request)

-- 1. Criar a tabela blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
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

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de acesso total (desenvolvimento)
-- ATENÇÃO: Em produção, você deve criar políticas mais restritivas
DROP POLICY IF EXISTS "Acesso Total Blog" ON blog_posts;
CREATE POLICY "Acesso Total Blog"
ON blog_posts
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 4. Verificar se a tabela foi criada com sucesso
SELECT 'Tabela blog_posts criada com sucesso!' AS status;
SELECT COUNT(*) AS total_posts FROM blog_posts;
