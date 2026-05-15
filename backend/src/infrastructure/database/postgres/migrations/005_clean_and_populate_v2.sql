-- 1. Limpiar datos existentes
TRUNCATE TABLE cards, users RESTART IDENTITY CASCADE;

-- 2. Insertar Usuario Maestro
DO $$
DECLARE
    master_user_id UUID;
    noob_user_id UUID;
BEGIN
    INSERT INTO users (
        username, title, email, password, showcase, register_date
    ) VALUES (
        'AshKetchum', 'Pokemon Master', 'ash@pallettown.com', 'pikachu123',
        ARRAY['🏆 Indigo League Trophy'], CURRENT_TIMESTAMP
    ) RETURNING id INTO master_user_id;

    INSERT INTO users (
        username, title, email, password, showcase, register_date
    ) VALUES (
        'GaryOak', 'Professional Rival', 'gary@pallettown.com', 'smellyalater',
        ARRAY['🚗 Red Convertible'], CURRENT_TIMESTAMP
    ) RETURNING id INTO noob_user_id;

    -- 3. Insertar Cartas Reales (usando formato compatible con TCG SDK)
    -- Carta de Ash (Charizard EX)
    INSERT INTO cards (
        owner_id, name, type, rarity, price, stock, source, language, is_for_sale, metadata
    ) VALUES (
        master_user_id, 'Charizard-EX', 'Pokémon', 'Rare Holo EX', 150.00, 1, 'Fates Collide', 'EN', TRUE,
        '{
            "tcg_id": "xy10-11",
            "hp": "180",
            "types": ["Fire"],
            "subtypes": ["Basic", "EX"],
            "attacks": [
                {"name": "Flame Claw", "cost": ["Fire", "Colorless"], "damage": "50", "text": ""},
                {"name": "Burning Energy", "cost": ["Fire", "Fire", "Colorless", "Colorless"], "damage": "150", "text": "Discard 2 Fire Energy from this Pokémon."}
            ],
            "images": {
                "small": "https://images.pokemontcg.io/xy10/11.png",
                "large": "https://images.pokemontcg.io/xy10/11_hir.png"
            },
            "set": {"id": "xy10", "name": "Fates Collide", "series": "XY"}
        }'::JSONB
    );

    -- Carta de Gary (Umbreon GX)
    INSERT INTO cards (
        owner_id, name, type, rarity, price, stock, source, language, is_for_sale, metadata
    ) VALUES (
        noob_user_id, 'Umbreon-GX', 'Pokémon', 'Rare Holo GX', 85.50, 1, 'Sun & Moon', 'EN', TRUE,
        '{
            "tcg_id": "sm1-80",
            "hp": "200",
            "types": ["Darkness"],
            "subtypes": ["Stage 1", "GX"],
            "attacks": [
                {"name": "Strafe", "cost": ["Darkness"], "damage": "30", "text": "You may switch this Pokémon with 1 of your Benched Pokémon."},
                {"name": "Shadow Bullet", "cost": ["Darkness", "Colorless", "Colorless"], "damage": "90", "text": "This attack does 30 damage to 1 of your opponent''s Benched Pokémon."}
            ],
            "images": {
                "small": "https://images.pokemontcg.io/sm1/80.png",
                "large": "https://images.pokemontcg.io/sm1/80_hir.png"
            },
            "set": {"id": "sm1", "name": "Sun & Moon", "series": "Sun & Moon"}
        }'::JSONB
    );

END $$;
