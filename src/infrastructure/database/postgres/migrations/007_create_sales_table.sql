-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    language VARCHAR(50),
    condition VARCHAR(100), -- e.g., 'Near Mint', 'Excellent', etc.
    observations TEXT,
    image_url TEXT,
    extras JSONB DEFAULT '{}', -- e.g., { "signed": true, "altered": true, "reverse_holo": true, "first_edition": true }
    status VARCHAR(50) DEFAULT 'active', -- active, sold, cancelled, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries by card and seller
CREATE INDEX idx_sales_card_id ON sales(card_id);
CREATE INDEX idx_sales_seller_id ON sales(seller_id);
