-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    banner_url TEXT,
    profile_pic_url TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    showcase TEXT[] DEFAULT '{}',
    albums TEXT[] DEFAULT '{}',
    followers TEXT[] DEFAULT '{}',
    following TEXT[] DEFAULT '{}',
    register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    medals TEXT[] DEFAULT '{}',
    owned_english_cards TEXT[] DEFAULT '{}',
    owned_japanese_cards TEXT[] DEFAULT '{}',
    cards_on_sale TEXT[] DEFAULT '{}',
    owned_pokemon TEXT[] DEFAULT '{}',
    favourite_cards TEXT[] DEFAULT '{}',
    favourite_sets TEXT[] DEFAULT '{}',
    favourite_pokemon TEXT[] DEFAULT '{}'
);
