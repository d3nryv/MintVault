-- Add reported_undelivered column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reported_undelivered BOOLEAN DEFAULT FALSE;
