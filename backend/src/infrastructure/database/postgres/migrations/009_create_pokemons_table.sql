-- Create pokemons table for hybrid caching
CREATE TABLE IF NOT EXISTS pokemons (
    id INTEGER PRIMARY KEY, -- PokéAPI ID
    name VARCHAR(100) NOT NULL UNIQUE,
    types JSONB NOT NULL,
    stats JSONB NOT NULL,
    artwork_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching by name
CREATE INDEX idx_pokemons_name ON pokemons(name);
