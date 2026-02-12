-- EXPANSÃO DA TABELA DE PEDIDOS PARA CRM COMPLETO
-- Adiciona campos de contato e endereço do cliente

-- Adicionar campos de contato
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Adicionar campos de endereço
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_street TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_complement TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_neighborhood TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address_zipcode TEXT;

-- Adicionar campo para armazenar dados brutos da InfinitePay (backup completo)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS infinitepay_data JSONB;

-- Adicionar campo para transaction_nsu da InfinitePay
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_nsu TEXT;

-- Adicionar índice para busca rápida por telefone e email
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_nsu ON orders(transaction_nsu);

-- Comentários para documentação
COMMENT ON COLUMN orders.customer_email IS 'Email do cliente coletado pela InfinitePay';
COMMENT ON COLUMN orders.customer_phone IS 'Telefone do cliente coletado pela InfinitePay';
COMMENT ON COLUMN orders.customer_address_street IS 'Rua/Avenida do endereço';
COMMENT ON COLUMN orders.customer_address_number IS 'Número do endereço';
COMMENT ON COLUMN orders.customer_address_complement IS 'Complemento (apto, bloco, etc)';
COMMENT ON COLUMN orders.customer_address_neighborhood IS 'Bairro';
COMMENT ON COLUMN orders.customer_address_city IS 'Cidade';
COMMENT ON COLUMN orders.customer_address_state IS 'Estado (UF)';
COMMENT ON COLUMN orders.customer_address_zipcode IS 'CEP';
COMMENT ON COLUMN orders.infinitepay_data IS 'Dados completos retornados pela InfinitePay API (backup)';
COMMENT ON COLUMN orders.transaction_nsu IS 'NSU da transação InfinitePay para rastreamento';
