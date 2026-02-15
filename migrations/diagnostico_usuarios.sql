-- DIAGNÓSTICO COMPLETO DA TABELA USUARIOS
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- 1. VERIFICAR SE A TABELA EXISTE
select exists(
  select 1 from information_schema.tables 
  where table_schema = 'public' 
  and table_name = 'usuarios'
) as tabela_usuarios_existe;

-- 2. VERIFICAR ESTRUTURA DA TABELA (quais colunas existem)
select column_name, data_type, is_nullable
from information_schema.columns 
where table_name = 'usuarios' 
and table_schema = 'public'
order by ordinal_position;

-- 3. VERIFICAR SE AS COLUNAS telefone E endereco EXISTEM
select 
  exists(select 1 from information_schema.columns where table_name = 'usuarios' and column_name = 'telefone') as coluna_telefone_existe,
  exists(select 1 from information_schema.columns where table_name = 'usuarios' and column_name = 'endereco') as coluna_endereco_existe;

-- 4. VERIFICAR POLÍTICAS DE RLS (Row Level Security)
select schemaname, tablename, policyname, permissive, roles, cmd, qual
from pg_policies 
where tablename = 'usuarios';

-- 5. VERIFICAR SE RLS ESTÁ ATIVADO
select tablename, rowsecurity 
from pg_tables 
where schemaname = 'public' 
and tablename = 'usuarios';

-- 6. VER TODOS OS REGISTROS DA TABELA (para debug)
select id, auth_id, email, nome, telefone, endereco, nivel, created_at
from usuarios
order by created_at desc
limit 10;

-- 7. CORRIGIR: ADICIONAR COLUNAS SE NÃO EXISTIREM
alter table usuarios add column if not exists telefone text;
alter table usuarios add column if not exists endereco text;

-- 8. VERIFICAR NOVAMENTE APÓS CORREÇÃO
select column_name 
from information_schema.columns 
where table_name = 'usuarios' 
and column_name in ('telefone', 'endereco');
