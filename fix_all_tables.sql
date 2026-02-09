-- SCRIPT COMPLETO PARA CORRIGIR TODAS AS TABELAS (Produtos, Usuários, Pedidos, Categorias, Configurações)

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

-- Adicionar suporte a múltiplas imagens se não existir
alter table products add column if not exists images jsonb default '[]'::jsonb;
alter table products add column if not exists is_featured boolean default false;

-- Policies para Produtos
alter table products enable row level security;
drop policy if exists "Acesso Total Produtos" on products;
create policy "Acesso Total Produtos" on products for all to public using (true) with check (true);


-- 2. TABELA DE USUÁRIOS
create table if not exists usuarios (
  id uuid default gen_random_uuid() primary key,
  auth_id uuid references auth.users(id),
  email text,
  nivel text default 'customer', -- 'admin' ou 'customer'
  nome text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policies para Usuários
alter table usuarios enable row level security;
drop policy if exists "Acesso Total Usuarios" on usuarios;
create policy "Acesso Total Usuarios" on usuarios for all to public using (true) with check (true);


-- 3. TABELA DE CONFIGURAÇÕES (AJUSTES)
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

-- Policies para Settings
alter table store_settings enable row level security;
drop policy if exists "Acesso Total Settings" on store_settings;
create policy "Acesso Total Settings" on store_settings for all to public using (true) with check (true);

-- Inserir padrão se vazio
insert into store_settings (store_name, primary_color, whatsapp_number) 
select 'Lojinha das Graças', '#D4AF37', '5598984095956'
where not exists (select 1 from store_settings);


-- 4. TABELA DE CATEGORIAS
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policies para Categorias
alter table categories enable row level security;
drop policy if exists "Acesso Total Categorias" on categories;
create policy "Acesso Total Categorias" on categories for all to public using (true) with check (true);

-- Categorias Padrão
insert into categories (name) values ('Terços'), ('Imagens'), ('Bíblias'), ('Outros') on conflict (name) do nothing;


-- 5. TABELA DE PEDIDOS
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

-- Policies para Pedidos
alter table orders enable row level security;
drop policy if exists "Acesso Total Orders" on orders;
create policy "Acesso Total Orders" on orders for all to public using (true) with check (true);


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

-- Policies para Blog
alter table blog_posts enable row level security;
drop policy if exists "Acesso Total Blog" on blog_posts;
create policy "Acesso Total Blog" on blog_posts for all to public using (true) with check (true);
