-- Create albums and pages tables
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cover_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    cover_url TEXT,
    height INTEGER NOT NULL DEFAULT 3, -- Rows (e.g. 3)
    width INTEGER NOT NULL DEFAULT 3,  -- Columns (e.g. 3)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    slots JSONB DEFAULT '{}', -- Format: { "0": "CARD-UUID", "1": null, "2": "CARD-UUID-2" }
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(album_id, page_number)
);


-- ALTER TABLE pages ADD COLUMN IF NOT EXISTS slots JSONB DEFAULT '{}';
