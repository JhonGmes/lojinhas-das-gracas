-- SCRIPT PARA CORRIGIR TABELAS DO ADMIN (Banner Carousel e Blog)

-- 1. Adicionar coluna hero_banners na tabela store_settings se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_settings' AND column_name='hero_banners') THEN
        ALTER TABLE store_settings ADD COLUMN hero_banners text[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Criar tabela de Blog se não existir
CREATE TABLE IF NOT EXISTS blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    excerpt text,
    date text,
    author text,
    image text,
    category text,
    is_featured boolean DEFAULT false,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS para Blog
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 4. Criar Políticas para Blog (Acesso Total para facilitar dev)
DROP POLICY IF EXISTS "Acesso Total Blog" ON blog_posts;
CREATE POLICY "Acesso Total Blog"
ON blog_posts FOR ALL
TO public
USING ( true )
WITH CHECK ( true );
