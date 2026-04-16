import { db } from "../database/postgres/database";
import { PokemonEntity } from "../../domain/entities/pokemon.entity";
import { PokemonRepository } from "../../domain/repositories/pokemon.repository";
import { PokemonMapper } from "../mappers/pokemon.mapper";

export class PostgresPokemonRepository implements PokemonRepository {

    async findById(id: number): Promise<PokemonEntity | null> {
        const query = 'SELECT * FROM pokemons WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        
        if (rows.length === 0) return null;
        return PokemonMapper.toEntity(rows[0]);
    }

    async findByName(name: string): Promise<PokemonEntity | null> {
        const query = 'SELECT * FROM pokemons WHERE LOWER(name) = LOWER($1)';
        const { rows } = await db.query(query, [name]);
        
        if (rows.length === 0) return null;
        return PokemonMapper.toEntity(rows[0]);
    }

    async save(pokemon: PokemonEntity): Promise<PokemonEntity> {
        const dbData = PokemonMapper.toDatabase(pokemon);
        const query = `
            INSERT INTO pokemons (id, name, types, stats, abilities, description, artwork_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name,
                types = EXCLUDED.types,
                stats = EXCLUDED.stats,
                abilities = EXCLUDED.abilities,
                description = EXCLUDED.description,
                artwork_url = EXCLUDED.artwork_url
            RETURNING *`;
        
        const { rows } = await db.query(query, [
            dbData.id, 
            dbData.name, 
            dbData.types, 
            dbData.stats, 
            dbData.abilities,
            dbData.description,
            dbData.artwork_url
        ]);
        
        return PokemonMapper.toEntity(rows[0]);
    }

    async list(offset: number, limit: number, search?: string): Promise<PokemonEntity[]> {
        let query = 'SELECT * FROM pokemons';
        const params: any[] = [limit, offset];

        if (search) {
            query += ' WHERE LOWER(name) LIKE LOWER($3) OR id::text LIKE $3';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY id LIMIT $1 OFFSET $2';
        
        const { rows } = await db.query(query, params);
        return rows.map(row => PokemonMapper.toEntity(row));
    }
}
