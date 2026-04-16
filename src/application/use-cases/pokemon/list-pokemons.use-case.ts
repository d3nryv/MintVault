import { PokemonRepository } from "../../../domain/repositories/pokemon.repository";
import { PokeApiService } from "../../../infrastructure/services/pokeapi.service";

export interface ListPokemonDto {
  offset?: number;
  limit?: number;
  source?: 'local' | 'external';
  search?: string;
}

export class ListPokemonsUseCase {
  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokeApiService: PokeApiService
  ) {}

  async execute(dto: ListPokemonDto) {
    const offset = dto.offset || 0;
    const limit = dto.limit || 20;

    // 1. Try to search in Local Database
    const localResults = await this.pokemonRepository.list(offset, limit, dto.search);
    
    // If we have results or we strictly want local, return them
    if (localResults.length > 0 || dto.source === 'local') {
      return localResults;
    }

    // 2. If no local results and we have a search term, try PokéAPI directly
    if (dto.search) {
      const externalPokemon = await this.pokeApiService.fetchPokemon(dto.search);
      if (externalPokemon) {
        await this.pokemonRepository.save(externalPokemon);
        return [externalPokemon];
      }
      return []; // Not found anywhere
    }

    // 3. Standard listing from PokéAPI if requested or no search results
    const externalList = await this.pokeApiService.listPokemon(offset, limit);
    
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
