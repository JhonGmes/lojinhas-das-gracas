-- =====================================================
-- MIGRATION: Update Orders Table
-- Description: Add customer details and payment method columns
-- =====================================================

-- Add payment_method column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'credit_card';

-- Add customer details columns if they don't exist (they might already exist based on usage in api.ts)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address_street TEXT,
ADD COLUMN IF NOT EXISTS customer_address_number TEXT,
ADD COLUMN IF NOT EXISTS customer_address_complement TEXT,
ADD COLUMN IF NOT EXISTS customer_address_neighborhood TEXT,
ADD COLUMN IF NOT EXISTS customer_address_city TEXT,
ADD COLUMN IF NOT EXISTS customer_address_state TEXT,
ADD COLUMN IF NOT EXISTS customer_address_zipcode TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.payment_method IS 'Method of payment: credit_card, debit_card, pix';
