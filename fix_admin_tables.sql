-- SCRIPT PARA CORRIGIR TABELAS DO ADMIN (Settings, Categories, Orders)

-- 1. Tabela de Configurações da Loja (Settings)
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

-- Política RLS para Settings (Permitir tudo para facilitar dev)
alter table store_settings enable row level security;

create policy "Acesso Total Settings"
on store_settings for all
to public
using ( true )
with check ( true );

-- Inserir configuração inicial se não existir
insert into store_settings (store_name, primary_color, whatsapp_number)
select 'Lojinha das Graças', '#D4AF37', '5598984095956'
where not exists (select 1 from store_settings);


-- 2. Garantir Tabela de Categorias
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Política RLS para Categorias
alter table categories enable row level security;

create policy "Acesso Total Categorias"
on categories for all
to public
using ( true )
with check ( true );

-- Inserir categorias padrão
insert into categories (name) values 
  ('Terços'), 
  ('Imagens'), 
  ('Bíblias'), 
  ('Outros')
on conflict (name) do nothing;


-- 3. Garantir Tabela de Pedidos (Orders)
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

-- Política RLS para Orders
alter table orders enable row level security;

create policy "Acesso Total Orders"
on orders for all
to public
using ( true )
with check ( true );


-- 4. Garantir Bucket de Imagens
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public Access Images"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );

create policy "Public Upload Images"
on storage.objects for insert
to public
with check ( bucket_id = 'product-images' );
