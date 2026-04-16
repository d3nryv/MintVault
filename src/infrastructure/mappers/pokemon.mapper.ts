import { PokemonEntity } from "../../domain/entities/pokemon.entity";

export class PokemonMapper {
    static toEntity(row: any): PokemonEntity {
        return new PokemonEntity(
            row.id,
            row.name,
            typeof row.types === 'string' ? JSON.parse(row.types) : row.types,
            typeof row.stats === 'string' ? JSON.parse(row.stats) : row.stats,
            typeof row.abilities === 'string' ? JSON.parse(row.abilities) : row.abilities,
            row.description,
            row.artwork_url,
            row.created_at
        );
    }

    static toDatabase(pokemon: PokemonEntity): any {
        return {
            id: pokemon.id,
            name: pokemon.name,
            types: JSON.stringify(pokemon.types),
            stats: JSON.stringify(pokemon.stats),
            abilities: JSON.stringify(pokemon.abilities),
            description: pokemon.description,
            artwork_url: pokemon.artworkUrl
        };
    }
}
