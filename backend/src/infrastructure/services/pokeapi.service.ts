import { PokemonEntity } from "../../domain/entities/pokemon.entity";
import { PokemonExternalService } from "../../domain/interfaces/pokemon-external.service";

export class PokeApiService implements PokemonExternalService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  private readonly speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';

  async fetchPokemon(nameOrId: string | number): Promise<PokemonEntity | null> {
    try {
      const idOrName = String(nameOrId).toLowerCase();
      
      // 1. Fetch basic data and abilities
      const response = await fetch(`${this.baseUrl}/${idOrName}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`External API error: ${response.statusText}`);
      }
      const data = await response.json();

      // 2. Fetch species data for description
      let description = 'No description available.';
      try {
        const speciesResponse = await fetch(`${this.speciesUrl}/${idOrName}`);
        if (speciesResponse.ok) {
          const speciesData = await speciesResponse.json();
          const entry = speciesData.flavor_text_entries.find(
            (e: any) => e.language.name === 'en' || e.language.name === 'es'
          );
          if (entry) {
            description = entry.flavor_text.replace(/[\n\f]/g, ' ');
          }
        }
      } catch (speciesError) {
        console.warn('Could not fetch species data:', speciesError);
      }

      // Map PokéAPI response to our Domain Entity
      const stats: Record<string, number> = {};
      data.stats.forEach((s: any) => {
        stats[s.stat.name] = s.base_stat;
      });

      return PokemonEntity.create({
        id: data.id,
        name: data.name,
        types: data.types.map((t: any) => t.type.name),
        stats: stats,
        abilities: data.abilities.map((a: any) => a.ability.name),
        description: description,
        artworkUrl: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
      });
    } catch (error) {
      console.error('Error fetching from PokéAPI:', error);
      throw error;
    }
  }

  async listPokemon(offset: number, limit: number): Promise<{ name: string; url: string }[]> {
    const response = await fetch(`${this.baseUrl}?offset=${offset}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch Pokémon list');
    const data = await response.json();
    return data.results;
  }
}
