-- Add owned_decks to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS owned_decks TEXT[] DEFAULT '{}';

-- Create decks table
CREATE TABLE IF NOT EXISTS decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cards JSONB DEFAULT '[]', -- List of { cardId: string, count: number }
    strategy TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
