# Configuração do Banco de Dados (Supabase)

Para garantir que todas as funcionalidades da loja (Admin, Login, Checkout, Produtos) funcionem, execute o script SQL abaixo no **SQL Editor** do seu projeto Supabase.

> **Atenção:** Este script cria as tabelas se elas não existirem e configura as permissões (Policies) necessárias.

## Script Completo de Criação (Copie e Cole)

```sql
-- 1. TABELA DE PRODUTOS
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  promotional_price decimal(10,2),
  image text,
  category text,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_featured boolean default false
);
-- Garante colunas extras
alter table products add column if not exists images jsonb default '[]'::jsonb;
alter table products add column if not exists is_featured boolean default false;
-- Permissões
alter table products enable row level security;
drop policy if exists "Acesso Total Produtos" on products;
create policy "Acesso Total Produtos" on products for all to public using (true) with check (true);


-- 2. TABELA DE USUÁRIOS (Para Login/Cadastro)
create table if not exists usuarios (
  id uuid default gen_random_uuid() primary key,
  auth_id uuid references auth.users(id),
  email text,
  nivel text default 'customer',
  nome text,
  telefone text,
  endereco text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Permissões
alter table usuarios enable row level security;
drop policy if exists "Acesso Total Usuarios" on usuarios;
create policy "Acesso Total Usuarios" on usuarios for all to public using (true) with check (true);


-- 3. TABELA DE CATEGORIAS
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Permissões
alter table categories enable row level security;
drop policy if exists "Acesso Total Categorias" on categories;
create policy "Acesso Total Categorias" on categories for all to public using (true) with check (true);
-- Dados
insert into categories (name) values ('Terços'), ('Imagens'), ('Bíblias'), ('Outros') on conflict (name) do nothing;


-- 4. TABELA DE PEDIDOS
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
-- Permissões
alter table orders enable row level security;
drop policy if exists "Acesso Total Orders" on orders;
create policy "Acesso Total Orders" on orders for all to public using (true) with check (true);


-- 5. TABELA DE CONFIGURAÇÕES
create table if not exists store_settings (
  id uuid default gen_random_uuid() primary key,
  store_name text,
  store_email text,
  whatsapp_number text,
  primary_color text default '#D4AF37',
  logo_url text,
  hero_title text,
  hero_subtitle text,
  hero_button_text text,
  hero_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
-- Permissões
alter table store_settings enable row level security;
drop policy if exists "Acesso Total Settings" on store_settings;
create policy "Acesso Total Settings" on store_settings for all to public using (true) with check (true);
-- Dados
insert into store_settings (store_name) select 'Lojinha das Graças' where not exists (select 1 from store_settings);


-- 6. TABELA DE BLOG
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
-- Permissões
alter table blog_posts enable row level security;
drop policy if exists "Acesso Total Blog" on blog_posts;
create policy "Acesso Total Blog" on blog_posts for all to public using (true) with check (true);
```

## Storage (Imagens)

Certifique-se de criar um bucket chamado `product-images` e deixá-lo como **Public**.
Se precisar liberar via SQL:

```sql
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
drop policy if exists "Imagens Publicas" on storage.objects;
create policy "Imagens Publicas" on storage.objects for select to public using (bucket_id = 'product-images');
drop policy if exists "Upload Publico" on storage.objects;
create policy "Upload Publico" on storage.objects for insert to public with check (bucket_id = 'product-images');
```
