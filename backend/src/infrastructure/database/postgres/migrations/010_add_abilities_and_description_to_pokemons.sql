-- Migration to add abilities and description to pokemons table
ALTER TABLE pokemons 
ADD COLUMN abilities TEXT[] DEFAULT '{}',
ADD COLUMN description TEXT;

-- Update existing records with default empty values if necessary
UPDATE pokemons SET abilities = '{}' WHERE abilities IS NULL;
UPDATE pokemons SET description = 'No description available.' WHERE description IS NULL;
