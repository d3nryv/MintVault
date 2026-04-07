-- Carta 1: Propiedad de PokemonMaster92 (Coleccionista experto)
INSERT INTO cards (
    owner_id,
    name,
    type,
    rarity,
    description,
    price,
    stock,
    source,
    language,
    is_for_sale,
    sale_id,
    acquired_at,
    metadata
) VALUES (
    (SELECT id FROM users WHERE username = 'PokemonMaster92'),
    'Charizard 1st Edition',
    'Fire',
    'Ultra Rare',
    'Legendary Charizard card from the Base Set. 1st Edition stamp. Near Mint condition. One of the most sought-after cards in Pokemon TCG history.',
    5000.00,
    1,
    'Base Set Booster Pack',
    'English',
    TRUE,
    gen_random_uuid(),
    '2018-06-15 10:30:00',
    '{
        "grade": "PSA 9",
        "set": "Base Set",
        "edition": "1st Edition",
        "artist": "Mitsuhiro Arita",
        "hp": 120,
        "attack": "Fire Spin",
        "damage": 100,
        "holo": true,
        "collection_number": "4/102"
    }'::JSONB
);

-- Carta 2: Propiedad de NewCollector2024 (Principiante)
INSERT INTO cards (
    owner_id,
    name,
    type,
    rarity,
    description,
    price,
    stock,
    source,
    language,
    is_for_sale,
    sale_id,
    acquired_at,
    metadata
) VALUES (
    (SELECT id FROM users WHERE username = 'NewCollector2024'),
    'Koraidon EX - Alt Art',
    'Fighting',
    'Special Illustration Rare',
    'Beautiful Alternate Art version of Koraidon EX from Scarlet & Violet base set. Features stunning artwork of Koraidon in its natural habitat.',
    45.99,
    1,
    'Scarlet & Violet Booster Pack',
    'English',
    TRUE,
    gen_random_uuid(),
    '2024-01-20 14:45:00',
    '{
        "grade": "Raw - Mint",
        "set": "Scarlet & Violet Base Set",
        "edition": "Regular",
        "artist": "Kouki Saitou",
        "hp": 230,
        "attack": "Prismatic Claw",
        "damage": 180,
        "holo": true,
        "collection_number": "254/198",
        "alt_art": true
    }'::JSONB
);

-- Carta 3: Propiedad de JapaneseCardHunter (Especialista japonés)
INSERT INTO cards (
    owner_id,
    name,
    type,
    rarity,
    description,
    price,
    stock,
    source,
    language,
    is_for_sale,
    sale_id,
    acquired_at,
    metadata
) VALUES (
    (SELECT id FROM users WHERE username = 'JapaneseCardHunter'),
    'Mewtwo - Japanese CD Promo',
    'Psychic',
    'Promo Rare',
    'Rare Japanese promotional card from the CD promo set. Features iconic artwork of Mewtwo. Extremely hard to find in mint condition.',
    350.00,
    1,
    'Pokemon CD Promo Pack',
    'Japanese',
    FALSE,  -- No está a la venta, es parte de su colección personal
    NULL,
    '2019-11-10 09:15:00',
    '{
        "grade": "PSA 10",
        "set": "CD Promos",
        "edition": "Japanese Promo",
        "artist": "Ken Sugimori",
        "hp": 70,
        "attack": "Psychic",
        "damage": 20,
        "holo": true,
        "collection_number": "006",
        "promo_type": "CD",
        "rare_find": true,
        "acquisition_story": "Bought at Tokyo Card Shop during vacation"
    }'::JSONB
);