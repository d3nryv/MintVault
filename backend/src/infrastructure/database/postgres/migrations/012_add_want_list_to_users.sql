-- Add want_list to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS want_list TEXT[] DEFAULT '{}';
