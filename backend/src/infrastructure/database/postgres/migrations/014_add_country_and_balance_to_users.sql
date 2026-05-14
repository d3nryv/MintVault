-- Add country and balance to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'ES';
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0.00;
