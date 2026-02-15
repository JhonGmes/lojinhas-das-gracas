-- MIGRATION: Adicionar colunas telefone e endereco na tabela usuarios
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas se não existirem
alter table usuarios add column if not exists telefone text;
alter table usuarios add column if not exists endereco text;

-- Verificar estrutura da tabela
select column_name, data_type 
from information_schema.columns 
where table_name = 'usuarios' 
order by ordinal_position;
