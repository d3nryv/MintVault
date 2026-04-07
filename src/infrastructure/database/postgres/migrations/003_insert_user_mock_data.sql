-- Insertar 3 usuarios de ejemplo
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
BEGIN
    -- Usuario 1
    INSERT INTO users (
        username, title, banner_url, profile_pic_url, email, password,
        showcase, albums, followers, following, medals,
        owned_english_cards, owned_japanese_cards, cards_on_sale,
        owned_pokemon, favourite_cards, favourite_sets, favourite_pokemon
    ) VALUES (
        'PokemonMaster92', '🌟 Legendary Collector 🌟',
        'https://example.com/banners/legendary-banner.jpg',
        'https://example.com/profiles/master92-avatar.png',
        'pokemon.master92@example.com', 'hashed_password_1',
        ARRAY['🌟 Charizard 1st Edition', '💎 Pikachu Illustrator', '🏆 Complete Base Set'],
        ARRAY['Base Set', 'Fossil', 'Jungle', 'Team Rocket'],
        ARRAY['user123', 'card_collector', 'tcg_fan'],
        ARRAY['CharizardKing', 'EeveeLover', 'MewtwoMaster'],
        ARRAY['🏅 10,000 Cards', '🏅 5 Years Member', '🏅 Tournament Winner'],
        ARRAY['Base Set - Charizard', 'Fossil - Dragonite', 'Jungle - Snorlax'],
        ARRAY['Japanese Base - Blastoise', 'Japanese Gym - Venusaur'],
        ARRAY['Base Set - Charizard - $500', 'Shining Gyarados - $300'],
        ARRAY['Charizard', 'Mewtwo', 'Dragonite', 'Gyarados'],
        ARRAY['Charizard 1st Edition', 'Shining Charizard', 'Gold Star Mew'],
        ARRAY['Base Set', 'Neo Destiny', 'Skyridge'],
        ARRAY['Charizard', 'Mewtwo', 'Rayquaza', 'Garchomp']
    ) RETURNING id INTO user1_id;

    -- Usuario 2
    INSERT INTO users (
        username, title, banner_url, profile_pic_url, email, password,
        showcase, albums, followers, following, medals,
        owned_english_cards, owned_japanese_cards, cards_on_sale,
        owned_pokemon, favourite_cards, favourite_sets, favourite_pokemon
    ) VALUES (
        'NewCollector2024', '🌱 Starting my journey 🌱',
        'https://example.com/banners/newbie-banner.jpg',
        'https://example.com/profiles/newcollector-avatar.png',
        'new.collector@example.com', 'hashed_password_2',
        ARRAY['✨ My first Holo', '🎁 Recent pulls', '📖 Collection growing'],
        ARRAY['Sword & Shield', 'Scarlet & Violet', 'Paldea Evolved'],
        ARRAY['PokemonMaster92'],
        ARRAY['PokemonMaster92', 'tcg_community', 'card_shop'],
        ARRAY['🥉 First Week', '📝 100 Cards'],
        ARRAY['Scarlet & Violet - Koraidon EX', 'Paldea Evolved - Meowscarada'],
        ARRAY[]::TEXT[],
        ARRAY['Koraidon EX - $25', 'Meowscarada EX - $15'],
        ARRAY['Meowscarada', 'Koraidon', 'Fuecoco', 'Pikachu'],
        ARRAY['Koraidon EX 1st Edition', 'Meowscarada EX Alt Art'],
        ARRAY['Paldea Evolved', 'Scarlet & Violet Base'],
        ARRAY['Meowscarada', 'Fuecoco', 'Sprigatito', 'Pikachu']
    ) RETURNING id INTO user2_id;

    -- Usuario 3
    INSERT INTO users (
        username, title, banner_url, profile_pic_url, email, password,
        showcase, albums, followers, following, medals,
        owned_english_cards, owned_japanese_cards, cards_on_sale,
        owned_pokemon, favourite_cards, favourite_sets, favourite_pokemon
    ) VALUES (
        'JapaneseCardHunter', '🗾 Japanese Collection Specialist 🗾',
        'https://example.com/banners/japanese-banner.jpg',
        'https://example.com/profiles/japanhunter-avatar.png',
        'japan.cards@example.com', 'hashed_password_3',
        ARRAY['🇯🇵 PSA 10 Japanese Charizard', '🌸 Rare Promos', '🏯 Vintage Japanese'],
        ARRAY['Japanese Base Set', 'Japanese Promos', 'Vending Series', 'Web Series'],
        ARRAY['PokemonMaster92', 'card_expert', 'japan_imports'],
        ARRAY['PokemonMaster92', 'NewCollector2024', 'japan_shop'],
        ARRAY['🏅 Japanese Collection Expert', '🏅 100+ Japanese Cards', '🏅 Rare Promo Hunter'],
        ARRAY['Base Set - Blastoise', 'Fossil - Lapras'],
        ARRAY['Japanese Base - Charizard', 'Japanese CD Promo - Pikachu', 'Vending Series - Mewtwo', 'Web Series - Arcanine'],
        ARRAY['Japanese Base - Venusaur - $800', 'Vending Series - Mew - $200'],
        ARRAY['Charizard', 'Mew', 'Mewtwo', 'Arcanine', 'Pikachu'],
        ARRAY['Japanese Base Charizard', 'CD Promo Pikachu', 'Vending Mewtwo'],
        ARRAY['Japanese Base Set', 'Vending Series', 'CD Promos', 'Web Series'],
        ARRAY['Charizard', 'Mew', 'Arcanine', 'Pikachu', 'Mewtwo']
    ) RETURNING id INTO user3_id;

    -- Mostrar los IDs creados
    RAISE NOTICE 'Usuarios creados:';
    RAISE NOTICE '1. PokemonMaster92 (ID: %)', user1_id;
    RAISE NOTICE '2. NewCollector2024 (ID: %)', user2_id;
    RAISE NOTICE '3. JapaneseCardHunter (ID: %)', user3_id;
END $$;

-- Verificar que se insertaron correctamente
SELECT 
    id,
    username,
    email,
    title,
    register_date,
    array_length(showcase, 1) as showcase_count,
    array_length(owned_english_cards, 1) as english_cards_count,
    array_length(owned_japanese_cards, 1) as japanese_cards_count
FROM users
ORDER BY register_date;