# Configuração do Supabase

Para que o projeto funcione corretamente, você precisa configurar as tabelas e o storage no seu painel do Supabase.

## 1. Criar storage bucket
1. Vá para a aba **Storage** no Supabase.
2. Clique em **New Bucket**.
3. Nomeie o bucket como `product-images`.
4. Marque a opção **Public bucket** (para que as imagens possam ser visualizadas no site).

## 2. Criar tabelas (SQL Editor)
Vá para o **SQL Editor** no Supabase e execute o seguinte script:

```sql
-- Criar tabela de produtos
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  promotional_price decimal(10,2),
  image text,
  category text,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar tabela de usuários
create table if not exists usuarios (
  id uuid default gen_random_uuid() primary key,
  auth_id uuid references auth.users(id),
  email text,
  nivel text default 'customer',
  nome text
);

-- Criar tabela de pedidos (com número sequencial)
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number serial,
  customer_name text,
  total decimal(10,2),
  status text default 'pending',
  items jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar atualização de status para o admin
create policy "Admin Update Orders"
on orders for update
to public, authenticated
using ( true );
-- Adicionar suporte a múltiplas imagens
alter table products add column if not exists images jsonb default '[]'::jsonb;

-- Criar tabela de categorias
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into categories (name) values ('Terços'), ('Imagens'), ('Bíblias'), ('Outros')
on conflict (name) do nothing;

-- Criar tabela de blog
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  excerpt text,
  author text,
  image text,
  category text,
  is_featured boolean default false,
  is_published boolean default true,
  date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Liberar acesso total ao blog (ambiente de desenvolvimento)
create policy "Acesso Total Blog"
on blog_posts for all
to public, authenticated
using ( true );
```

## 3. Políticas de Acesso (RLS) para Categorias
Execute este código se quiser liberar o gerenciamento de categorias:
```sql
create policy "Acesso Total Categorias"
on categories for all
to public, authenticated
using ( true );
```

Execute este código no **SQL Editor** para permitir o envio e visualização de imagens:

```sql
-- Liberar acesso público para visualizar imagens
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );

-- Liberar upload para qualquer pessoa (uso em desenvolvimento)
create policy "Public Upload"
on storage.objects for insert
to public
with check ( bucket_id = 'product-images' );

-- Liberar atualização e delete (opcional)
create policy "Public Update"
on storage.objects for update
to public
using ( bucket_id = 'product-images' );
```

> **Nota:** Se você configurou as tabelas de produtos e pedidos e ainda recebe erros de acesso, vá na aba **Table Editor**, selecione a tabela e desative a chave **"RLS Enabled"** (no canto superior direito) para testes rápidos de desenvolvimento.
