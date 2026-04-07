-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    rarity VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(255) NOT NULL,
    language VARCHAR(50),
    is_for_sale BOOLEAN DEFAULT FALSE,
    sale_id UUID,
    acquired_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);
