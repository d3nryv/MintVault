import { PokemonEntity } from "../entities/pokemon.entity";

export interface PokemonRepository {
    findById(id: number): Promise<PokemonEntity | null>;
    findByName(name: string): Promise<PokemonEntity | null>;
    save(pokemon: PokemonEntity): Promise<PokemonEntity>;
    list(offset: number, limit: number, search?: string): Promise<PokemonEntity[]>;
}
