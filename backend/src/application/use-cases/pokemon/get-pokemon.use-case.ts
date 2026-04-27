import { PokemonEntity } from "../../../domain/entities/pokemon.entity";
import { PokemonRepository } from "../../../domain/repositories/pokemon.repository";
import { PokeApiService } from "../../../infrastructure/services/pokeapi.service";
import { CustomError } from "../../../domain/errors/custom.error";

export class GetPokemonDetailsUseCase {
  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokeApiService: PokeApiService
  ) {}

  async execute(nameOrId: string | number): Promise<PokemonEntity> {
    // 1. Intentar buscar en la base de datos local
    let pokemon: PokemonEntity | null = null;
    
    if (typeof nameOrId === 'number' || !isNaN(Number(nameOrId))) {
      pokemon = await this.pokemonRepository.findById(Number(nameOrId));
    } else {
      pokemon = await this.pokemonRepository.findByName(String(nameOrId));
    }

    // 2. Si existe en la DB, devolverlo (Hit)
    if (pokemon) return pokemon;

    // 3. Si no existe, buscar en la PokéAPI (Miss)
    pokemon = await this.pokeApiService.fetchPokemon(nameOrId);
    
    if (!pokemon) {
      throw CustomError.notFound(`Pokemon '${nameOrId}' not found in External API`);
    }

    // 4. Guardar en la DB local para futuras consultas
    await this.pokemonRepository.save(pokemon);

    return pokemon;
  }
}
