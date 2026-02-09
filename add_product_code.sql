-- Add 'code' column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS code text;

-- Update RLS if needed (already broad 'using (true)')
