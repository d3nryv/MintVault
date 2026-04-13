import { PokemonRepository } from "../../../domain/repositories/pokemon.repository";
import { PokeApiService } from "../../../infrastructure/services/pokeapi.service";

export interface ListPokemonDto {
  offset?: number;
  limit?: number;
  source?: 'local' | 'external';
}

export class ListPokemonsUseCase {
  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokeApiService: PokeApiService
  ) {}

  async execute(dto: ListPokemonDto) {
    const offset = dto.offset || 0;
    const limit = dto.limit || 20;

    if (dto.source === 'local') {
      return await this.pokemonRepository.list(offset, limit);
    }

    // Listar desde la PokéAPI (para descubrir nuevos)
    const externalList = await this.pokeApiService.listPokemon(offset, limit);
    
    // Devolvemos el nombre e ID mapeado desde la URL (ej: .../pokemon/25/ -> id 25)
    return externalList.map(item => {
      const parts = item.url.split('/');
      const id = parseInt(parts[parts.length - 2]);
      return {
        id,
        name: item.name,
        artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      };
    });
  }
}
