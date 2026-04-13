import { PokemonEntity } from "../../domain/entities/pokemon.entity";

export class PokemonMapper {
    static toEntity(row: any): PokemonEntity {
        return new PokemonEntity(
            row.id,
            row.name,
            row.types, // Postgres JSONB automatically becomes object/array
            row.stats,
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
            artwork_url: pokemon.artworkUrl
        };
    }
}
