import { PokemonEntity } from "../entities/pokemon.entity";

export interface PokemonExternalService {
  fetchPokemon(nameOrId: string | number): Promise<PokemonEntity | null>;
  listPokemon(offset: number, limit: number): Promise<{ name: string; url: string }[]>;
}
