-- SCRIPT COMPLETO PARA CORRIGIR TODAS AS TABELAS (Produtos, Usuários, Pedidos, Categorias, Configurações, Cupons)

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
  is_featured boolean default false,
  active boolean default true,
  images jsonb default '[]'::jsonb
);

-- Adicionar colunas se não existirem
alter table products add column if not exists images jsonb default '[]'::jsonb;
alter table products add column if not exists is_featured boolean default false;
alter table products add column if not exists active boolean default true;

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

-- Adicionar colunas se não existirem
alter table usuarios add column if not exists telefone text;
alter table usuarios add column if not exists endereco text;

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

-- Adicionar novas configurações
alter table store_settings add column if not exists hero_banners jsonb default '[]'::jsonb;
alter table store_settings add column if not exists pix_key text;
alter table store_settings add column if not exists infinitepay_handle text;
alter table store_settings add column if not exists monthly_revenue_goal numeric default 5000;
alter table store_settings add column if not exists notification_sound_url text default 'https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3';

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


-- 5. TABELA DE PEDIDOS (COM CRM)
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

-- Adicionar colunas de CRM se não existirem
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists customer_address jsonb;
alter table orders add column if not exists transaction_nsu text;
alter table orders add column if not exists infinitepay_data jsonb;

-- Policies para Pedidos
alter table orders enable row level security;
drop policy if exists "Acesso Total Orders" on orders;
create policy "Acesso Total Orders" on orders for all to public using (true) with check (true);


-- 6. TABELA DE CUPONS
create table if not exists coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  type text not null, -- 'percentage' ou 'fixed'
  value decimal(10,2) not null,
  min_spend decimal(10,2) default 0,
  usage_limit integer,
  usage_count integer default 0,
  expiry_date timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policies para Cupons
alter table coupons enable row level security;
drop policy if exists "Acesso Total Coupons" on coupons;
create policy "Acesso Total Coupons" on coupons for all to public using (true) with check (true);


-- 7. TABELA DE BLOG
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


-- 8. TABELA DE LISTA DE ESPERA (AVISE-ME)
create table if not exists waiting_list (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id),
  customer_name text not null,
  customer_email text,
  customer_whatsapp text,
  notified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policies para Lista de Espera
alter table waiting_list enable row level security;
drop policy if exists "Acesso Total Waiting List" on waiting_list;
create policy "Acesso Total Waiting List" on waiting_list for all to public using (true) with check (true);

