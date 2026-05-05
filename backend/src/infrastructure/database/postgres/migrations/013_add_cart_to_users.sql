-- Add cart to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS cart TEXT[] DEFAULT '{}';
